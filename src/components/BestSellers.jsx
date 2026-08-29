import { products } from '../data/products'
import ProductCard from './ProductCard'
import SectionHeader from './SectionHeader'

export default function BestSellers() {
  const bestsellers = products.filter((p) => p.badge === 'Bestseller')

  return (
    <section className="bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Loved by pet parents"
          title="Best Sellers"
          subtitle="Top-rated picks that fly off the shelves every week."
        />

        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
          {bestsellers.map((product) => (
            <div
              key={product.id}
              className="w-[70%] max-w-[240px] shrink-0 sm:w-auto sm:max-w-none"
            >
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
