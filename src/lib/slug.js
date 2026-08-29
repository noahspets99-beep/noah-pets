export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function absoluteUrl(path = '/') {
  const base = (import.meta.env.VITE_SITE_URL || 'https://noahspets.com').replace(
    /\/$/,
    '',
  )
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
