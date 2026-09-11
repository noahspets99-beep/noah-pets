import { Link } from 'react-router-dom'
import { Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react'
import { formatPrice } from '../data/products'
import { useShop } from '../context/useShop'

const badgeStyles = {
  Bestseller: 'bg-accent text-white',
  New: 'bg-brand-500 text-white',
  Trending: 'bg-teal-500 text-white',
  Sale: 'bg-danger text-white',
  'Limited Stock': 'bg-ink text-white',
}

export default function ProductCard({ product, compact = false }) {
  const {
    addToCart,
    updateQuantity,
    getCartQuantity,
    toggleWishlist,
    isWishlisted,
  } = useShop()
  const quantityInCart = getCartQuantity(product.id)
  const wishlisted = isWishlisted(product.id)
  const productPath = `/product/${product.slug || product.id}`

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleDecrease = (e) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(product.id, quantityInCart - 1, null)
  }

  const handleIncrease = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-square">
        <Link to={productPath} className="block h-full w-full" aria-label={product.name}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        {product.badge && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:left-3 sm:top-3 sm:text-xs ${
              badgeStyles[product.badge] || 'bg-brand-500 text-white'
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/95 text-muted shadow-soft backdrop-blur transition hover:scale-105 hover:text-danger sm:right-3 sm:top-3"
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? 'fill-danger text-danger' : ''}`}
          />
        </button>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 sm:text-xs">
          {product.brand}
        </p>
        <h3
          className={`mt-1 font-bold leading-snug text-ink ${
            compact ? 'line-clamp-1 text-sm' : 'line-clamp-2 text-sm sm:text-[15px]'
          }`}
        >
          <Link to={productPath} className="transition hover:text-brand-700">
            {product.name}
          </Link>
        </h3>

        {!compact && (
          <p className="mt-1 line-clamp-1 text-xs text-muted">
            {product.weight && product.age
              ? `${product.weight} • ${product.age}${
                  product.flavor ? ` • ${product.flavor}` : ''
                }`
              : product.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-accent" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                  i < Math.round(product.rating)
                    ? 'fill-accent text-accent'
                    : 'text-line'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted sm:text-xs">
            {product.rating} ({product.reviews})
          </span>
        </div>

        <div className="mt-auto pt-3">
          <div className="mb-3 flex flex-wrap items-baseline gap-1.5">
            <span className="text-base font-extrabold text-ink sm:text-lg">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted line-through sm:text-sm">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-xs font-semibold text-success">
              {product.discount}% off
            </span>
          </div>

          {quantityInCart > 0 ? (
            <div className="flex w-full items-center justify-between gap-2 rounded-xl bg-brand-50 px-2 py-1.5">
              <button
                type="button"
                onClick={handleDecrease}
                aria-label={`Decrease ${product.name} quantity`}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-ink shadow-soft transition hover:bg-white active:scale-95"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-ink">
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={!product.inStock}
                aria-label={`Increase ${product.name} quantity`}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 active:scale-95 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.inStock}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
