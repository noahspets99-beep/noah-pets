import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { catalogBrands } from '../data/catalog'
import { blogPosts } from '../data/blogPosts'
import { absoluteUrl } from '../lib/slug'
import { useCatalog } from '../context/CatalogProvider'
import ProductCard from '../components/ProductCard'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import SeoHead from '../components/seo/SeoHead'
import JsonLd from '../components/seo/JsonLd'
import { breadcrumbSchema } from '../lib/schema'
import NotFoundPage from './NotFoundPage'

const PET_TYPE_SLUGS = {
  dogs: 'Dogs',
  cats: 'Cats',
  birds: 'Birds',
  fish: 'Fish',
  'small-pets': 'Small Pets',
  rabbits: 'Small Pets',
}

const PAGE_SIZE = 12

export default function CategoryPage() {
  const { categorySlug } = useParams()
  const {
    categories,
    getProductsByCategorySlug,
    getProductsByPetType,
  } = useCatalog()
  const [brand, setBrand] = useState('All')
  const [sort, setSort] = useState('popular')
  const [page, setPage] = useState(1)

  const category = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categorySlug, categories],
  )

  const petType = PET_TYPE_SLUGS[categorySlug]
  const title =
    category?.name ||
    (petType
      ? petType
      : categorySlug
          ?.split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '))

  const rawProducts = useMemo(() => {
    let list = getProductsByCategorySlug(categorySlug)
    if (!list.length && petType) {
      list = getProductsByPetType(petType)
    }
    return list
  }, [categorySlug, petType, getProductsByCategorySlug, getProductsByPetType])

  const brandsInList = useMemo(() => {
    const set = new Set(rawProducts.map((p) => p.brand).filter(Boolean))
    return ['All', ...[...set].sort()]
  }, [rawProducts])

  const filtered = useMemo(() => {
    let list = [...rawProducts]
    if (brand !== 'All') list = list.filter((p) => p.brand === brand)
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-high') list.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    return list
  }, [rawProducts, brand, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const relatedCategories = categories
    .filter((c) => c.slug !== categorySlug && c.active !== false)
    .slice(0, 6)

  const relatedPosts = blogPosts
    .filter(
      (p) =>
        p.relatedCategorySlugs?.includes(categorySlug) ||
        p.tags?.some((t) =>
          String(t).toLowerCase().includes(String(title || '').toLowerCase()),
        ),
    )
    .slice(0, 3)

  if (!category && !petType && rawProducts.length === 0) {
    return <NotFoundPage />
  }

  const seoTitle =
    category?.seo?.title || `${title} Online Tamil Nadu | Noah's Pets`
  const seoDesc =
    category?.seo?.description ||
    `Shop ${title} online with delivery across Tamil Nadu. GST invoice & trusted brands.`
  const crumbItems = [
    { name: 'Home', to: '/', url: absoluteUrl('/') },
    { name: title, to: `/products/${categorySlug}`, url: absoluteUrl(`/products/${categorySlug}`) },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        keywords={category?.seo?.keywords}
        canonical={`/products/${categorySlug}`}
      />
      <JsonLd
        data={breadcrumbSchema(
          crumbItems.map(({ name, url }) => ({ name, url })),
        )}
      />
      <Breadcrumbs items={crumbItems.map(({ name, to }) => ({ name, to }))} />

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {category?.description ||
            `Browse ${title} products with doorstep delivery across Tamil Nadu.`}
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {filtered.length} product{filtered.length === 1 ? '' : 's'}
        </p>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 text-sm text-muted">
            Brand
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            >
              {brandsInList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            >
              <option value="popular">Popular</option>
              <option value="rating">Top rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </label>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <p className="font-semibold text-ink">No products found</p>
          <p className="mt-2 text-sm text-muted">
            Try another brand filter or browse related categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
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

      <section className="mt-14 border-t border-line pt-10">
        <h2 className="text-xl font-extrabold text-ink">Related categories</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {relatedCategories.map((c) => (
            <Link
              key={c.id}
              to={`/products/${c.slug}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-brand-200 hover:text-brand-700"
            >
              {c.name}
            </Link>
          ))}
          {catalogBrands.slice(0, 4).map((b) => (
            <Link
              key={b}
              to={`/search?q=${encodeURIComponent(b)}`}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-brand-700"
            >
              {b}
            </Link>
          ))}
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-ink">From the blog</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="block overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:shadow-lift"
                >
                  <img
                    src={post.featuredImage}
                    alt=""
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm font-bold text-ink line-clamp-2">
                      {post.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
