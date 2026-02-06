import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const GEOAPIFY_API_KEY = 'bc5226dfa2ce4f208999636454b3191d';

interface GeoapifyMapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
  }>;
  userLocation?: [number, number] | null;
  targetLocation?: [number, number] | null;
  distance?: string | null;
  height?: string;
  selectedMarkerIndex?: number | null;
}

export function GeoapifyMap({ 
  center, 
  zoom = 12, 
  markers = [], 
  userLocation = null,
  targetLocation = null,
  distance = null,
  height = '100%',
  selectedMarkerIndex = null
}: GeoapifyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, time: string} | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(center, zoom);

    // Add Geoapify map tiles
    L.tileLayer(
      `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
      {
        attribution: 'Powered by Geoapify | © OpenStreetMap contributors',
        maxZoom: 20
      }
    ).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Create layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    leafletMapRef.current = map;
    markersLayerRef.current = markersLayer;
    routeLayerRef.current = routeLayer;

    return () => {
      map.remove();
    };
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (leafletMapRef.current) {
      const targetCenter = userLocation || center;
      leafletMapRef.current.setView(targetCenter, zoom);
    }
  }, [center, zoom, userLocation]);

  // Update route line when userLocation or targetLocation changes
  useEffect(() => {
    if (!routeLayerRef.current || !leafletMapRef.current) return;

    // Clear existing route
    routeLayerRef.current.clearLayers();
    setRouteInfo(null);

    // Fetch and draw route if both userLocation and targetLocation exist
    if (userLocation && targetLocation) {
      // Call Geoapify routing API
      fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${userLocation[0]},${userLocation[1]}|${targetLocation[0]},${targetLocation[1]}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`
      )
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const geometry = feature.geometry;
            const properties = feature.properties;
            
            // Extract route coordinates (GeoJSON format is [lng, lat], need to convert to [lat, lng])
            const routeCoords: L.LatLngExpression[] = geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
            
            // Draw the route line
            L.polyline(routeCoords, {
              color: '#3b82f6',
              weight: 5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(routeLayerRef.current!);
            
            // Extract distance and time
            const distanceKm = properties.distance / 1000;
            const distanceMiles = distanceKm * 0.621371;
            const timeMinutes = properties.time / 60;
            
            const distanceStr = distanceMiles < 1 
              ? `${(distanceMiles * 5280).toFixed(0)} ft`
              : `${distanceMiles.toFixed(1)} mi`;
            const timeStr = timeMinutes < 60
              ? `${Math.round(timeMinutes)} min`
              : `${Math.floor(timeMinutes / 60)}h ${Math.round(timeMinutes % 60)}m`;
            
            setRouteInfo({ distance: distanceStr, time: timeStr });
            
            // Add route info label at midpoint
            const midIndex = Math.floor(routeCoords.length / 2);
            const midPoint = routeCoords[midIndex];
            
            const infoIcon = L.divIcon({
              className: 'route-info-label',
              html: `
                <div style="
                  background-color: #3b82f6;
                  color: white;
                  padding: 6px 12px;
                  border-radius: 20px;
                  font-size: 13px;
                  font-weight: bold;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  white-space: nowrap;
                  text-align: center;
                ">
                  ${distanceStr}<br>
                  <span style="font-size: 11px; opacity: 0.9;">${timeStr}</span>
                </div>
              `,
              iconSize: [100, 40],
              iconAnchor: [50, 20]
            });

            L.marker(midPoint as L.LatLngTuple, { icon: infoIcon, interactive: false })
              .addTo(routeLayerRef.current!);
            
            // Fit bounds to show the entire route
            const bounds = L.latLngBounds(routeCoords);
            leafletMapRef.current!.fitBounds(bounds, { padding: [60, 60] });
          }
        })
        .catch(error => {
          console.error('Routing API error:', error);
          // Fallback to straight line if API fails
          const latlngs: L.LatLngExpression[] = [
            [userLocation[0], userLocation[1]],
            [targetLocation[0], targetLocation[1]]
          ];
          
          L.polyline(latlngs, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10',
            lineCap: 'round'
          }).addTo(routeLayerRef.current!);

          if (distance) {
            const midLat = (userLocation[0] + targetLocation[0]) / 2;
            const midLng = (userLocation[1] + targetLocation[1]) / 2;
            
            const distanceIcon = L.divIcon({
              className: 'distance-label',
              html: `
                <div style="
                  background-color: #3b82f6;
                  color: white;
                  padding: 4px 12px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: bold;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">${distance} mi</div>
              `,
              iconSize: [80, 30],
              iconAnchor: [40, 15]
            });

            L.marker([midLat, midLng], { icon: distanceIcon, interactive: false })
              .addTo(routeLayerRef.current!);
          }

          const bounds = L.latLngBounds([
            [userLocation[0], userLocation[1]],
            [targetLocation[0], targetLocation[1]]
          ]);
          leafletMapRef.current!.fitBounds(bounds, { padding: [50, 50] });
        });
    }
  }, [userLocation, targetLocation, distance]);

  // Update markers when they change
  useEffect(() => {
    if (!markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add resource markers
    markers.forEach((marker, index) => {
      const isSelected = selectedMarkerIndex === index;
      const customIcon = L.divIcon({
        className: `resource-marker ${isSelected ? 'selected-marker' : ''}`,
        html: `
          <div style="
            background-color: ${isSelected ? '#f59e0b' : '#ef4444'};
            width: ${isSelected ? '36px' : '24px'};
            height: ${isSelected ? '36px' : '24px'};
            border-radius: 50%;
            border: ${isSelected ? '4px' : '3px'} solid white;
            box-shadow: ${isSelected ? '0 4px 12px rgba(245, 158, 11, 0.5)' : '0 2px 6px rgba(0,0,0,0.3)'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected ? '14px' : '12px'};
            font-weight: bold;
            transition: all 0.3s ease;
            animation: ${isSelected ? 'pulse 2s infinite' : 'none'};
          ">${index + 1}</div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        `,
        iconSize: [isSelected ? 36 : 24, isSelected ? 36 : 24],
        iconAnchor: [isSelected ? 18 : 12, isSelected ? 18 : 12],
        popupAnchor: [0, isSelected ? -18 : -12]
      });

      L.marker(marker.position, { icon: customIcon })
        .bindPopup(marker.title)
        .addTo(markersLayerRef.current!);
    });

    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            background-color: #3b82f6;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 8px;
              height: 8px;
              background-color: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
      });

      L.marker(userLocation, { icon: userIcon })
        .bindPopup('Your Location')
        .addTo(markersLayerRef.current!);
    }
  }, [markers, userLocation, selectedMarkerIndex]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden' }}
      className="geoapify-map"
    />
  );
}

// Geocoding service using Geoapify
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lon, lat] = data.features[0].geometry.coordinates;
      return [lat, lon];
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Reverse geocoding
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].properties.formatted;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

// Calculate route between two points
export async function getRoute(
  from: [number, number], 
  to: [number, number],
  mode: 'drive' | 'walk' | 'bicycle' = 'drive'
): Promise<any | null> {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${from[0]},${from[1]}|${to[0]},${to[1]}&mode=${mode}&apiKey=${GEOAPIFY_API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

// Search for places nearby
export async function searchNearby(
  lat: number,
  lon: number,
  category: string,
  radius: number = 5000
): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${radius}&limit=20&apiKey=${GEOAPIFY_API_KEY}`
    );
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
