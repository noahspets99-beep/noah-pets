import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogProvider'
import SectionHeader from './SectionHeader'

/**
 * Shop-by-category tiles from Admin categories only (Firestore).
 * Empty categories are omitted.
 */
export default function PetCategorySection() {
  const { categories, products, getProductsByCategorySlug } = useCatalog()

  const tiles = useMemo(() => {
    const active = (categories || []).filter(
      (c) => c.active !== false && c.status !== 'Inactive' && c.name,
    )
    return active.filter((cat) => {
      const slug = cat.slug || cat.id
      if (!slug) return false
      const bySlug = getProductsByCategorySlug(slug)
      if (bySlug.length > 0) return true
      const name = String(cat.name || '').trim().toLowerCase()
      return (products || []).some(
        (p) => String(p.category || '').trim().toLowerCase() === name,
      )
    })
  }, [categories, products, getProductsByCategorySlug])

  if (tiles.length === 0) return null

  return (
    <section id="shop-by-pet" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Discover"
          title="Shop By Categories"
          subtitle="Find curated collections tailored to every companion in your home."
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {tiles.map((cat, index) => {
            const slug = cat.slug || cat.id
            return (
              <Link
                key={cat.id || slug}
                to={`/products/${slug}`}
                className="group relative overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="aspect-square overflow-hidden bg-surface">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-surface" />
                  )}
                </div>
                <div className="p-3 sm:p-3.5">
                  <div className="flex items-center gap-1.5">
                    {cat.emoji ? (
                      <span className="text-base" aria-hidden="true">
                        {cat.emoji}
                      </span>
                    ) : null}
                    <h3 className="text-sm font-bold text-ink sm:text-[15px]">
                      {cat.name}
                    </h3>
                  </div>
                  {cat.description ? (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted sm:text-xs">
                      {cat.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
