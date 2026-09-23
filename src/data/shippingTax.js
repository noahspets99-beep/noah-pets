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
    'Noah\'s Pets delivers products across India. After handover to the courier/delivery agency, delivery is handled by that agency. Orders cannot be cancelled once payment is successfully completed.',
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
