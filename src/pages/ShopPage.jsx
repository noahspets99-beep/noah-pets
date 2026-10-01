import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCatalog } from '../context/CatalogProvider'
import ProductCard from '../components/ProductCard'
import SeoHead from '../components/seo/SeoHead'
import { productMatchesPet } from '../lib/petType'

const PAGE_SIZE = 12

export default function ShopPage() {
  const { products, categories, loading, getProductsByCategorySlug } = useCatalog()
  const [params, setParams] = useSearchParams()
  const pet = params.get('pet') || ''
  const categorySlug = params.get('category') || ''
  const [sortBy, setSortBy] = useState('popular')
  const [page, setPage] = useState(1)

  const categoryOptions = useMemo(
    () =>
      (categories || []).filter(
        (c) => c && c.active !== false && c.status !== 'Inactive' && c.name,
      ),
    [categories],
  )

  const filtered = useMemo(() => {
    let list = [...(products || [])]
    if (pet) list = list.filter((p) => productMatchesPet(p, pet))
    if (categorySlug) {
      const ids = new Set(
        getProductsByCategorySlug(categorySlug).map((p) => p.id),
      )
      list = list.filter((p) => ids.has(p.id))
    }
    if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price)
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    else list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    return list
  }, [products, pet, categorySlug, sortBy, getProductsByCategorySlug])

  useEffect(() => {
    setPage(1)
  }, [pet, categorySlug, sortBy])

  const narrowed = Boolean(pet || categorySlug)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = narrowed
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filtered
  const title = pet ? pet : 'Shop'

  const setCategory = (slug) => {
    const next = new URLSearchParams(params)
    if (slug) next.set('category', slug)
    else next.delete('category')
    setParams(next)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title={pet ? `${pet} Products` : 'Shop Pet Products'}
        description={
          pet
            ? `Shop ${pet.toLowerCase()} products at Noah's Pets. We deliver across India.`
            : "Browse all pet products at Noah's Pets — food, toys, accessories and more. We deliver across India."
        }
        canonical={pet ? `/shop?pet=${encodeURIComponent(pet)}` : '/shop'}
      />

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {loading
              ? 'Loading products…'
              : `${filtered.length} product${filtered.length === 1 ? '' : 's'} available`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {narrowed ? (
            <label className="flex items-center gap-2 text-sm text-muted">
              Category
              <select
                value={categorySlug}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink outline-none focus:ring-4 focus:ring-brand-100"
              >
                <option value="">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.id || c.slug} value={c.slug || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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
        </div>
      </header>

      {!loading && filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-semibold text-ink">No products available</p>
          <p className="mt-2 text-sm text-muted">
            Check back soon for new arrivals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {narrowed && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-line px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-line px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
