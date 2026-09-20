export const STORE = {
  name: "Noah's Pets",
  tagline: 'Premium Pet Care',
  shortDescription:
    'Premium pet food, toys, grooming and accessories delivered across Tamil Nadu.',
  email: 'mailnoahspets99@gmail.com',
  phone: '+91 9710101045',
  whatsapp: '+91 9710101045',
  address: {
    line1: '35/15, S Mada St, Sarojini Nagar, Kolathur',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600099',
    country: 'India',
  },
  /** Canonical full address — use this everywhere customer-facing copy needs it. */
  fullAddress:
    '35/15, S Mada St, Sarojini Nagar, Kolathur, Chennai, Tamil Nadu 600099',
  mapsUrl:
    'https://www.google.com/maps/search/Noah%E2%80%99s%20Pets/@13.124099731445312,80.21499633789062,17z?hl=en',
  currency: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
  defaultState: 'Tamil Nadu',
  siteUrl:
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_SITE_URL) ||
    'https://noahspets.com',
  social: {
    instagram: 'https://instagram.com/noahspets',
    facebook: 'https://facebook.com/noahspets',
    youtube: 'https://youtube.com/@noahspets',
  },
}

/** Formatted store address string for UI and schema. */
export function formatStoreAddress() {
  return STORE.fullAddress
}

/** Priority Tamil Nadu cities for local SEO (useful content pages only). */
export const TN_PRIORITY_CITIES = [
  {
    slug: 'chennai',
    name: 'Chennai',
    region: 'Chennai Metro',
    highlights:
      'Same-day and next-day delivery options across Chennai for dog food, cat litter and everyday pet essentials.',
  },
  {
    slug: 'coimbatore',
    name: 'Coimbatore',
    region: 'Western Tamil Nadu',
    highlights:
      'Reliable courier delivery of pet food and accessories to Coimbatore, Tiruppur and surrounding towns.',
  },
  {
    slug: 'madurai',
    name: 'Madurai',
    region: 'Southern Tamil Nadu',
    highlights:
      'Shop dog food, cat products and bird supplies online with delivery across Madurai and nearby districts.',
  },
  {
    slug: 'tiruchirappalli',
    name: 'Tiruchirappalli',
    region: 'Central Tamil Nadu',
    highlights:
      'Pet supplies and packaged foods shipped to Tiruchirappalli (Trichy) with careful packing for summer heat.',
  },
  {
    slug: 'tirunelveli',
    name: 'Tirunelveli',
    region: 'Southern Tamil Nadu',
    highlights:
      'Order pet food and accessories online for Tirunelveli, Tenkasi and Nagercoil corridors.',
  },
  {
    slug: 'salem',
    name: 'Salem',
    region: 'Northern Tamil Nadu',
    highlights:
      'Dog food, cat care and small-pet products delivered to Salem, Erode and Namakkal regions.',
  },
]

export const TN_SERVICE_AREAS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Tirunelveli',
  'Salem',
  'Erode',
  'Vellore',
  'Thoothukudi',
  'Nagercoil',
  'Kanyakumari',
  'Thanjavur',
  'Dindigul',
  'Hosur',
  'Tiruppur',
  'Karur',
  'Sivakasi',
  'Namakkal',
  'Cuddalore',
  'Pudukkottai',
  'Villupuram',
  'Ramanathapuram',
  'Virudhunagar',
  'Dharmapuri',
  'Krishnagiri',
  'Nagapattinam',
  'Mayiladuthurai',
  'Tenkasi',
  'Ariyalur',
  'Perambalur',
  'Ranipet',
  'Tirupattur',
  'Kallakurichi',
  'Chengalpattu',
  'Kanchipuram',
  'Thiruvallur',
]

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded',
]

export const DEFAULT_SEO = {
  titleTemplate: "%s | Noah's Pets",
  defaultTitle: "Pet Food & Supplies Online in Tamil Nadu | Noah's Pets",
  defaultDescription:
    'Buy dog food, cat food, toys, litter and pet accessories online across Tamil Nadu. Fast delivery to Chennai, Coimbatore, Madurai, Tirunelveli and more.',
  keywords:
    'pet shop Tamil Nadu, pet food online Tamil Nadu, dog food online Tamil Nadu, cat food online Tamil Nadu, pet store Chennai, pet shop Coimbatore',
}

export const TN_DISTRICTS = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kanchipuram',
  'Kanyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
]
