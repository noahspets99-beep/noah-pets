import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shopCategories } from '../data/products'
import SectionHeader from './SectionHeader'

export default function ShopCategorySection() {
  return (
    <section className="bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Browse"
          title="Shop By Category"
          subtitle="From daily nutrition to playtime favorites — shop every aisle."
          action={
            <Link
              to="/products/dogs"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition hover:text-brand-700"
            >
              View All Categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {shopCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products/${cat.id}`}
              className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-[5/4] overflow-hidden bg-brand-50">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-3 py-3 text-center">
                <h3 className="text-sm font-bold text-ink group-hover:text-brand-700">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
