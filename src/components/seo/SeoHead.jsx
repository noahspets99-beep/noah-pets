import { Helmet } from 'react-helmet-async'
import { DEFAULT_SEO, STORE } from '../../config/store'
import { absoluteUrl } from '../../lib/slug'

export default function SeoHead({
  title,
  description = DEFAULT_SEO.defaultDescription,
  keywords = DEFAULT_SEO.keywords,
  canonical,
  noindex = false,
  ogType = 'website',
  ogImage,
  ogTitle,
  ogDescription,
  twitterCard = 'summary_large_image',
}) {
  const fullTitle = title
    ? title.includes(STORE.name)
      ? title
      : `${title} | ${STORE.name}`
    : DEFAULT_SEO.defaultTitle
  const url = absoluteUrl(canonical || '/')
  const image = ogImage || absoluteUrl('/image.jpeg')

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <meta property="og:site_name" content={STORE.name} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={image} />
      <meta name="geo.region" content="IN-TN" />
      <meta name="geo.placename" content="Tamil Nadu" />
    </Helmet>
  )
}
