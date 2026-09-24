/** Shipping & GST tax settings for Noah's Pets (India) */

import {
  INDIA_STATES_AND_UTS,
  normalizePriorityCities,
} from './indiaCities.js'

/** Default priority cities — existing Tamil Nadu cities preserved. */
const DEFAULT_PRIORITY_CITIES = normalizePriorityCities([
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    slug: 'chennai',
    region: 'Chennai Metro',
    etaDays: '2–3',
    pincodePrefix: '600',
    highlights:
      'Same-day and next-day delivery options across Chennai for dog food, cat litter and everyday pet essentials.',
    sortOrder: 1,
  },
  {
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    slug: 'coimbatore',
    region: 'Western Tamil Nadu',
    etaDays: '2–4',
    pincodePrefix: '641',
    highlights:
      'Reliable courier delivery of pet food and accessories to Coimbatore, Tiruppur and surrounding towns.',
    sortOrder: 2,
  },
  {
    city: 'Madurai',
    state: 'Tamil Nadu',
    slug: 'madurai',
    region: 'Southern Tamil Nadu',
    etaDays: '3–4',
    pincodePrefix: '625',
    highlights:
      'Shop dog food, cat products and bird supplies online with delivery across Madurai and nearby districts.',
    sortOrder: 3,
  },
  {
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    slug: 'tiruchirappalli',
    region: 'Central Tamil Nadu',
    etaDays: '3–5',
    pincodePrefix: '620',
    highlights:
      'Pet supplies and packaged foods shipped to Tiruchirappalli (Trichy) with careful packing for summer heat.',
    sortOrder: 4,
  },
  {
    city: 'Salem',
    state: 'Tamil Nadu',
    slug: 'salem',
    region: 'Northern Tamil Nadu',
    etaDays: '3–5',
    pincodePrefix: '636',
    highlights:
      'Dog food, cat care and small-pet products delivered to Salem, Erode and Namakkal regions.',
    sortOrder: 5,
  },
  {
    city: 'Tirunelveli',
    state: 'Tamil Nadu',
    slug: 'tirunelveli',
    region: 'Southern Tamil Nadu',
    etaDays: '3–5',
    pincodePrefix: '627',
    highlights:
      'Order pet food and accessories online for Tirunelveli, Tenkasi and Nagercoil corridors.',
    sortOrder: 6,
  },
])

export const shippingSettings = {
  currency: 'INR',
  country: 'IN',
  primaryState: 'Tamil Nadu',
  freeShippingMinOrder: 999,
  standardShippingFee: 49,
  expressShippingFee: 99,
  expressEtaDays: '1–2',
  standardEtaDays: '2–5',
  codAvailable: true,
  codFee: 0,
  codMaxOrderValue: 10000,
  weightBased: false,
  /** All Indian states and union territories are serviceable by default. */
  serviceableStates: [...INDIA_STATES_AND_UTS],
  priorityCities: DEFAULT_PRIORITY_CITIES,
  remoteAreaSurcharge: 40,
  notes:
    "Noah's Pets delivers products across India. After handover to the courier/delivery agency, delivery is handled by that agency. Orders cannot be cancelled once payment is successfully completed.",
}

export const taxSettings = {
  country: 'IN',
  taxName: 'GST',
  pricesIncludeTax: false,
  /** Default 0% until Admin configures a rate in Shipping & Tax */
  defaultRate: 0,
  rates: [
    {
      id: 'gst-pet-food',
      name: 'Pet food (GST)',
      rate: 0,
      hsnHint: '2309',
      appliesToCategories: ['Food', 'Treats'],
      appliesToCategorySlugs: ['dog-food', 'cat-food', 'treats', 'birds', 'fish', 'small-pets'],
    },
    {
      id: 'gst-pet-accessories',
      name: 'Pet accessories & toys (GST)',
      rate: 0,
      hsnHint: '4201 / 9503',
      appliesToCategories: [
        'Toys',
        'Beds',
        'Accessories',
        'Grooming',
        'Litter & Hygiene',
        'Aquariums',
      ],
      appliesToCategorySlugs: [
        'toys',
        'beds',
        'accessories',
        'grooming',
        'litter-hygiene',
        'aquariums',
      ],
    },
  ],
  cgstSgstSplit: true,
  invoiceLabel: 'GST Invoice',
  notes:
    'Configure the default tax rate in Admin → Shipping & Tax. Checkout uses 0% until a rate is set.',
}

/** Resolve GST % for a catalog/storefront product (demo rules). */
export function getTaxRateForProduct(product) {
  if (!product) return taxSettings.defaultRate
  const slug = product.categorySlug || product.subcategorySlug || ''
  const category = product.category || ''
  for (const rule of taxSettings.rates) {
    if (
      rule.appliesToCategorySlugs?.includes(slug) ||
      rule.appliesToCategories?.includes(category)
    ) {
      return rule.rate
    }
  }
  return taxSettings.defaultRate
}

/** Shipping fee before free-shipping threshold. */
export function getShippingFee(subtotal, { express = false } = {}) {
  if (subtotal >= shippingSettings.freeShippingMinOrder) return 0
  return express
    ? shippingSettings.expressShippingFee
    : shippingSettings.standardShippingFee
}
