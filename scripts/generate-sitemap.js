/**
 * Generates public/sitemap.xml from catalog + static routes.
 * Run: node scripts/generate-sitemap.js
 * Also runs automatically before build via npm prebuild.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const siteUrl = (process.env.VITE_SITE_URL || 'https://noahspets.com').replace(
  /\/$/,
  '',
)

const { catalogProducts, catalogCategories } = await import(
  pathToFileURL(join(root, 'src/data/catalog.js')).href
)
const { blogPosts } = await import(
  pathToFileURL(join(root, 'src/data/blogPosts.js')).href
)
const { TN_PRIORITY_CITIES } = await import(
  pathToFileURL(join(root, 'src/config/store.js')).href
)

const today = new Date().toISOString().slice(0, 10)

const staticRoutes = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/about', priority: '0.6', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
  { loc: '/shipping', priority: '0.5', changefreq: 'monthly' },
  { loc: '/returns', priority: '0.5', changefreq: 'monthly' },
  { loc: '/faq', priority: '0.6', changefreq: 'monthly' },
  { loc: '/blog', priority: '0.7', changefreq: 'weekly' },
  { loc: '/search', priority: '0.4', changefreq: 'weekly' },
]

const urls = [...staticRoutes]

for (const cat of catalogCategories.filter((c) => c.active !== false)) {
  urls.push({
    loc: `/products/${cat.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
  })
}

for (const pet of ['dogs', 'cats', 'birds', 'fish', 'small-pets']) {
  if (!urls.some((u) => u.loc === `/products/${pet}`)) {
    urls.push({
      loc: `/products/${pet}`,
      priority: '0.8',
      changefreq: 'weekly',
    })
  }
}

for (const p of catalogProducts.filter((p) => p.active !== false)) {
  urls.push({
    loc: `/product/${p.slug}`,
    priority: '0.7',
    changefreq: 'weekly',
  })
}

for (const post of blogPosts) {
  urls.push({
    loc: `/blog/${post.slug}`,
    priority: '0.6',
    changefreq: 'monthly',
  })
}

for (const city of TN_PRIORITY_CITIES) {
  urls.push({
    loc: `/locations/${city.slug}`,
    priority: '0.6',
    changefreq: 'monthly',
  })
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${siteUrl}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const out = join(root, 'public', 'sitemap.xml')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, xml, 'utf8')
console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`)
