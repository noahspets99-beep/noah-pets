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
      subheadline: 'Premium pet care — we deliver across India',
      ctaLabel: 'Shop now',
      ctaHref: '/shop',
    },
  },
  {
    id: 'hs-shop-pet',
    key: 'shopByPet',
    title: 'Shop by Category',
    enabled: true,
    sortOrder: 2,
    config: {
      limit: 12,
    },
  },
  {
    id: 'hs-featured',
    key: 'featured',
    title: 'Featured Products',
    enabled: true,
    sortOrder: 3,
    config: {
      limit: 8,
      source: 'featured',
    },
  },
  {
    id: 'hs-promo',
    key: 'promo',
    title: 'Promo Banner',
    enabled: true,
    sortOrder: 4,
    config: {},
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
      title: 'For Dogs',
      subtitle: 'Food, treats, toys and gear for every good boy and girl.',
      slug: 'dogs',
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
      title: 'For Cats',
      subtitle: 'Nutrition, litter and enrichment for feline homes.',
      slug: 'cats',
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
      title: 'For Birds',
      subtitle: 'Seeds, cages and enrichment for feathered companions.',
      slug: 'birds',
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
      title: 'For Fish',
      subtitle: 'Food, tanks and water care for aquariums.',
      slug: 'fish',
    },
  },
  {
    id: 'hs-food',
    key: 'food',
    title: 'Nutrition / Food',
    enabled: true,
    sortOrder: 12,
    config: {},
  },
  {
    id: 'hs-accessories',
    key: 'accessories',
    title: 'Accessories',
    enabled: true,
    sortOrder: 13,
    config: {},
  },
  {
    id: 'hs-brands',
    key: 'brands',
    title: 'Shop by Brand',
    enabled: true,
    sortOrder: 14,
    config: {
      brands: [],
      limit: 16,
    },
  },
  {
    id: 'hs-why',
    key: 'whyChooseUs',
    title: 'Trust Features',
    enabled: true,
    sortOrder: 15,
    config: {
      points: [
        { title: 'Fast Delivery', text: 'Quick delivery to your doorstep' },
        { title: 'Secure Payments', text: 'Safe and secure checkout' },
        { title: 'Pet First', text: 'Products selected with pets in mind' },
      ],
    },
  },
  {
    id: 'hs-delivery',
    key: 'deliveryTN',
    title: 'Delivery Across India',
    enabled: true,
    sortOrder: 16,
    config: {
      freeShippingMin: 999,
      etaText: '2–5 business days across India',
    },
  },
  {
    id: 'hs-reviews',
    key: 'reviews',
    title: 'Customer Reviews',
    enabled: true,
    sortOrder: 17,
    config: {
      limit: 4,
      minRating: 4,
    },
  },
  {
    id: 'hs-care',
    key: 'careTips',
    title: 'Care Tips / Blog',
    enabled: true,
    sortOrder: 18,
    config: {
      limit: 3,
    },
  },
  {
    id: 'hs-faq',
    key: 'faq',
    title: 'FAQs',
    enabled: true,
    sortOrder: 19,
    config: {
      limit: 6,
    },
  },
  {
    id: 'hs-newsletter',
    key: 'newsletter',
    title: 'Newsletter',
    enabled: true,
    sortOrder: 20,
    config: {},
  },
]

export function cloneHomepageSections(sections = homepageSections) {
  return sections.map((s) => ({
    ...s,
    config: s.config ? JSON.parse(JSON.stringify(s.config)) : {},
  }))
}

export function mergeHomepageSections(remoteRows = []) {
  const seed = cloneHomepageSections()
  if (!Array.isArray(remoteRows) || remoteRows.length === 0) return seed

  const byId = new Map()
  const byKey = new Map()
  remoteRows.forEach((row) => {
    if (!row) return
    if (row.id) byId.set(row.id, row)
    if (row.key) byKey.set(row.key, row)
  })

  const seedIds = new Set(seed.map((s) => s.id))
  const merged = seed.map((s) => {
    const remote = byId.get(s.id) || byKey.get(s.key)
    if (!remote) return s
    const mergedConfig = {
      ...(s.config || {}),
      ...(remote.config && typeof remote.config === 'object' ? remote.config : {}),
    }
    // Priority Cities live in shippingSettings — do not keep a stale city allowlist here
    if (s.key === 'deliveryTN' && mergedConfig.cities) {
      delete mergedConfig.cities
    }
    return {
      ...s,
      ...remote,
      id: s.id,
      key: s.key,
      config: mergedConfig,
      enabled: remote.enabled !== false,
      sortOrder: Number(remote.sortOrder) || s.sortOrder,
      title: remote.title || s.title,
    }
  })

  remoteRows.forEach((row) => {
    if (!row?.id || seedIds.has(row.id)) return
    if (row.key && seed.some((s) => s.key === row.key)) return
    merged.push({
      ...row,
      config: row.config && typeof row.config === 'object' ? row.config : {},
      enabled: row.enabled !== false,
      sortOrder: Number(row.sortOrder) || merged.length + 1,
    })
  })

  return merged.sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getEnabledHomepageSections(sections = homepageSections) {
  return sections
    .filter((s) => s.enabled)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getHomepageSectionByKey(key, sections = homepageSections) {
  return sections.find((s) => s.key === key) || null
}
