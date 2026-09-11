export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Noah's Pets",
    url: 'https://noahspets.com',
    logo: 'https://noahspets.com/favicon.svg',
    email: 'noahspets99@gmail.com',
    telephone: '+91-98765-43210',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '42 Pet Care Avenue, T. Nagar',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600017',
      addressCountry: 'IN',
    },
    areaServed: {
      '@type': 'State',
      name: 'Tamil Nadu',
    },
    sameAs: [
      'https://instagram.com/noahspets',
      'https://facebook.com/noahspets',
    ],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "Noah's Pets",
    url: 'https://noahspets.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://noahspets.com/search?q={search_term_string}',
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
    (selectedVariant ? selectedVariant.stock > 0 : product.inStock)
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
      url: `https://noahspets.com/product/${product.slug}`,
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
    name: "Noah's Pets",
    image: 'https://noahspets.com/favicon.svg',
    telephone: '+91-98765-43210',
    email: 'noahspets99@gmail.com',
    url: 'https://noahspets.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '42 Pet Care Avenue, T. Nagar',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600017',
      addressCountry: 'IN',
    },
    areaServed: TN_PRIORITY.map((c) => ({
      '@type': 'City',
      name: c,
    })),
    priceRange: '₹₹',
  }
}
