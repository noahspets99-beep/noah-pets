import { useMemo, useState } from 'react'
import {
  filterProducts,
  filterTabs,
  products,
  searchProducts,
} from '../data/products'
import { useShop } from '../context/useShop'
import ProductCard from './ProductCard'
import SectionHeader from './SectionHeader'

export default function FeaturedProducts() {
  const { searchQuery } = useShop()
  const [activeTab, setActiveTab] = useState('All')
  const [sortBy, setSortBy] = useState('popular')

  const filtered = useMemo(() => {
    let list = searchProducts(products, searchQuery)
    list = filterProducts(list, activeTab)

    const sorted = [...list]
    if (sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price)
    else if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    else sorted.sort((a, b) => b.reviews - a.reviews)
    return sorted
  }, [activeTab, sortBy, searchQuery])

  return (
    <section id="featured" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Bestsellers & more"
          title="Featured Products"
          subtitle="Everything your pet needs, all in one place."
          action={
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
          }
        />

        <div
          className="scrollbar-hide mb-8 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Product filters"
        >
          {filterTabs.map((tab) => {
            const active = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'bg-surface text-ink-soft hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {searchQuery.trim() && (
          <p className="mb-4 text-sm text-muted">
            Showing {filtered.length} result{filtered.length === 1 ? '' : 's'}
            {searchQuery ? ` for “${searchQuery}”` : ''}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="text-base font-semibold text-ink">
              No products found for &apos;{searchQuery || activeTab}&apos;.
            </p>
            <p className="mt-2 text-sm text-muted">
              Try another filter or clear your search.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('All')}
              className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div
            key={`${activeTab}-${sortBy}-${searchQuery}`}
            className="grid grid-cols-2 gap-3 animate-fade-in sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
