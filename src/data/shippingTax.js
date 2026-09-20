/** Shipping & GST tax settings for Noah's Pets (India demo) */

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
  serviceableStates: ['Tamil Nadu', 'Puducherry', 'Kerala', 'Karnataka', 'Andhra Pradesh'],
  priorityCities: [
    { city: 'Chennai', state: 'Tamil Nadu', etaDays: '2–3', pincodePrefix: '600' },
    { city: 'Coimbatore', state: 'Tamil Nadu', etaDays: '2–4', pincodePrefix: '641' },
    { city: 'Madurai', state: 'Tamil Nadu', etaDays: '3–4', pincodePrefix: '625' },
    { city: 'Tiruchirappalli', state: 'Tamil Nadu', etaDays: '3–5', pincodePrefix: '620' },
    { city: 'Salem', state: 'Tamil Nadu', etaDays: '3–5', pincodePrefix: '636' },
  ],
  remoteAreaSurcharge: 40,
  notes:
    'Standard delivery across Tamil Nadu. Free shipping on orders ₹999+. After handover to the courier/transport agency, delivery is handled by that agency. Orders cannot be cancelled once placed.',
}

export const taxSettings = {
  country: 'IN',
  taxName: 'GST',
  pricesIncludeTax: false,
  /** Demo rates for pet goods */
  defaultRate: 5,
  rates: [
    {
      id: 'gst-pet-food',
      name: 'Pet food (GST 5%)',
      rate: 5,
      hsnHint: '2309',
      appliesToCategories: ['Food', 'Treats'],
      appliesToCategorySlugs: ['dog-food', 'cat-food', 'treats', 'birds', 'fish', 'small-pets'],
    },
    {
      id: 'gst-pet-accessories',
      name: 'Pet accessories & toys (GST 12%)',
      rate: 12,
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
    'Demo storefront: pet food/treats at 5% GST; accessories, toys, beds, litter and aquariums at 12%. Confirm HSN with your CA for production.',
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
