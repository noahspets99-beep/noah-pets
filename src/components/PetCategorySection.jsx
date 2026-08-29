import { Link } from 'react-router-dom'
import { petCategories } from '../data/products'
import SectionHeader from './SectionHeader'

export default function PetCategorySection() {
  return (
    <section id="shop-by-pet" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Discover"
          title="Shop By Pet"
          subtitle="Find curated collections tailored to every companion in your home."
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {petCategories.map((cat, index) => (
            <Link
              key={cat.id}
              to={`/products/${cat.id}`}
              className="group relative overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="aspect-square overflow-hidden bg-surface">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
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
                <p className="mt-2 text-[11px] font-semibold text-brand-600">
                  {cat.count}+ products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
