export const STORE = {
  name: "Noah's Pets",
  tagline: 'Premium Pet Care',
  shortDescription:
    'Premium pet food, toys, grooming and accessories delivered across India.',
  email: 'noahspets99@gmail.com',
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

/** Priority cities fallback for local SEO / sitemap when Firestore is empty. */
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
    // Tamil Nadu
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
  
    // Kerala
    'Thiruvananthapuram',
    'Kochi',
    'Kozhikode',
    'Thrissur',
    'Kollam',
    'Kannur',
    'Alappuzha',
    'Kottayam',
    'Palakkad',
    'Malappuram',
    'Kasaragod',
    'Pathanamthitta',
    'Idukki',
    'Wayanad',
  
    // Karnataka
    'Bengaluru',
    'Mysuru',
    'Mangaluru',
    'Hubballi',
    'Dharwad',
    'Belagavi',
    'Kalaburagi',
    'Ballari',
    'Shivamogga',
    'Tumakuru',
    'Davangere',
    'Udupi',
    'Hassan',
    'Raichur',
    'Bidar',
    'Vijayapura',
    'Chitradurga',
    'Mandya',
    'Kolar',
    'Chikkamagaluru',
  
    // Andhra Pradesh
    'Visakhapatnam',
    'Vijayawada',
    'Guntur',
    'Nellore',
    'Kurnool',
    'Tirupati',
    'Rajahmundry',
    'Kakinada',
    'Kadapa',
    'Anantapur',
    'Eluru',
    'Ongole',
    'Srikakulam',
    'Vizianagaram',
    'Machilipatnam',
    'Chittoor',
  
    // Telangana
    'Hyderabad',
    'Warangal',
    'Nizamabad',
    'Karimnagar',
    'Khammam',
    'Ramagundam',
    'Mahbubnagar',
    'Nalgonda',
    'Adilabad',
    'Suryapet',
    'Siddipet',
  
    // Maharashtra
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Aurangabad',
    'Thane',
    'Navi Mumbai',
    'Kolhapur',
    'Solapur',
    'Amravati',
    'Akola',
    'Sangli',
    'Satara',
    'Jalgaon',
    'Ahmednagar',
    'Latur',
    'Nanded',
    'Ratnagiri',
    'Dhule',
    'Chandrapur',
  
    // Gujarat
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Bhavnagar',
    'Jamnagar',
    'Gandhinagar',
    'Junagadh',
    'Anand',
    'Bharuch',
    'Vapi',
    'Navsari',
    'Morbi',
    'Mehsana',
    'Porbandar',
    'Bhuj',
  
    // Rajasthan
    'Jaipur',
    'Jodhpur',
    'Udaipur',
    'Kota',
    'Ajmer',
    'Bikaner',
    'Alwar',
    'Bharatpur',
    'Sikar',
    'Sri Ganganagar',
    'Bhilwara',
    'Chittorgarh',
    'Pali',
    'Barmer',
    'Jaisalmer',
    'Tonk',
  
    // Uttar Pradesh
    'Lucknow',
    'Kanpur',
    'Agra',
    'Varanasi',
    'Prayagraj',
    'Ghaziabad',
    'Noida',
    'Greater Noida',
    'Meerut',
    'Bareilly',
    'Aligarh',
    'Moradabad',
    'Saharanpur',
    'Gorakhpur',
    'Ayodhya',
    'Mathura',
    'Firozabad',
    'Jhansi',
    'Muzaffarnagar',
    'Rampur',
    'Gonda',
    'Bareilly',
  
    // Madhya Pradesh
    'Bhopal',
    'Indore',
    'Jabalpur',
    'Gwalior',
    'Ujjain',
    'Sagar',
    'Dewas',
    'Satna',
    'Ratlam',
    'Rewa',
    'Murwara',
    'Burhanpur',
    'Chhindwara',
    'Singrauli',
  
    // Bihar
    'Patna',
    'Gaya',
    'Bhagalpur',
    'Muzaffarpur',
    'Purnia',
    'Darbhanga',
    'Bihar Sharif',
    'Arrah',
    'Begusarai',
    'Katihar',
    'Munger',
    'Chapra',
  
    // West Bengal
    'Kolkata',
    'Howrah',
    'Durgapur',
    'Asansol',
    'Siliguri',
    'Darjeeling',
    'Kharagpur',
    'Haldia',
    'Bardhaman',
    'Malda',
  
    // Odisha
    'Bhubaneswar',
    'Cuttack',
    'Rourkela',
    'Berhampur',
    'Sambalpur',
    'Puri',
    'Balasore',
    'Baripada',
    'Jharsuguda',
    'Koraput',
  
    // Jharkhand
    'Ranchi',
    'Jamshedpur',
    'Dhanbad',
    'Bokaro',
    'Deoghar',
    'Hazaribagh',
    'Giridih',
    'Ramgarh',
  
    // Chhattisgarh
    'Raipur',
    'Bhilai',
    'Bilaspur',
    'Korba',
    'Durg',
    'Rajnandgaon',
    'Jagdalpur',
    'Ambikapur',
  
    // Punjab
    'Ludhiana',
    'Amritsar',
    'Jalandhar',
    'Patiala',
    'Bathinda',
    'Mohali',
    'Pathankot',
    'Hoshiarpur',
    'Moga',
    'Firozpur',
  
    // Haryana
    'Gurugram',
    'Faridabad',
    'Panipat',
    'Ambala',
    'Hisar',
    'Rohtak',
    'Karnal',
    'Sonipat',
    'Panchkula',
    'Yamunanagar',
    'Sirsa',
    'Rewari',
  
    // Delhi
    'New Delhi',
    'Delhi',
  
    // Uttarakhand
    'Dehradun',
    'Haridwar',
    'Rishikesh',
    'Haldwani',
    'Roorkee',
    'Nainital',
    'Rudrapur',
    'Kashipur',
  
    // Himachal Pradesh
    'Shimla',
    'Dharamshala',
    'Solan',
    'Mandi',
    'Baddi',
    'Kullu',
    'Manali',
    'Una',
  
    // Jammu & Kashmir
    'Srinagar',
    'Jammu',
    'Anantnag',
    'Baramulla',
    'Kathua',
    'Udhampur',
  
    // Goa
    'Panaji',
    'Vasco da Gama',
    'Margao',
    'Mapusa',
    'Ponda',
  
    // Assam
    'Guwahati',
    'Dibrugarh',
    'Silchar',
    'Jorhat',
    'Tezpur',
    'Nagaon',
    'Tinsukia',
  
    // Meghalaya
    'Shillong',
    'Tura',
  
    // Manipur
    'Imphal',
    'Thoubal',
  
    // Tripura
    'Agartala',
  
    // Mizoram
    'Aizawl',
  
    // Nagaland
    'Kohima',
    'Dimapur',
  
    // Arunachal Pradesh
    'Itanagar',
    'Naharlagun',
    'Tawang',
  
    // Sikkim
    'Gangtok',
  
    // Andaman and Nicobar Islands
    'Port Blair',
  
    // Chandigarh
    'Chandigarh',
  
    // Puducherry
    'Puducherry',
    'Karaikal',
  
    // Ladakh
    'Leh',
    'Kargil',
]

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Delivered',
  'Cancelled',
]

export const DEFAULT_SEO = {
  titleTemplate: "%s | Noah's Pets",
  defaultTitle: "Pet Food & Supplies Online in India | Noah's Pets",
  defaultDescription:
    "Buy dog food, cat food, toys, litter and pet accessories online. We deliver across India from Noah's Pets in Chennai.",
  keywords:
    'pet shop India, pet food online India, dog food online, cat food online, pet store Chennai, Noah Pets',
  ogImage: '/image.jpeg',
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
