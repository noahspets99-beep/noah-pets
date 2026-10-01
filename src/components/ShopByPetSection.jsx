import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogProvider'
import { petCategories } from '../data/products'
import { normalizePetType, petSlug } from '../lib/petType'
import SectionHeader from './SectionHeader'

const PET_ORDER = [
  'Dogs',
  'Cats',
  'Birds',
  'Fish',
  'Small Pets',
  'Reptiles',
  'Poultry',
  'Primate',
  'Other',
]

/**
 * Pets that already have products. Links into the existing shop listing.
 */
export default function ShopByPetSection() {
  const { products } = useCatalog()

  const tiles = useMemo(() => {
    const counts = new Map()
    for (const product of products || []) {
      const pet = normalizePetType(product.petType)
      counts.set(pet, (counts.get(pet) || 0) + 1)
    }
    return [...counts.keys()]
      .sort((a, b) => {
        const ai = PET_ORDER.indexOf(a)
        const bi = PET_ORDER.indexOf(b)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b)
      })
      .map((pet) => {
        const known = petCategories.find(
          (item) => normalizePetType(item.name) === pet,
        )
        return {
          pet,
          slug: petSlug(pet),
          image: known?.image || '',
          emoji: known?.emoji || '',
          description: known?.description || '',
        }
      })
  }, [products])

  if (tiles.length === 0) return null

  return (
    <section id="shop-by-pet" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Discover"
          title="Shop by Pet"
          subtitle="Browse products for the animals you care for."
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {tiles.map((pet, index) => (
            <Link
              key={pet.pet}
              to={`/shop?pet=${encodeURIComponent(pet.pet)}`}
              className="group relative overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="aspect-square overflow-hidden bg-surface">
                {pet.image ? (
                  <img
                    src={pet.image}
                    alt={pet.pet}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-surface" />
                )}
              </div>
              <div className="p-3 sm:p-3.5">
                <div className="flex items-center gap-1.5">
                  {pet.emoji ? (
                    <span className="text-base" aria-hidden="true">
                      {pet.emoji}
                    </span>
                  ) : null}
                  <h3 className="text-sm font-bold text-ink sm:text-[15px]">
                    {pet.pet}
                  </h3>
                </div>
                {pet.description ? (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted sm:text-xs">
                    {pet.description}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
