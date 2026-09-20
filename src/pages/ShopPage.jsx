import { useMemo, useState } from 'react'
import { useCatalog } from '../context/CatalogProvider'
import ProductCard from '../components/ProductCard'
import SeoHead from '../components/seo/SeoHead'

export default function ShopPage() {
  const { products, loading } = useCatalog()
  const [sortBy, setSortBy] = useState('popular')

  const sorted = useMemo(() => {
    const list = [...(products || [])]
    if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price)
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    else list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    return list
  }, [products, sortBy])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Shop Pet Products | Noah's Pets"
        description="Browse all pet products available at Noah's Pets — food, toys, accessories and more."
        canonical="/shop"
      />

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Shop
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {loading
              ? 'Loading products…'
              : `${sorted.length} product${sorted.length === 1 ? '' : 's'} available`}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink outline-none focus:ring-4 focus:ring-brand-100"
          >
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </label>
      </header>

      {!loading && sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-semibold text-ink">No products available</p>
          <p className="mt-2 text-sm text-muted">
            Check back soon for new arrivals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
