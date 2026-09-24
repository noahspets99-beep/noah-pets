/**
 * India states / UTs and major cities for Priority Cities admin.
 * Catalog is reference data for the picker — Admin can also add custom cities.
 * Storefront uses shippingSettings.priorityCities from Firestore, not this file alone.
 */

export const INDIA_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

/** Major cities by state/UT — extend freely without touching UI code. */
export const INDIA_CITIES_BY_STATE = {
  'Andaman and Nicobar Islands': ['Port Blair', 'Diglipur', 'Havelock Island'],
  'Andhra Pradesh': [
    'Visakhapatnam',
    'Vijayawada',
    'Guntur',
    'Tirupati',
    'Nellore',
    'Kurnool',
    'Rajahmundry',
    'Kakinada',
    'Anantapur',
    'Eluru',
    'Ongole',
    'Kadapa',
  ],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Pasighat', 'Naharlagun', 'Ziro'],
  Assam: [
    'Guwahati',
    'Silchar',
    'Dibrugarh',
    'Jorhat',
    'Tezpur',
    'Nagaon',
    'Tinsukia',
  ],
  Bihar: [
    'Patna',
    'Gaya',
    'Bhagalpur',
    'Muzaffarpur',
    'Purnia',
    'Darbhanga',
    'Ara',
    'Begusarai',
  ],
  Chandigarh: ['Chandigarh'],
  Chhattisgarh: [
    'Raipur',
    'Bhilai',
    'Bilaspur',
    'Korba',
    'Durg',
    'Rajnandgaon',
    'Raigarh',
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Daman',
    'Diu',
    'Silvassa',
  ],
  Delhi: [
    'New Delhi',
    'Delhi',
    'Dwarka',
    'Rohini',
    'Saket',
    'Karol Bagh',
    'Connaught Place',
  ],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  Gujarat: [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Bhavnagar',
    'Jamnagar',
    'Gandhinagar',
    'Junagadh',
    'Anand',
    'Morbi',
  ],
  Haryana: [
    'Gurugram',
    'Faridabad',
    'Panipat',
    'Ambala',
    'Hisar',
    'Karnal',
    'Rohtak',
    'Sonipat',
  ],
  'Himachal Pradesh': [
    'Shimla',
    'Dharamshala',
    'Mandi',
    'Solan',
    'Kullu',
    'Manali',
    'Hamirpur',
  ],
  'Jammu and Kashmir': [
    'Srinagar',
    'Jammu',
    'Anantnag',
    'Baramulla',
    'Udhampur',
    'Kathua',
  ],
  Jharkhand: [
    'Ranchi',
    'Jamshedpur',
    'Dhanbad',
    'Bokaro',
    'Deoghar',
    'Hazaribagh',
  ],
  Karnataka: [
    'Bengaluru',
    'Mysuru',
    'Mangaluru',
    'Hubballi',
    'Belagavi',
    'Kalaburagi',
    'Ballari',
    'Davangere',
    'Shivamogga',
    'Tumakuru',
    'Udupi',
  ],
  Kerala: [
    'Kochi',
    'Thiruvananthapuram',
    'Kozhikode',
    'Thrissur',
    'Kollam',
    'Kannur',
    'Alappuzha',
    'Palakkad',
    'Kottayam',
    'Malappuram',
  ],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Kavaratti', 'Agatti'],
  'Madhya Pradesh': [
    'Bhopal',
    'Indore',
    'Jabalpur',
    'Gwalior',
    'Ujjain',
    'Sagar',
    'Rewa',
    'Satna',
    'Ratlam',
  ],
  Maharashtra: [
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Thane',
    'Chhatrapati Sambhajinagar',
    'Aurangabad',
    'Solapur',
    'Kolhapur',
    'Amravati',
    'Navi Mumbai',
    'Kalyan',
    'Vasai-Virar',
  ],
  Manipur: ['Imphal', 'Thoubal', 'Churachandpur'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung'],
  Odisha: [
    'Bhubaneswar',
    'Cuttack',
    'Rourkela',
    'Berhampur',
    'Sambalpur',
    'Puri',
    'Balasore',
  ],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  Punjab: [
    'Ludhiana',
    'Amritsar',
    'Jalandhar',
    'Patiala',
    'Bathinda',
    'Mohali',
    'Pathankot',
  ],
  Rajasthan: [
    'Jaipur',
    'Jodhpur',
    'Udaipur',
    'Kota',
    'Ajmer',
    'Bikaner',
    'Alwar',
    'Bhilwara',
    'Sikar',
  ],
  Sikkim: ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Erode',
    'Vellore',
    'Thoothukudi',
    'Thanjavur',
    'Dindigul',
    'Tiruppur',
    'Hosur',
    'Nagercoil',
    'Kanchipuram',
    'Karur',
    'Namakkal',
    'Cuddalore',
    'Kanyakumari',
  ],
  Telangana: [
    'Hyderabad',
    'Warangal',
    'Nizamabad',
    'Karimnagar',
    'Khammam',
    'Ramagundam',
    'Mahbubnagar',
  ],
  Tripura: ['Agartala', 'Udaipur', 'Dharmanagar'],
  'Uttar Pradesh': [
    'Lucknow',
    'Kanpur',
    'Varanasi',
    'Agra',
    'Prayagraj',
    'Noida',
    'Ghaziabad',
    'Meerut',
    'Bareilly',
    'Aligarh',
    'Moradabad',
    'Gorakhpur',
    'Jhansi',
  ],
  Uttarakhand: [
    'Dehradun',
    'Haridwar',
    'Haldwani',
    'Roorkee',
    'Rishikesh',
    'Nainital',
    'Rudrapur',
  ],
  'West Bengal': [
    'Kolkata',
    'Howrah',
    'Durgapur',
    'Asansol',
    'Siliguri',
    'Kharagpur',
    'Bardhaman',
    'Malda',
  ],
}

export function slugifyCityName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function citiesForState(state) {
  const list = INDIA_CITIES_BY_STATE[state] || []
  return [...list]
}

export function searchCitiesInCatalog(query, state = '') {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  const states = state ? [state] : INDIA_STATES_AND_UTS
  const out = []
  for (const st of states) {
    for (const city of citiesForState(st)) {
      if (!q || city.toLowerCase().includes(q) || st.toLowerCase().includes(q)) {
        out.push({ city, state: st })
      }
    }
  }
  return out
}

/**
 * Normalize a priority city record (legacy TN fields + shippingTax shape).
 */
export function normalizePriorityCity(raw, index = 0) {
  if (!raw) return null
  const city = String(raw.city || raw.name || '').trim()
  if (!city) return null
  const state = String(raw.state || raw.region || '').trim() || 'India'
  const slug =
    String(raw.slug || '').trim() ||
    slugifyCityName(city) ||
    `city-${index}`
  return {
    id: raw.id || `pc-${slug}`,
    city,
    name: city,
    state,
    slug,
    region: String(raw.region || state).trim() || state,
    highlights:
      String(raw.highlights || '').trim() ||
      `Pet food, accessories and essentials delivered to ${city}, ${state}.`,
    etaDays: String(raw.etaDays || '2–5').trim() || '2–5',
    pincodePrefix: String(raw.pincodePrefix || '').trim(),
    enabled: raw.enabled !== false && raw.active !== false,
    sortOrder: Number(raw.sortOrder) || index + 1,
  }
}

export function normalizePriorityCities(list = []) {
  return (Array.isArray(list) ? list : [])
    .map((c, i) => normalizePriorityCity(c, i))
    .filter(Boolean)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
}

export function toStorefrontPriorityCity(raw) {
  const c = normalizePriorityCity(raw)
  if (!c || !c.enabled) return null
  return {
    slug: c.slug,
    name: c.name,
    region: c.region || c.state,
    highlights: c.highlights,
    state: c.state,
    etaDays: c.etaDays,
  }
}
