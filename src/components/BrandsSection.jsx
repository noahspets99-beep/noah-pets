import { Link } from 'react-router-dom'
import { catalogBrands } from '../data/catalog'
import SectionHeader from './SectionHeader'

export default function BrandsSection() {
  const brands = catalogBrands.slice(0, 16)

  return (
    <section className="bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Trusted names"
          title="Shop by Brand"
          subtitle="Pedigree, Royal Canin, Whiskas and house favourites — delivered across Tamil Nadu."
        />
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {brands.map((brand) => (
            <Link
              key={brand}
              to={`/search?q=${encodeURIComponent(brand)}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-lift"
            >
              {brand}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
