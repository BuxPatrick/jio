import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAPBOX_API_KEY = 'pk.eyJ1Ijoib21hcmlvbWFyaTIiLCJhIjoiY21sOXl3ZHY3MDhyejNlcHV4N251MGlrdyJ9.EjI_49acPBDUAWo2Y1dv4g';

interface MapboxMapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    website?: string;
  }>;
  userLocation?: [number, number] | null;
  targetLocation?: [number, number] | null;
  distance?: string | null;
  height?: string;
  selectedMarkerIndex?: number | null;
  hoveredMarkerIndex?: number | null;
  onMarkerClick?: (index: number, position: [number, number]) => void;
  onLocationFound?: (location: [number, number]) => void;
}

interface GeolocationControlOptions extends L.ControlOptions {
  onLocationFound?: (location: [number, number]) => void;
}

// Custom Geolocation Control for Leaflet (similar to Mapbox GeolocateControl)
class GeolocationControl extends L.Control {
  private onLocationFound?: (location: [number, number]) => void;
  private locating: boolean = false;

  constructor(options?: GeolocationControlOptions) {
    super({ position: 'bottomright', ...options });
    this.onLocationFound = options?.onLocationFound;
  }

  onAdd(map: L.Map): HTMLElement {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    container.style.borderRadius = '4px';
    container.style.overflow = 'hidden';
    container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    const button = L.DomUtil.create('a', '', container);
    button.href = '#';
    button.title = 'Find my location';
    button.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      background: white;
      cursor: pointer;
      transition: background 0.2s;
    `;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
      </svg>
    `;

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.background = '#f5f5f5';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = 'white';
    });

    L.DomEvent.on(button, 'click', (e) => {
      L.DomEvent.preventDefault(e);
      L.DomEvent.stopPropagation(e);

      if (this.locating) return;

      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }

      this.locating = true;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
          <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
        </svg>
      `;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: [number, number] = [latitude, longitude];

          // Center map on location
          map.setView(location, 15);

          // Call the callback
          this.onLocationFound?.(location);

          // Reset button
          this.locating = false;
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
          `;

          // Reset to normal after 2 seconds
          setTimeout(() => {
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
              </svg>
            `;
          }, 2000);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let message = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          alert(message);

          // Reset button
          this.locating = false;
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
          `;

          // Reset to normal after 2 seconds
          setTimeout(() => {
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
              </svg>
            `;
          }, 2000);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });

    return container;
  }
}

export function MapboxMap({ 
  center, 
  zoom = 12, 
  markers = [], 
  userLocation = null,
  targetLocation = null,
  distance = null,
  height = '100%',
  selectedMarkerIndex = null,
  hoveredMarkerIndex = null,
  onMarkerClick,
  onLocationFound
}: MapboxMapProps) {
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

    // Add Mapbox map tiles (Streets style)
    L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}`,
      {
        attribution: '© Mapbox © OpenStreetMap',
        maxZoom: 20,
        tileSize: 512,
        zoomOffset: -1
      }
    ).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Add geolocation control (like Mapbox GeolocateControl)
    const geolocateControl = new GeolocationControl({
      position: 'bottomright',
      onLocationFound
    });
    geolocateControl.addTo(map);

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
      // Call Mapbox Directions API
      const coordinates = `${userLocation[1]},${userLocation[0]};${targetLocation[1]},${targetLocation[0]}`;
      fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${MAPBOX_API_KEY}&geometries=geojson`
      )
        .then(response => response.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const geometry = route.geometry;
            
            // Extract route coordinates (GeoJSON format is [lng, lat], need to convert to [lat, lng])
            const routeCoords: L.LatLngExpression[] = geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
            
            // Draw the route line
            L.polyline(routeCoords, {
              color: '#3b82f6',
              weight: 5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(routeLayerRef.current!);
            
            // Extract distance and time
            const distanceMeters = route.distance;
            const distanceKm = distanceMeters / 1000;
            const distanceMiles = distanceKm * 0.621371;
            const timeSeconds = route.duration;
            const timeMinutes = timeSeconds / 60;
            
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
          console.error('Mapbox Directions API error:', error);
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
    const markerInstances: L.Marker[] = [];

    // Add resource markers
    markers.forEach((marker, index) => {
      const isSelected = selectedMarkerIndex === index;
      const isHovered = hoveredMarkerIndex === index;
      const customIcon = L.divIcon({
        className: `resource-marker ${isSelected ? 'selected-marker' : ''} ${isHovered ? 'hovered-marker' : ''}`,
        html: `
          <div style="
            background-color: ${isSelected ? '#f59e0b' : isHovered ? '#10b981' : '#ef4444'};
            width: ${isSelected || isHovered ? '36px' : '24px'};
            height: ${isSelected || isHovered ? '36px' : '24px'};
            border-radius: 50%;
            border: ${isSelected || isHovered ? '4px' : '3px'} solid white;
            box-shadow: ${isSelected ? '0 4px 12px rgba(245, 158, 11, 0.5)' : isHovered ? '0 4px 12px rgba(16, 185, 129, 0.5)' : '0 2px 6px rgba(0,0,0,0.3)'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected || isHovered ? '14px' : '12px'};
            font-weight: bold;
            transition: all 0.3s ease;
            animation: ${isSelected ? 'pulse 2s infinite' : isHovered ? 'pulse 1.5s infinite' : 'none'};
          ">${index + 1}</div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        `,
        iconSize: [isSelected || isHovered ? 36 : 24, isSelected || isHovered ? 36 : 24],
        iconAnchor: [isSelected || isHovered ? 18 : 12, isSelected || isHovered ? 18 : 12],
        popupAnchor: [0, isSelected || isHovered ? -18 : -12]
      });

      // Build detailed popup content with action buttons
      const fullAddress = [marker.address, marker.city, marker.state].filter(Boolean).join(', ');
      
      const popupContent = `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-width: 220px;
          max-width: 280px;
        ">
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 6px;
          ">${marker.title}</h3>
          
          ${fullAddress ? `<p style="
            margin: 0 0 12px 0;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.4;
          ">${fullAddress}</p>` : ''}
          
          <div style="
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
          ">
            ${marker.phone ? `
              <a href="tel:${marker.phone}" style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 12px;
                background-color: #10b981;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                transition: background-color 0.2s;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Call
              </a>
            ` : ''}
            
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress || marker.title)}', '_blank')" style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 6px 12px;
              background-color: #3b82f6;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
              Directions
            </button>
            
            ${marker.website ? `
              <a href="${marker.website}" target="_blank" rel="noopener noreferrer" style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 12px;
                background-color: #6366f1;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                transition: background-color 0.2s;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Website
              </a>
            ` : ''}
          </div>
        </div>
      `;

      const markerInstance = L.marker(marker.position, { icon: customIcon })
        .bindPopup(marker.title, { offset: [0, isSelected || isHovered ? -18 : -12] })
        .bindPopup(popupContent, { 
          maxWidth: 300,
          minWidth: 220,
          className: 'resource-popup',
          closeButton: true,
          autoClose: false,
          closeOnClick: false
        })
        .addTo(markersLayerRef.current!);
      
      // Add click handler to show detailed popup
      markerInstance.on('click', () => {
        markerInstance.openPopup();
        onMarkerClick?.(index, marker.position);
      });
      
      markerInstances.push(markerInstance);
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

    // Show popup for hovered marker
    if (hoveredMarkerIndex !== null && markerInstances[hoveredMarkerIndex]) {
      markerInstances[hoveredMarkerIndex].openPopup();
    }
  }, [markers, userLocation, selectedMarkerIndex, hoveredMarkerIndex]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden' }}
      className="mapbox-map"
    />
  );
}

// Geocoding service using Mapbox
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_API_KEY}`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lon, lat] = data.features[0].center;
      return [lat, lon];
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Reverse geocoding using Mapbox
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_API_KEY}`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

// Calculate route between two points using Mapbox
export async function getRoute(
  from: [number, number], 
  to: [number, number],
  mode: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<any | null> {
  try {
    const coordinates = `${from[1]},${from[0]};${to[1]},${to[0]}`;
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/${mode}/${coordinates}?access_token=${MAPBOX_API_KEY}&geometries=geojson`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

// Search for places nearby using Mapbox
export async function searchNearby(
  lat: number,
  lon: number,
  query: string,
  radius: number = 5000
): Promise<any[]> {
  try {
    // Mapbox doesn't have a direct "nearby" search like Geoapify, 
    // but we can use the geocoding API with proximity
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=${lon},${lat}&access_token=${MAPBOX_API_KEY}`
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
