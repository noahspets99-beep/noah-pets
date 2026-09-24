import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogProvider'
import { useStoreContent } from '../context/StoreContentProvider'
import { catalogBrands } from '../data/catalog'
import SectionHeader from './SectionHeader'

/**
 * Brands from Admin Brands collection when present;
 * else product brands; else catalog seed.
 */
export default function BrandsSection({ config = {} }) {
  const { products } = useCatalog()
  const { brands: adminBrands, brandsReady } = useStoreContent()
  const limit = Number(config.limit) || 16

  const brands = useMemo(() => {
    const configured = Array.isArray(config.brands)
      ? config.brands.map((b) => String(b || '').trim()).filter(Boolean)
      : []

    if (configured.length > 0) {
      return configured.slice(0, limit).map((name) => ({ name, logo: '' }))
    }

    const live = (adminBrands || [])
      .filter((b) => b && b.active !== false && b.status !== 'Inactive' && b.name)
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
      .map((b) => ({
        name: b.name,
        logo: b.logo || b.image || '',
      }))

    if (brandsReady && live.length > 0) return live.slice(0, limit)

    const fromProducts = [
      ...new Set(
        (products || [])
          .map((p) => String(p.brand || '').trim())
          .filter(Boolean),
      ),
    ]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name, logo: '' }))

    if (fromProducts.length > 0) return fromProducts.slice(0, limit)
    return catalogBrands.slice(0, limit).map((name) => ({ name, logo: '' }))
  }, [products, adminBrands, brandsReady, config.brands, limit])

  if (brands.length === 0) return null

  return (
    <section className="bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Trusted names"
          title="Shop by Brand"
          subtitle="Pedigree, Royal Canin, Whiskas and house favourites — we deliver across India."
        />
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              to={`/search?q=${encodeURIComponent(brand.name)}`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-lift"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt=""
                  className="h-5 w-5 rounded object-cover"
                />
              ) : null}
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
