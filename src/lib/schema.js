import { STORE, formatStoreAddress } from '../config/store'
import { isProductInStock, productStock } from '../services/catalogMapper'

const siteUrl = String(STORE.siteUrl || 'https://noahspets.com').replace(/\/$/, '')

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: STORE.name,
    url: siteUrl,
    logo: `${siteUrl}/image.jpeg`,
    email: STORE.email,
    telephone: STORE.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STORE.address.line1,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.pincode,
      addressCountry: 'IN',
    },
    areaServed: {
      '@type': 'State',
      name: 'Tamil Nadu',
    },
    sameAs: [STORE.social.instagram, STORE.social.facebook],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: STORE.name,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function productSchema(product, selectedVariant) {
  const price = selectedVariant?.price ?? product.price
  const availability =
    (selectedVariant
      ? productStock(product, selectedVariant) > 0
      : isProductInStock(product))
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.length ? product.images : [product.image],
    description: product.shortDescription || product.description,
    sku: selectedVariant?.sku || product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: String(price),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(product.rating),
            reviewCount: String(product.reviews || 1),
          },
        }
      : {}),
  }
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

const TN_PRIORITY = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Tirunelveli',
  'Salem',
]

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PetStore',
    name: STORE.name,
    image: `${siteUrl}/image.jpeg`,
    telephone: STORE.phone,
    email: STORE.email,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STORE.address.line1,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.pincode,
      addressCountry: 'IN',
    },
    description: formatStoreAddress(),
    hasMap: STORE.mapsUrl,
    areaServed: TN_PRIORITY.map((c) => ({
      '@type': 'City',
      name: c,
    })),
    priceRange: '₹₹',
  }
}
