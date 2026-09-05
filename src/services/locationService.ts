// ============================================================================
// Location Service — Fetch Indian States and Linked Cities from Open APIs
// ============================================================================
// Integrates:
// 1. CountriesNow Open API (India States & Linked Cities)
// 2. India Post Open Govt Portal API (Pincode -> State/District resolution)
// 3. Robust offline fallback data covering all 36 Indian States & Union Territories
// ============================================================================

import type { State, City } from '../types';

interface PincodePostOffice {
  Name: string;
  District: string;
  State: string;
  Pincode: string;
}

interface PincodeApiResponse {
  Status: string;
  Message: string;
  PostOffice: PincodePostOffice[] | null;
}

// Fallback Indian States & UTs (All 36)
export const FALLBACK_STATES: State[] = [
  { id: 'andaman-and-nicobar-islands', name: 'Andaman and Nicobar Islands', countryId: 'in', stateCode: 'AN' },
  { id: 'andhra-pradesh', name: 'Andhra Pradesh', countryId: 'in', stateCode: 'AP' },
  { id: 'arunachal-pradesh', name: 'Arunachal Pradesh', countryId: 'in', stateCode: 'AR' },
  { id: 'assam', name: 'Assam', countryId: 'in', stateCode: 'AS' },
  { id: 'bihar', name: 'Bihar', countryId: 'in', stateCode: 'BR' },
  { id: 'chandigarh', name: 'Chandigarh', countryId: 'in', stateCode: 'CH' },
  { id: 'chhattisgarh', name: 'Chhattisgarh', countryId: 'in', stateCode: 'CG' },
  { id: 'dadra-and-nagar-haveli-and-daman-and-diu', name: 'Dadra and Nagar Haveli and Daman and Diu', countryId: 'in', stateCode: 'DN' },
  { id: 'delhi', name: 'Delhi', countryId: 'in', stateCode: 'DL' },
  { id: 'goa', name: 'Goa', countryId: 'in', stateCode: 'GA' },
  { id: 'gujarat', name: 'Gujarat', countryId: 'in', stateCode: 'GJ' },
  { id: 'haryana', name: 'Haryana', countryId: 'in', stateCode: 'HR' },
  { id: 'himachal-pradesh', name: 'Himachal Pradesh', countryId: 'in', stateCode: 'HP' },
  { id: 'jammu-and-kashmir', name: 'Jammu and Kashmir', countryId: 'in', stateCode: 'JK' },
  { id: 'jharkhand', name: 'Jharkhand', countryId: 'in', stateCode: 'JH' },
  { id: 'karnataka', name: 'Karnataka', countryId: 'in', stateCode: 'KA' },
  { id: 'kerala', name: 'Kerala', countryId: 'in', stateCode: 'KL' },
  { id: 'ladakh', name: 'Ladakh', countryId: 'in', stateCode: 'LA' },
  { id: 'lakshadweep', name: 'Lakshadweep', countryId: 'in', stateCode: 'LD' },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh', countryId: 'in', stateCode: 'MP' },
  { id: 'maharashtra', name: 'Maharashtra', countryId: 'in', stateCode: 'MH' },
  { id: 'manipur', name: 'Manipur', countryId: 'in', stateCode: 'MN' },
  { id: 'meghalaya', name: 'Meghalaya', countryId: 'in', stateCode: 'ML' },
  { id: 'mizoram', name: 'Mizoram', countryId: 'in', stateCode: 'MZ' },
  { id: 'nagaland', name: 'Nagaland', countryId: 'in', stateCode: 'NL' },
  { id: 'odisha', name: 'Odisha', countryId: 'in', stateCode: 'OR' },
  { id: 'puducherry', name: 'Puducherry', countryId: 'in', stateCode: 'PY' },
  { id: 'punjab', name: 'Punjab', countryId: 'in', stateCode: 'PB' },
  { id: 'rajasthan', name: 'Rajasthan', countryId: 'in', stateCode: 'RJ' },
  { id: 'sikkim', name: 'Sikkim', countryId: 'in', stateCode: 'SK' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', countryId: 'in', stateCode: 'TN' },
  { id: 'telangana', name: 'Telangana', countryId: 'in', stateCode: 'TG' },
  { id: 'tripura', name: 'Tripura', countryId: 'in', stateCode: 'TR' },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', countryId: 'in', stateCode: 'UP' },
  { id: 'uttarakhand', name: 'Uttarakhand', countryId: 'in', stateCode: 'UK' },
  { id: 'west-bengal', name: 'West Bengal', countryId: 'in', stateCode: 'WB' },
];

// Fallback linked major cities by state
const FALLBACK_CITIES: Record<string, string[]> = {
  'tamil-nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Kanchipuram', 'Nagercoil', 'Dindigul', 'Hosur'],
  'karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davangere', 'Ballari', 'Shivamogga', 'Tumakuru', 'Kalaburagi', 'Udupi'],
  'maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar', 'Solapur', 'Amravati', 'Kolhapur', 'Navi Mumbai', 'Panvel'],
  'delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
  'telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar'],
  'gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar'],
  'west-bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Bardhaman'],
  'uttar-pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Noida', 'Ghaziabad', 'Prayagraj', 'Meerut', 'Bareilly'],
  'kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Palakkad'],
  'andhra-pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada'],
};

const slugify = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Memory caches
let statesCache: State[] | null = null;
const citiesCache: Map<string, City[]> = new Map();

export const locationService = {
  /**
   * Fetch all Indian States & Union Territories from Open API
   */
  async getStates(): Promise<State[]> {
    if (statesCache && statesCache.length > 0) return statesCache;

    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'India' }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

      if (data?.data?.states && Array.isArray(data.data.states)) {
        const fetchedStates: State[] = data.data.states.map((s: { name: string; state_code?: string }) => ({
          id: slugify(s.name),
          name: s.name,
          countryId: 'in',
          stateCode: s.state_code || s.name.slice(0, 2).toUpperCase(),
        }));

        if (fetchedStates.length > 0) {
          statesCache = fetchedStates;
          return fetchedStates;
        }
      }
    } catch (err) {
      console.warn('LocationService: Falling back to offline state dataset due to network/CORS error:', err);
    }

    statesCache = FALLBACK_STATES;
    return FALLBACK_STATES;
  },

  /**
   * Fetch linked cities/districts for a specific state from Open API
   */
  async getCitiesByState(stateIdOrName: string): Promise<City[]> {
    if (!stateIdOrName) return [];

    const states = await this.getStates();
    const targetState = states.find(
      (s) => s.id === stateIdOrName || s.name.toLowerCase() === stateIdOrName.toLowerCase()
    ) || FALLBACK_STATES.find(
      (s) => s.id === stateIdOrName || s.name.toLowerCase() === stateIdOrName.toLowerCase()
    );

    const stateName = targetState ? targetState.name : stateIdOrName;
    const stateId = targetState ? targetState.id : slugify(stateIdOrName);

    if (citiesCache.has(stateId)) {
      return citiesCache.get(stateId)!;
    }

    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'India', state: stateName }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const cities: City[] = data.data.map((cityName: string) => ({
          id: slugify(cityName),
          name: cityName,
          stateId,
          stateName,
        }));

        citiesCache.set(stateId, cities);
        return cities;
      }
    } catch (err) {
      console.warn(`LocationService: Falling back to offline city dataset for ${stateName}:`, err);
    }

    // Fallback lookup
    const fallbackList = FALLBACK_CITIES[stateId] || [stateName];
    const fallbackCities: City[] = fallbackList.map((cName) => ({
      id: slugify(cName),
      name: cName,
      stateId,
      stateName,
    }));

    citiesCache.set(stateId, fallbackCities);
    return fallbackCities;
  },

  /**
   * Resolve State & City directly from Pincode using India Post Open Govt Portal API
   */
  async fetchByPincode(pincode: string): Promise<{
    stateName: string;
    cityName: string;
    district: string;
    stateId: string;
    cityId: string;
  } | null> {
    const cleanPin = pincode.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) return null;

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data: PincodeApiResponse[] = await response.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length) {
        const po = data[0].PostOffice[0];
        const stateName = po.State;
        const cityName = po.District || po.Name;

        const stateId = slugify(stateName);
        const cityId = slugify(cityName);

        return {
          stateName,
          cityName,
          district: po.District,
          stateId,
          cityId,
        };
      }
    } catch (err) {
      console.error('LocationService: Error fetching pincode from India Post API:', err);
    }

    return null;
  },
};
