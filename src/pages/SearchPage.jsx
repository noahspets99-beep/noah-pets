import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useCatalog } from '../context/CatalogProvider'
import { productMatchesPet } from '../lib/petType'
import ProductCard from '../components/ProductCard'
import SeoHead from '../components/seo/SeoHead'

function SearchInner({ initialQ, pet }) {
  const { searchProducts } = useCatalog()
  const [, setParams] = useSearchParams()
  const [input, setInput] = useState(initialQ)
  const [debounced, setDebounced] = useState(initialQ)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), 300)
    return () => clearTimeout(t)
  }, [input])

  useEffect(() => {
    const next = debounced.trim()
    if (next === (initialQ || '').trim()) return
    const nextParams = {}
    if (next) nextParams.q = next
    if (pet) nextParams.pet = pet
    setParams(nextParams, { replace: true })
  }, [debounced, initialQ, pet, setParams])

  const results = useMemo(() => {
    if (!debounced.trim()) return []
    const found = searchProducts(debounced)
    if (!pet) return found
    return found.filter((product) => productMatchesPet(product, pet))
  }, [debounced, pet, searchProducts])

  const emptyQuery = !debounced.trim()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title={
          emptyQuery
            ? 'Search Pet Products'
            : `Search: ${debounced}`
        }
        description="Search dog food, cat food, toys and pet supplies. We deliver across India."
        canonical="/search"
        noindex={emptyQuery}
      />
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Search</h1>
      <div className="relative mt-4 max-w-xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by name, brand, category, SKU..."
          className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
          aria-label="Search products"
        />
      </div>
      {emptyQuery ? (
        <p className="mt-8 text-sm text-muted">
          Try “dog food”, “Whiskas”, or “litter”. Browse{' '}
          <Link to="/products/dog-food" className="font-semibold text-brand-700">
            dog food
          </Link>{' '}
          or{' '}
          <Link to="/products/cat-food" className="font-semibold text-brand-700">
            cat food
          </Link>
          .
        </p>
      ) : results.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          No products found for “{debounced}”.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {results.length} result{results.length === 1 ? '' : 's'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const pet = params.get('pet') || ''
  return <SearchInner key={`${q}::${pet}`} initialQ={q} pet={pet} />
}
