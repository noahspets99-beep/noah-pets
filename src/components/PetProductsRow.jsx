import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogProvider'
import ProductCard from './ProductCard'
import SectionHeader from './SectionHeader'

export default function PetProductsRow({
  petType,
  title,
  subtitle,
  slug,
  limit = 8,
}) {
  const { products } = useCatalog()
  const items = products.filter((p) => p.petType === petType).slice(0, limit)

  if (!items.length) return null

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={petType}
          title={title}
          subtitle={subtitle}
          action={
            <Link
              to={`/products/${slug}`}
              className="text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              See all
            </Link>
          }
        />
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
          {items.map((product) => (
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
