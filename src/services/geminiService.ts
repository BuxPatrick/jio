const GEMINI_API_KEY = 'AIzaSyAqpLJqD4I0lnK0xAkV3xbX8CdvbEQdWGY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export interface ResourceListing {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  website?: string;
  rating?: number;
  coordinates?: [number, number];
  image?: string;
}

export interface ResourceSearchResult {
  category: string;
  listings: ResourceListing[];
  searchQuery: string;
}

const resourceSearchQueries: Record<string, string> = {
  consulates: 'US consulates and embassies in major US cities with addresses and contact information',
  lawyers: 'immigration lawyers law firms in major US cities with addresses phone numbers ratings',
  surgeons: 'USCIS civil surgeons immigration medical exam doctors in major US cities addresses',
  shelter: 'emergency shelters homeless shelters immigrant support shelters in major US cities addresses',
  ice: 'ICE offices immigration and customs enforcement field offices locations addresses'
};

export async function searchResourcesWithGemini(category: string, userLocation?: { lat: number; lng: number }): Promise<ResourceSearchResult> {
  const baseQuery = resourceSearchQueries[category] || `${category} in United States`;
  const locationContext = userLocation 
    ? ` near coordinates ${userLocation.lat}, ${userLocation.lng}`
    : ' in major metropolitan areas like New York, Los Angeles, Chicago, Houston, San Francisco, Miami, Seattle, Boston, Washington DC';
  
  const searchQuery = `${baseQuery}${locationContext}`;

  const prompt = `
Search Google for: "${searchQuery}"

Extract and return a JSON array of up to 10 real resources with the following information for each:
- title: name of the organization/office
- description: brief description of services
- address: full street address
- city: city name
- state: state abbreviation (2 letters)
- phone: phone number if available
- website: website URL if available
- rating: rating out of 5 if available (numeric)

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "1",
    "title": "Resource Name",
    "description": "Description of services",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "phone": "(555) 123-4567",
    "website": "https://example.com",
    "rating": 4.5
  }
]

Make sure to return REAL, ACTUAL locations that exist. If you cannot find real data, return an empty array [].
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    const jsonMatch = textResponse.match(/\[\s*\{.*?\}\s*\]/s);
    
    if (!jsonMatch) {
      console.warn('Could not parse JSON from Gemini response:', textResponse);
      return { category, listings: [], searchQuery };
    }

    const listings: ResourceListing[] = JSON.parse(jsonMatch[0]);
    
    // Add IDs if missing
    const listingsWithIds = listings.map((listing, index) => ({
      ...listing,
      id: listing.id || `${category}-${index + 1}`
    }));

    return {
      category,
      listings: listingsWithIds,
      searchQuery
    };

  } catch (error) {
    console.error('Error searching with Gemini:', error);
    return { category, listings: [], searchQuery };
  }
}

// Function to geocode addresses using Geoapify
export async function geocodeResources(
  listings: ResourceListing[],
  apiKey: string
): Promise<ResourceListing[]> {
  const geocodedListings: ResourceListing[] = [];

  for (const listing of listings) {
    const fullAddress = `${listing.address}, ${listing.city}, ${listing.state}`;
    
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(fullAddress)}&apiKey=${apiKey}&limit=1`
      );
      
      if (!response.ok) {
        console.warn(`Geocoding failed for ${fullAddress}`);
        geocodedListings.push(listing);
        continue;
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        geocodedListings.push({
          ...listing,
          coordinates: [lat, lng]
        });
      } else {
        geocodedListings.push(listing);
      }
    } catch (error) {
      console.error(`Error geocoding ${fullAddress}:`, error);
      geocodedListings.push(listing);
    }
  }

  return geocodedListings;
}
