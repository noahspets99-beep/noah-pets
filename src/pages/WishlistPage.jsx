import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useShop } from '../context/useShop'
import { useCatalog } from '../context/CatalogProvider'
import ProductCard from '../components/ProductCard'
import SeoHead from '../components/seo/SeoHead'

export default function WishlistPage() {
  const { wishlist } = useShop()
  const { products } = useCatalog()

  // Resolve wishlist IDs against live catalog so stock/variants match PDP & Admin inventory
  const items = useMemo(() => {
    return wishlist
      .map((saved) => {
        if (!saved?.id && !saved?.slug) return null
        const live =
          products.find((p) => p.id === saved.id) ||
          (saved.slug
            ? products.find((p) => p.slug === saved.slug)
            : null)
        return live || saved
      })
      .filter(Boolean)
  }, [wishlist, products])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead title="Wishlist" noindex canonical="/wishlist" />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Wishlist</h1>
      <p className="mt-2 text-sm text-muted">
        Saved products on this device — ready when you are.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <Heart className="mx-auto h-10 w-10 text-brand-500" />
          <p className="mt-4 font-semibold text-ink">No saved items</p>
          <Link
            to="/products/cats"
            className="mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Discover products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
