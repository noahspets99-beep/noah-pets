import { Link } from 'react-router-dom'
import { petCategories } from '../data/products'
import SectionHeader from './SectionHeader'

/**
 * Predefined shop-by-pet tiles only.
 * Admin-managed Firestore categories are not listed here — they feed Featured Products filters.
 */
export default function PetCategorySection() {
  const tiles = petCategories

  return (
    <section id="shop-by-pet" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Discover"
          title="Shop By Categories"
          subtitle="Find curated collections tailored to every companion in your home."
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {tiles.map((cat, index) => (
            <Link
              key={cat.id}
              to={`/products/${cat.id}`}
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
                  <div className="flex h-full w-full items-center justify-center text-3xl">
                    {cat.emoji || '🐾'}
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base" aria-hidden="true">
                    {cat.emoji}
                  </span>
                  <h3 className="text-sm font-bold text-ink sm:text-[15px]">
                    {cat.name}
                  </h3>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted sm:text-xs">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
