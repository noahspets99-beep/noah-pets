import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogProvider'
import { accessoryCategories as seedAccessories } from '../data/products'
import SectionHeader from './SectionHeader'

const ACCESSORY_HINT =
  /collar|leash|bed|toy|bowl|groom|cloth|carrier|accessor|harness|travel|litter|scratch/i

/**
 * Accessories tiles from Admin categories when available; seed fallback otherwise.
 */
export default function AccessoriesSection() {
  const { categories } = useCatalog()

  const tiles = useMemo(() => {
    const active = (categories || []).filter(
      (c) =>
        c.active !== false &&
        c.status !== 'Inactive' &&
        c.image &&
        (ACCESSORY_HINT.test(String(c.name || '')) ||
          ACCESSORY_HINT.test(String(c.slug || '')) ||
          ACCESSORY_HINT.test(String(c.description || ''))),
    )
    if (active.length > 0) {
      return active.slice(0, 8).map((c) => ({
        id: c.id,
        name: c.name,
        image: c.image,
        slug: c.slug || c.id,
      }))
    }
    return seedAccessories.map((c) => ({
      ...c,
      slug: c.id,
    }))
  }, [categories])

  if (tiles.length === 0) return null

  return (
    <section id="accessories" className="bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Lifestyle"
          title="Everything Beyond Food"
          subtitle="Collars, beds, toys and travel gear that make everyday life better."
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {tiles.map((cat) => (
            <Link
              key={cat.id}
              to={`/products/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-line shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h3 className="text-sm font-bold text-white sm:text-base">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-white/80 sm:text-xs">
                  Shop collection
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
