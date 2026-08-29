/** Homepage section configuration for Noah's Pets storefront */

export const homepageSections = [
  {
    id: 'hs-hero',
    key: 'hero',
    title: 'Hero Banner',
    enabled: true,
    sortOrder: 1,
    config: {
      headline: "Noah's Pets",
      subheadline: 'Premium pet care delivered across Tamil Nadu',
      ctaLabel: 'Shop now',
      ctaHref: '/shop',
      secondaryCtaLabel: 'Shop by pet',
      secondaryCtaHref: '/#shop-by-pet',
    },
  },
  {
    id: 'hs-shop-pet',
    key: 'shopByPet',
    title: 'Shop by Pet',
    enabled: true,
    sortOrder: 2,
    config: {
      pets: ['Dogs', 'Cats', 'Birds', 'Fish', 'Small Pets'],
    },
  },
  {
    id: 'hs-shop-cat',
    key: 'shopByCategory',
    title: 'Shop by Category',
    enabled: true,
    sortOrder: 3,
    config: {
      limit: 8,
      categorySlugs: [
        'dog-food',
        'cat-food',
        'treats',
        'toys',
        'beds',
        'grooming',
        'litter-hygiene',
        'aquariums',
      ],
    },
  },
  {
    id: 'hs-featured',
    key: 'featured',
    title: 'Featured Products',
    enabled: true,
    sortOrder: 4,
    config: {
      limit: 8,
      source: 'featured',
    },
  },
  {
    id: 'hs-bestsellers',
    key: 'bestSellers',
    title: 'Best Sellers',
    enabled: true,
    sortOrder: 5,
    config: {
      limit: 8,
      source: 'bestseller',
    },
  },
  {
    id: 'hs-new',
    key: 'newArrivals',
    title: 'New Arrivals',
    enabled: true,
    sortOrder: 6,
    config: {
      limit: 8,
      source: 'newArrival',
    },
  },
  {
    id: 'hs-deals',
    key: 'deals',
    title: 'Deals & Offers',
    enabled: true,
    sortOrder: 7,
    config: {
      limit: 8,
      minDiscount: 20,
      badges: ['Sale'],
    },
  },
  {
    id: 'hs-dogs',
    key: 'dogProducts',
    title: 'For Dogs',
    enabled: true,
    sortOrder: 8,
    config: {
      petType: 'Dogs',
      limit: 8,
    },
  },
  {
    id: 'hs-cats',
    key: 'catProducts',
    title: 'For Cats',
    enabled: true,
    sortOrder: 9,
    config: {
      petType: 'Cats',
      limit: 8,
    },
  },
  {
    id: 'hs-birds',
    key: 'birdProducts',
    title: 'For Birds',
    enabled: true,
    sortOrder: 10,
    config: {
      petType: 'Birds',
      limit: 4,
    },
  },
  {
    id: 'hs-fish',
    key: 'fishProducts',
    title: 'For Fish',
    enabled: true,
    sortOrder: 11,
    config: {
      petType: 'Fish',
      limit: 4,
    },
  },
  {
    id: 'hs-recommended',
    key: 'recommended',
    title: 'Recommended for You',
    enabled: true,
    sortOrder: 12,
    config: {
      limit: 8,
      strategy: 'trending-and-bestsellers',
    },
  },
  {
    id: 'hs-brands',
    key: 'brands',
    title: 'Shop by Brand',
    enabled: true,
    sortOrder: 13,
    config: {
      brands: [
        'Royal Canin',
        'Pedigree',
        'Whiskas',
        'Drools',
        'Farmina',
        'PawNutrition',
        'PlayPaws',
        'Sheba',
      ],
    },
  },
  {
    id: 'hs-reviews',
    key: 'reviews',
    title: 'Customer Reviews',
    enabled: true,
    sortOrder: 14,
    config: {
      limit: 4,
      minRating: 4,
    },
  },
  {
    id: 'hs-why',
    key: 'whyChooseUs',
    title: 'Why Choose Noah\'s Pets',
    enabled: true,
    sortOrder: 15,
    config: {
      points: [
        { title: 'TN-focused delivery', text: 'Chennai, Coimbatore, Madurai & more' },
        { title: 'Genuine brands', text: 'Pedigree, Royal Canin, Whiskas & house labels' },
        { title: 'GST invoices', text: 'Transparent pricing in INR' },
        { title: 'Pet-care guidance', text: 'Guides for food, litter & grooming' },
      ],
    },
  },
  {
    id: 'hs-delivery',
    key: 'deliveryTN',
    title: 'Delivery Across Tamil Nadu',
    enabled: true,
    sortOrder: 16,
    config: {
      cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
      freeShippingMin: 999,
      etaText: '2–5 business days across Tamil Nadu',
    },
  },
  {
    id: 'hs-faq',
    key: 'faq',
    title: 'FAQs',
    enabled: true,
    sortOrder: 17,
    config: {
      limit: 6,
      source: 'faqs',
    },
  },
]

export function getEnabledHomepageSections() {
  return homepageSections
    .filter((s) => s.enabled)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getHomepageSectionByKey(key) {
  return homepageSections.find((s) => s.key === key) || null
}
