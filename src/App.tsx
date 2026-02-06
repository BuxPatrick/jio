import { useState, useEffect } from 'react'
import { 
  Home, 
  Mail, 
  Building2, 
  Scale, 
  Stethoscope, 
  BedDouble, 
  AlertTriangle, 
  MapPin,
  Star,
  Heart,
  Navigation,
  Crosshair,
  Bot,
  RefreshCw
} from 'lucide-react'
import { MapboxMap } from './components/MapboxMap.tsx'
import { VisaTab } from './components/VisaTab.tsx'
import type { ResourceListing } from './services/geminiService.ts'
import 'leaflet/dist/leaflet.css'

interface TabProps {
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}

interface ListingCardProps {
  title: string
  rating: number
  description: string
  details: string
  price: string
  period: string
  image?: string
  isSelected?: boolean
  isHovered?: boolean
  coordinates?: [number, number]
  distance?: string | null
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onDistanceClick?: () => void
}

interface MapViewProps {
  center: [number, number]
  markers: Array<{ 
    position: [number, number]; 
    title: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    website?: string;
  }>
  userLocation?: [number, number] | null
  targetLocation?: [number, number] | null
  distance?: string | null
  onListingClick?: (index: number, coordinates: [number, number]) => void
  selectedMarkerIndex?: number | null
  hoveredMarkerIndex?: number | null
}

interface ListingsLayoutProps {
  title: string
  listings: ListingCardProps[]
  mapCenter: [number, number]
  mapMarkers?: Array<{ 
    position: [number, number]; 
    title: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    website?: string;
  }>
  userLocation?: [number, number] | null
  onListingClick?: (index: number, coordinates: [number, number]) => void
}

function Tab({ label, icon, isActive, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200
        border-b-2 -mb-0.5
        ${isActive 
          ? 'border-blue-500 text-blue-600 bg-blue-50' 
          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}

function ListingCard({ title, rating, description, details, price, period, image, isSelected, isHovered, coordinates, distance, onClick, onMouseEnter, onMouseLeave, onDistanceClick }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleDistanceClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDistanceClick?.()
  }

  return (
    <div 
      className={`card cursor-pointer group transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${isHovered ? 'ring-2 ring-amber-400 shadow-lg' : ''}`} 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative w-full aspect-square rounded-md overflow-hidden mb-1 bg-gray-100">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <MapPin size={48} />
          </div>
        )}
        <button 
          title="Add to favorites"
          className="absolute top-3 right-3 bg-white/90 border-none w-8 h-8 rounded-full cursor-pointer flex items-center justify-center hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
        >
          <Heart size={16} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
        </button>
        <div className="absolute top-3 left-3 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-semibold">
          Available
        </div>
      </div>
      <div className="px-0.5">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-xs font-semibold text-gray-900">{title}</span>
          <span className="flex items-center gap-0.5 text-xs text-gray-900">
            <Star size={12} className="fill-current" /> {rating.toFixed(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-tight mb-0.5">{description}</p>
        <p className="text-xs text-gray-500 mb-0.5">{details}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-900">
            <strong>{price}</strong> {period}
          </p>
          <button
            onClick={handleDistanceClick}
            title="Check distance to this resource"
            className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
          >
            <MapPin size={12} />
            {distance ? `${distance} mi` : 'Distance'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MapView({ center, markers, userLocation, targetLocation, distance, onListingClick, selectedMarkerIndex, hoveredMarkerIndex }: MapViewProps) {
  const [isMapView, setIsMapView] = useState(false)

  return (
    <MapboxMap 
      center={center} 
      markers={markers} 
      userLocation={userLocation}
      targetLocation={targetLocation}
      distance={distance}
      selectedMarkerIndex={selectedMarkerIndex}
      hoveredMarkerIndex={hoveredMarkerIndex}
      height="100%"
    />
  )
}

function ListingsLayout({ listings, mapCenter, mapMarkers = [], userLocation, targetLocation, distance, onListingClick, listingsWithCoords, onDistanceClick, distances, selectedMarkerIndex }: Omit<ListingsLayoutProps, 'title'> & { listingsWithCoords?: ResourceListing[], onDistanceClick?: (index: number) => void, distances?: Record<number, string>, targetLocation?: [number, number] | null, distance?: string | null, selectedMarkerIndex?: number | null }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleListingClick = (index: number) => {
    setSelectedIndex(index)
    const marker = mapMarkers[index]
    if (marker && onListingClick) {
      onListingClick(index, marker.position)
    }
    // Clear any active route when clicking a different listing
    if (onDistanceClick && distances && Object.keys(distances).length > 0) {
      onDistanceClick(-1) // Signal to clear route
    }
  }

  const handleListingHover = (index: number | null) => {
    setHoveredIndex(index)
  }

  return (
    <div className="flex h-[calc(100vh-300px)] min-h-[500px]">
      {/* Left side - Listings Grid */}
      <div className="flex-1 pr-4 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {listings.map((listing, index) => (
            <ListingCard 
              key={index} 
              {...listing} 
              isSelected={selectedIndex === index}
              isHovered={hoveredIndex === index}
              coordinates={listingsWithCoords?.[index]?.coordinates}
              distance={distances?.[index] || null}
              onClick={() => handleListingClick(index)}
              onMouseEnter={() => handleListingHover(index)}
              onMouseLeave={() => handleListingHover(null)}
              onDistanceClick={() => onDistanceClick?.(index)}
            />
          ))}
        </div>
      </div>

      {/* Right side - Map */}
      <div className="w-[45%] min-w-[350px] pl-4">
        <MapView center={mapCenter} markers={mapMarkers} userLocation={userLocation} targetLocation={targetLocation} distance={distance} selectedMarkerIndex={selectedIndex} hoveredMarkerIndex={hoveredIndex} />
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('visa')

  const tabs = [
    { id: 'visa', label: 'VISA availability', icon: <Home size={18} /> },
    { id: 'resources', label: 'Resources', icon: <MapPin size={18} /> },
    { id: 'extension', label: 'Extension', icon: <Mail size={18} /> }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'visa':
        return <VisaTab />
      case 'resources':
        return <ResourcesSection />
      case 'extension':
        return <ExtensionSection />
      default:
        return null
    }
  }

  function ResourcesSection() {
    const [activeSubTab, setActiveSubTab] = useState('consulates')
    const [selectedListingCoords, setSelectedListingCoords] = useState<[number, number] | null>(null)
    const [distanceInfo, setDistanceInfo] = useState<{index: number, distance: string} | null>(null)

    // Fake user location in French Quarter, New Orleans
    const fakeUserLocation: [number, number] = [29.9583, -90.0639]

    const subTabs = [
      { id: 'consulates', label: 'Consulates', icon: <Building2 size={16} /> },
      { id: 'lawyers', label: 'Immigration Lawyers', icon: <Scale size={16} /> },
      { id: 'surgeons', label: 'Civil Surgeons', icon: <Stethoscope size={16} /> },
      { id: 'shelter', label: 'Shelter', icon: <BedDouble size={16} /> },
      { id: 'ice', label: 'ICE Status', icon: <AlertTriangle size={16} /> }
    ]

    // Haversine distance calculation
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 3959 // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    const handleDistanceClick = (index: number) => {
      if (index === -1) {
        // Clear the route
        setDistanceInfo(null)
        return
      }
      const listing = currentListings[index]
      if (listing?.coordinates) {
        const [lat, lng] = listing.coordinates
        const distance = calculateDistance(fakeUserLocation[0], fakeUserLocation[1], lat, lng)
        setDistanceInfo({ index, distance: distance.toFixed(1) })
      }
    }

    // Build distances object for all listings
    const distances: Record<number, string> = {}
    if (distanceInfo) {
      distances[distanceInfo.index] = distanceInfo.distance
    }

    // Mock data centered in New Orleans (29.9511, -90.0715)
    const newOrleansMockData: Record<string, ResourceListing[]> = {
      consulates: [
        {
          id: '1',
          title: 'New Orleans Passport Office',
          description: 'Passport processing and visa services',
          address: '3500 Canal St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-0100',
          rating: 4.5,
          coordinates: [29.9589, -90.0844],
          image: 'https://images.unsplash.com/photo-1569163139399-de41df076aa0?w=400&h=300&fit=crop'
        },
        {
          id: '2',
          title: 'Louisiana Consulate Center',
          description: 'Document authentication services',
          address: '1200 Poydras St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-0200',
          rating: 4.2,
          coordinates: [29.9467, -90.0761],
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
        },
        {
          id: '3',
          title: 'French Quarter Visa Services',
          description: 'Tourist visa assistance',
          address: '800 Decatur St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-0300',
          rating: 4.7,
          coordinates: [29.9573, -90.0640],
          image: 'https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=400&h=300&fit=crop'
        },
        {
          id: '4',
          title: 'Metairie Document Center',
          description: 'Notary and apostille services',
          address: '4500 Veterans Blvd',
          city: 'Metairie',
          state: 'LA',
          phone: '(504) 555-0400',
          rating: 4.3,
          coordinates: [29.9761, -90.1858],
          image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400&h=300&fit=crop'
        },
        {
          id: '5',
          title: 'Kenner Passport Agency',
          description: 'Expedited passport services',
          address: '1000 W Esplanade Ave',
          city: 'Kenner',
          state: 'LA',
          phone: '(504) 555-0500',
          rating: 4.1,
          coordinates: [29.9930, -90.2410],
          image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop'
        },
        {
          id: '6',
          title: 'Uptown Legal Documents',
          description: 'Immigration document preparation',
          address: '5600 Magazine St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-0600',
          rating: 4.6,
          coordinates: [29.9217, -90.1156],
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
        }
      ],
      lawyers: [
        {
          id: '1',
          title: 'Crescent City Immigration Law',
          description: 'Family and employment visas',
          address: '2100 St Charles Ave',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-1000',
          rating: 4.9,
          coordinates: [29.9356, -90.0861],
          image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop'
        },
        {
          id: '2',
          title: 'New Orleans Visa Attorneys',
          description: 'Deportation defense specialists',
          address: '333 Loyola Ave',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-1100',
          rating: 4.7,
          coordinates: [29.9517, -90.0719],
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
        },
        {
          id: '3',
          title: 'Gulf Coast Immigration Group',
          description: 'Business immigration law',
          address: '6500 Spanish Fort Blvd',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-1200',
          rating: 4.8,
          coordinates: [30.0045, -89.9631],
          image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop'
        },
        {
          id: '4',
          title: 'French Quarter Legal Aid',
          description: 'Asylum and refugee services',
          address: '600 Royal St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-1300',
          rating: 4.5,
          coordinates: [29.9583, -90.0639],
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'
        },
        {
          id: '5',
          title: 'Louisiana Immigration Partners',
          description: 'Citizenship and naturalization',
          address: '1500 Canal St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-1400',
          rating: 4.6,
          coordinates: [29.9561, -90.0756],
          image: 'https://images.unsplash.com/photo-1521791055326-215e152a5e77?w=400&h=300&fit=crop'
        }
      ],
      surgeons: [
        {
          id: '1',
          title: 'Tulane Medical Center Immigration Health',
          description: 'USCIS approved civil surgeon',
          address: '1415 Tulane Ave',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-2000',
          rating: 4.8,
          coordinates: [29.9558, -90.0753],
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop'
        },
        {
          id: '2',
          title: 'Ochsner Immigration Medical Services',
          description: 'I-693 immigration physicals',
          address: '1514 Jefferson Hwy',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-2100',
          rating: 4.7,
          coordinates: [29.9603, -90.1317],
          image: 'https://images.unsplash.com/photo-1587351021759-3e566b9166b4?w=400&h=300&fit=crop'
        },
        {
          id: '3',
          title: 'University Medical Center',
          description: 'Vaccinations and medical exams',
          address: '2000 Canal St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-2200',
          rating: 4.5,
          coordinates: [29.9592, -90.0847],
          image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300&fit=crop'
        },
        {
          id: '4',
          title: 'East Jefferson General Hospital',
          description: 'Civil surgeon services',
          address: '4200 Houma Blvd',
          city: 'Metairie',
          state: 'LA',
          phone: '(504) 555-2300',
          rating: 4.6,
          coordinates: [29.9767, -90.1822],
          image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop'
        }
      ],
      shelter: [
        {
          id: '1',
          title: 'New Orleans Rescue Mission',
          description: 'Emergency shelter and meals',
          address: '1130 Baronne St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-3000',
          rating: 4.4,
          coordinates: [29.9433, -90.0758],
          image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop'
        },
        {
          id: '2',
          title: 'Catholic Charities Archdiocese',
          description: 'Refugee resettlement services',
          address: '1000 Howard Ave',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-3100',
          rating: 4.7,
          coordinates: [29.9456, -90.0806],
          image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop'
        },
        {
          id: '3',
          title: 'Ozanam Inn',
          description: 'Homeless shelter for men',
          address: '843 Camp St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-3200',
          rating: 4.3,
          coordinates: [29.9478, -90.0708],
          image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=400&h=300&fit=crop'
        },
        {
          id: '4',
          title: 'Covenant House New Orleans',
          description: 'Youth shelter ages 16-22',
          address: '611 N Rampart St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-3300',
          rating: 4.6,
          coordinates: [29.9614, -90.0644],
          image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop'
        }
      ],
      ice: [
        {
          id: '1',
          title: 'ICE New Orleans Field Office',
          description: 'Immigration enforcement',
          address: '1250 Poydras St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-4000',
          rating: 3.8,
          coordinates: [29.9475, -90.0783],
          image: 'https://images.unsplash.com/photo-1565465295423-68c959ca3c5e?w=400&h=300&fit=crop'
        },
        {
          id: '2',
          title: 'USCIS New Orleans Office',
          description: 'Benefits and petitions processing',
          address: '365 Canal St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-4100',
          rating: 4.1,
          coordinates: [29.9519, -90.0661],
          image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop'
        },
        {
          id: '3',
          title: 'Immigration Court New Orleans',
          description: 'Removal proceedings court',
          address: '1000 Lafayette St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-4200',
          rating: 3.9,
          coordinates: [29.9489, -90.0728],
          image: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=300&fit=crop'
        },
        {
          id: '4',
          title: 'Detention Center Information Line',
          description: 'Detainee locator assistance',
          address: '1615 Poydras St',
          city: 'New Orleans',
          state: 'LA',
          phone: '(504) 555-4300',
          rating: 3.5,
          coordinates: [29.9447, -90.0822],
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop'
        }
      ]
    }

    // Convert ResourceListing to ListingCardProps
    const convertToListingCards = (listings: ResourceListing[]): ListingCardProps[] => {
      return listings.map(listing => ({
        title: listing.title,
        description: listing.description,
        details: `${listing.address}, ${listing.city}, ${listing.state}${listing.phone ? ' | ' + listing.phone : ''}`,
        price: listing.rating ? `${listing.rating}/5` : 'N/A',
        period: 'Available',
        rating: listing.rating || 0,
        image: listing.image
      }))
    }

    // Convert ResourceListing to map markers
    const convertToMapMarkers = (listings: ResourceListing[]): Array<{ position: [number, number]; title: string; phone?: string; address?: string; city?: string; state?: string; website?: string }> => {
      return listings
        .filter(listing => listing.coordinates)
        .map(listing => ({
          position: listing.coordinates!,
          title: listing.title,
          phone: listing.phone,
          address: listing.address,
          city: listing.city,
          state: listing.state,
          website: listing.website
        }))
    }

    const currentListings = newOrleansMockData[activeSubTab] || []
    const listingsToShow = convertToListingCards(currentListings)
    const mapMarkers = convertToMapMarkers(currentListings)
    
    // Center on New Orleans or selected listing
    const mapCenter = selectedListingCoords || [29.9511, -90.0715]

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Resources</h2>
            <p className="text-lg text-gray-600">Access essential immigration and support resources.</p>
          </div>
        </div>
        
        <nav className="bg-gray-100 rounded-lg border border-gray-200">
          <div className="flex flex-wrap">
            {subTabs.map((tab) => (
              <Tab
                key={tab.id}
                label={tab.label}
                icon={tab.icon}
                isActive={activeSubTab === tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id)
                  setSelectedListingCoords(null)
                  setDistanceInfo(null)
                }}
              />
            ))}
          </div>
        </nav>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <ListingsLayout
            listings={listingsToShow}
            mapCenter={mapCenter}
            mapMarkers={mapMarkers}
            userLocation={fakeUserLocation}
            targetLocation={distanceInfo ? currentListings[distanceInfo.index]?.coordinates || null : null}
            distance={distanceInfo?.distance || null}
            onListingClick={(index, coords) => {
              setSelectedListingCoords(coords)
              setDistanceInfo(null)
            }}
            listingsWithCoords={currentListings}
            onDistanceClick={handleDistanceClick}
            distances={distances}
          />
        </div>
      </div>
    )
  }

  function ExtensionSection() {
    const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([
      { text: 'Hello! How can I help you with your immigration questions today?', isUser: false }
    ])
    const [chatInput, setChatInput] = useState('')

    const newsItems = [
      { title: 'New H-1B Visa Rules Announced', date: 'Feb 5, 2025', summary: 'USCIS updates filing procedures for 2025 cap season' },
      { title: 'Green Card Processing Times Reduced', date: 'Feb 3, 2025', summary: 'Average wait times drop by 3 months for family categories' },
      { title: 'DACA Renewal Deadline Extended', date: 'Feb 1, 2025', summary: 'Recipients now have 180 days to renew applications' },
      { title: 'New Asylum Interview Procedures', date: 'Jan 28, 2025', summary: 'Asylum office implements video interview options' },
      { title: 'Employment Authorization Update', date: 'Jan 25, 2025', summary: 'Automatic EAD extensions increased to 540 days' },
    ]

    const handleSendMessage = () => {
      if (chatInput.trim()) {
        setChatMessages([...chatMessages, { text: chatInput, isUser: true }])
        setTimeout(() => {
          setChatMessages(prev => [...prev, { text: 'I understand your question. Please consult with an immigration attorney for specific legal advice.', isUser: false }])
        }, 1000)
        setChatInput('')
      }
    }

    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Extension Services</h2>
        <p className="text-lg text-gray-600">Stay informed and track your visa status.</p>
        
        <div className="grid grid-cols-3 gap-4 h-[600px]">
          {/* Left Panel - News */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-blue-500 text-white px-4 py-3 flex items-center gap-2">
              <span className="font-semibold">📰 Immigration News</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {newsItems.map((news, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">{news.title}</h4>
                  <p className="text-xs text-gray-500 mb-1">{news.date}</p>
                  <p className="text-xs text-gray-600">{news.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Panel - Visa Status */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-green-500 text-white px-4 py-3 flex items-center gap-2">
              <span className="font-semibold">📋 Visa Status Tracker</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter USCIS receipt number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                  <button className="mt-2 w-full bg-green-500 text-white py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
                    Check Status
                  </button>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">Recent Applications</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">I-485 Adjustment</p>
                        <p className="text-xs text-gray-500">Receipt: NBC1234567890</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Pending</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">EAD Renewal</p>
                        <p className="text-xs text-gray-500">Receipt: EAC9876543210</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Approved</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">I-130 Petition</p>
                        <p className="text-xs text-gray-500">Receipt: IOE1234567890</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">In Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Bot */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-purple-500 text-white px-4 py-3 flex items-center gap-2">
              <span className="font-semibold">🤖 Immigration Assistant</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    msg.isUser ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Code2040</h1>
          <p className="text-gray-600">Modern web experience with three main tabs</p>
        </header>

        <nav className="bg-white rounded-t-lg border border-gray-200 border-b-0">
          <div className="flex">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                label={tab.label}
                icon={tab.icon}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </nav>

        <main className="bg-white rounded-b-lg border border-gray-200 border-t-0 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
