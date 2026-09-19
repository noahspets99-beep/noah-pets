import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  X,
  ZoomIn,
} from 'lucide-react'
import {
  formatPrice,
  toStorefrontProduct,
} from '../data/catalog'
import { absoluteUrl } from '../lib/slug'
import { useCatalog } from '../context/CatalogProvider'
import { useShop } from '../context/useShop'
import {
  firstAvailableVariant,
  isProductInStock,
  productStock,
} from '../services/catalogMapper'
import ProductCard from '../components/ProductCard'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import SeoHead from '../components/seo/SeoHead'
import JsonLd from '../components/seo/JsonLd'
import { breadcrumbSchema, productSchema } from '../lib/schema'
import NotFoundPage from './NotFoundPage'

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'specs', label: 'Specs' },
  { id: 'usage', label: 'Usage' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'returns', label: 'Returns' },
]

const PLACEHOLDER_REVIEWS = [
  {
    name: 'Karthik S.',
    city: 'Chennai',
    rating: 5,
    text: 'Arrived fresh and well packed. My Lab finished the first bowl happily.',
  },
  {
    name: 'Divya R.',
    city: 'Coimbatore',
    rating: 4,
    text: 'Good value pack size for TN summers — we store it airtight and it stays fine.',
  },
  {
    name: 'Mohammed A.',
    city: 'Madurai',
    rating: 5,
    text: 'GST invoice was clear. Delivery took 3 days as promised.',
  },
]

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isWishlisted } = useShop()
  const { products, getProductBySlug } = useCatalog()
  const product = useMemo(
    () => getProductBySlug(slug),
    [slug, getProductBySlug],
  )

  const [activeImage, setActiveImage] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('description')
  const [variantId, setVariantId] = useState(null)

  const selectedVariant =
    product?.variants?.find((v) => v.id === variantId) ||
    firstAvailableVariant(product)

  if (!product) return <NotFoundPage />

  const images =
    product.images?.length > 0
      ? product.images
      : [product.image].filter(Boolean)
  const price = selectedVariant?.price ?? product.price
  const mrp = selectedVariant?.mrp ?? product.originalPrice
  const stock = productStock(product, selectedVariant)
  const inStock = isProductInStock(product, selectedVariant)
  const discount =
    mrp && price
      ? Math.round(((mrp - price) / mrp) * 100)
      : product.discount
  const wishlisted = isWishlisted(product.id)
  const storefront = toStorefrontProduct(product)

  const related = (product.relatedIds || [])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)

  const fbt = (product.frequentlyBoughtWith || [])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)

  const crumbs = [
    { name: 'Home', to: '/', url: absoluteUrl('/') },
    {
      name: product.category || product.petType,
      to: `/products/${product.categorySlug || product.petType.toLowerCase()}`,
      url: absoluteUrl(
        `/products/${product.categorySlug || product.petType.toLowerCase()}`,
      ),
    },
    {
      name: product.name,
      to: `/product/${product.slug}`,
      url: absoluteUrl(`/product/${product.slug}`),
    },
  ]

  const handleAdd = () => {
    addToCart(storefront, { quantity: qty, variant: selectedVariant })
  }

  const handleBuyNow = () => {
    const ok = addToCart(storefront, { quantity: qty, variant: selectedVariant })
    if (ok !== false) navigate('/checkout')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title={product.seo?.title || product.name}
        description={
          product.seo?.description ||
          product.shortDescription ||
          product.description
        }
        keywords={product.seo?.keywords || product.keywords?.join(', ')}
        canonical={`/product/${product.slug}`}
        ogType="product"
        ogImage={product.image}
        ogTitle={product.seo?.ogTitle}
        ogDescription={product.seo?.ogDescription}
      />
      <JsonLd
        data={[
          breadcrumbSchema(crumbs.map(({ name, url }) => ({ name, url }))),
          productSchema(product, selectedVariant),
        ]}
      />
      <Breadcrumbs items={crumbs.map(({ name, to }) => ({ name, to }))} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
          >
            <img
              src={images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-soft">
              <ZoomIn className="h-3.5 w-3.5" /> Zoom
            </span>
          </button>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                    i === activeImage ? 'border-brand-500' : 'border-line'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {product.video ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-line">
              <video
                src={product.video}
                controls
                className="aspect-video w-full bg-ink"
              />
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {product.brand}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-0.5 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating)
                      ? 'fill-accent text-accent'
                      : 'text-line'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted">
              {product.rating} ({product.reviews} reviews)
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                inStock
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              }`}
            >
              {inStock ? `In stock${stock != null ? ` · ${stock}` : ''}` : 'Out of stock'}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-extrabold text-ink">
              {formatPrice(price)}
            </span>
            {mrp > price && (
              <>
                <span className="text-base text-muted line-through">
                  {formatPrice(mrp)}
                </span>
                <span className="text-sm font-semibold text-success">
                  {discount}% off
                </span>
              </>
            )}
          </div>
          <p className="mt-2 text-sm text-muted">MRP inclusive of applicable GST demo rates.</p>

          {product.variants?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-ink">Select size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={productStock(product, v) < 1}
                    onClick={() => setVariantId(v.id)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      selectedVariant?.id === v.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-line bg-white text-ink hover:border-brand-200'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="rounded-lg p-2 hover:bg-white"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-bold">{qty}</span>
              <button
                type="button"
                onClick={() =>
                  setQty((q) => Math.min(stock || 99, q + 1))
                }
                className="rounded-lg p-2 hover:bg-white"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={!inStock}
              onClick={handleAdd}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50 sm:flex-none"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
            <button
              type="button"
              disabled={!inStock}
              onClick={handleBuyNow}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-ink bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-ink/90 disabled:opacity-50 sm:flex-none"
            >
              Buy Now
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(storefront)}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border transition ${
                wishlisted
                  ? 'border-danger/30 bg-red-50 text-danger'
                  : 'border-line text-muted hover:text-danger'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-danger' : ''}`} />
            </button>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {product.shortDescription}
          </p>
        </div>
      </div>

      <div className="mt-12">
        <div className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === t.id
                  ? 'border-brand-500 text-brand-700'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="rounded-b-2xl border border-t-0 border-line bg-white p-5 text-sm leading-relaxed text-ink-soft sm:p-6">
          {tab === 'description' && <p>{product.description}</p>}
          {tab === 'benefits' && (
            <ul className="list-disc space-y-2 pl-5">
              {(product.benefits || ['Quality you can trust for everyday pet care.']).map(
                (b) => (
                  <li key={b}>{b}</li>
                ),
              )}
            </ul>
          )}
          {tab === 'ingredients' && (
            <p>{product.ingredients || 'See pack label for full ingredient list.'}</p>
          )}
          {tab === 'specs' && (
            <dl className="grid gap-3 sm:grid-cols-2">
              {(product.specifications || []).map((s) => (
                <div key={s.key} className="rounded-xl bg-surface px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {s.key}
                  </dt>
                  <dd className="mt-1 font-semibold text-ink">{s.value}</dd>
                </div>
              ))}
              {!product.specifications?.length && (
                <p>Specifications available on product packaging.</p>
              )}
            </dl>
          )}
          {tab === 'usage' && (
            <p>
              {product.usageInstructions ||
                'Follow the feeding or usage guide on the pack. Fresh water should always be available for pets.'}
            </p>
          )}
          {tab === 'delivery' && (
            <p>
              Standard delivery across Tamil Nadu in 2–5 business days. Free
              shipping on orders ₹999+. Express options may be available in
              Chennai metro pin codes.
            </p>
          )}
          {tab === 'returns' && (
            <p>
              Unopened items in original packaging can be returned within 7 days.
              Opened food, treats and hygiene products are non-returnable.
              Damaged shipments — contact us within 48 hours with photos.
            </p>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-ink">Customer reviews</h2>
        <ul className="mt-4 space-y-3">
          {PLACEHOLDER_REVIEWS.map((r) => (
            <li
              key={r.name}
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-ink">
                  {r.name}{' '}
                  <span className="font-normal text-muted">· {r.city}</span>
                </p>
                <span className="text-xs font-semibold text-accent">
                  {r.rating}/5
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{r.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {fbt.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-ink">
            Frequently bought together
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {fbt.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-ink">Related products</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 text-sm text-muted">
        Looking for more? Browse{' '}
        <Link
          to={`/products/${product.categorySlug || 'dogs'}`}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          {product.category || 'this category'}
        </Link>{' '}
        or{' '}
        <Link to="/blog" className="font-semibold text-brand-600 hover:text-brand-700">
          pet care guides
        </Link>
        .
      </p>

      {lightbox && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close"
            onClick={() => setLightbox(false)}
          />
          <div className="relative max-h-full max-w-3xl">
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-2 shadow-lift"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={images[activeImage]}
              alt={product.name}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
