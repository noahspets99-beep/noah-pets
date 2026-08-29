import {
  catalogProducts,
  formatPrice,
  filterProducts,
  searchProducts,
  toStorefrontProduct,
} from './catalog'

export const products = catalogProducts.map(toStorefrontProduct)

export { formatPrice, filterProducts, searchProducts }

export const petCategories = [
  {
    id: 'dogs',
    name: 'Dogs',
    description: 'Food, toys, grooming & more',
    count: 1280,
    image:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop',
    emoji: '🐶',
  },
  {
    id: 'cats',
    name: 'Cats',
    description: 'Everything your cat needs',
    count: 960,
    image:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=500&fit=crop',
    emoji: '🐱',
  },
  {
    id: 'rabbits',
    name: 'Rabbits',
    description: 'Hay, toys & cozy habitats',
    count: 210,
    image:
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&h=500&fit=crop',
    emoji: '🐰',
  },
  {
    id: 'birds',
    name: 'Birds',
    description: 'Seeds, cages & enrichment',
    count: 180,
    image:
      'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&h=500&fit=crop',
    emoji: '🐦',
  },
  {
    id: 'small-pets',
    name: 'Small Pets',
    description: 'Hamsters, guinea pigs & more',
    count: 145,
    image:
      'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=500&h=500&fit=crop',
    emoji: '🐹',
  },
  {
    id: 'fish',
    name: 'Fish',
    description: 'Food, tanks & water care',
    count: 320,
    image:
      'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&h=500&fit=crop',
    emoji: '🐠',
  },
]

export const shopCategories = [
  {
    id: 'dog-food',
    name: 'Dog Food',
    image:
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
  },
  {
    id: 'cat-food',
    name: 'Cat Food',
    image:
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
  },
  {
    id: 'treats',
    name: 'Treats',
    image:
      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=400&fit=crop',
  },
  {
    id: 'toys',
    name: 'Toys',
    image:
      'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop',
  },
  {
    id: 'beds',
    name: 'Beds',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop',
  },
  {
    id: 'collars',
    name: 'Collars',
    image:
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400&h=400&fit=crop',
  },
  {
    id: 'leashes',
    name: 'Leashes',
    image:
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop',
  },
  {
    id: 'grooming',
    name: 'Grooming',
    image:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=400&fit=crop',
  },
  {
    id: 'bowls',
    name: 'Bowls',
    image:
      'https://images.unsplash.com/photo-1589883661923-cd1fdb40ac8b?w=400&h=400&fit=crop',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop',
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    image:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
  },
  {
    id: 'clothing',
    name: 'Pet Clothing',
    image:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop',
  },
]

export const accessoryCategories = [
  {
    id: 'collars',
    name: 'Collars',
    image:
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400&h=300&fit=crop',
  },
  {
    id: 'leashes',
    name: 'Leashes',
    image:
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop',
  },
  {
    id: 'beds',
    name: 'Beds',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
  },
  {
    id: 'toys',
    name: 'Toys',
    image:
      'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=300&fit=crop',
  },
  {
    id: 'bowls',
    name: 'Bowls',
    image:
      'https://images.unsplash.com/photo-1589883661923-cd1fdb40ac8b?w=400&h=300&fit=crop',
  },
  {
    id: 'grooming',
    name: 'Grooming',
    image:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=300&fit=crop',
  },
  {
    id: 'clothing',
    name: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop',
  },
  {
    id: 'carriers',
    name: 'Carriers',
    image:
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop',
  },
]

export const reviews = [
  {
    id: 1,
    name: 'Ananya Sharma',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    petType: 'Dog Parent',
    petName: 'Bruno',
    rating: 5,
    review:
      'Bruno absolutely loves the orthopedic bed. Delivery was quick and the quality feels premium. Noah’s Pets has become our go-to store.',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    petType: 'Cat Parent',
    petName: 'Mochi',
    rating: 5,
    review:
      'Finally found kitten food that Mochi finishes every bowl. Packaging, freshness, and checkout experience were all excellent.',
  },
  {
    id: 3,
    name: 'Priya Nair',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop',
    petType: 'Multi-Pet Parent',
    petName: 'Coco & Luna',
    rating: 4,
    review:
      'Great variety for both dogs and cats. The offers section saved us money on treats and litter without compromising quality.',
  },
  {
    id: 4,
    name: 'Arjun Patel',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop',
    petType: 'Dog Parent',
    petName: 'Rocky',
    rating: 5,
    review:
      'The grooming brush made shedding season so much easier. Love the clean UI and how easy it is to reorder favorites.',
  },
]

export const careTips = [
  {
    id: 1,
    category: 'Nutrition',
    title: 'How to choose the right dog food',
    description:
      'Match age, breed size, and activity level for healthier meals your dog will thrive on.',
    image:
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=400&fit=crop',
  },
  {
    id: 2,
    category: 'Play',
    title: 'Best toys for indoor cats',
    description:
      'Keep curious cats entertained with puzzle feeders, wands, and scratching enrichment.',
    image:
      'https://images.unsplash.com/photo-1495360010541-10034684506f?w=600&h=400&fit=crop',
  },
  {
    id: 3,
    category: 'Grooming',
    title: 'How often should you groom your pet?',
    description:
      'A simple weekly routine can reduce shedding, improve coat health, and catch skin issues early.',
    image:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=400&fit=crop',
  },
  {
    id: 4,
    category: 'Puppy Care',
    title: 'Essential products for a new puppy',
    description:
      'From crates to chew toys — the starter checklist every new puppy parent needs.',
    image:
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop',
  },
]

export const filterTabs = [
  'All',
  'Dogs',
  'Cats',
  'Food',
  'Toys',
  'Accessories',
  'Grooming',
]

export const foodTabs = ['Dog Food', 'Cat Food', 'Treats']
