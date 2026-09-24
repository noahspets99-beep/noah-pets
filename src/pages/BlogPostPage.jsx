import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../context/CatalogProvider'
import { useStoreContent } from '../context/StoreContentProvider'
import { toStorefrontProduct } from '../data/catalog'
import ProductCard from '../components/ProductCard'
import Breadcrumbs from '../components/seo/Breadcrumbs'
import SeoHead from '../components/seo/SeoHead'
import NotFoundPage from './NotFoundPage'

export default function BlogPostPage() {
  const { slug } = useParams()
  const { getBlogPostBySlug, blogReady } = useStoreContent()
  const { getProductBySlug } = useCatalog()
  const post = getBlogPostBySlug(slug)

  if (blogReady && !post) return <NotFoundPage />
  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted">
        Loading post…
      </div>
    )
  }

  const relatedProducts = (post.relatedProductSlugs || [])
    .map((s) => getProductBySlug(s))
    .filter(Boolean)
    .map(toStorefrontProduct)

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title={post.seo?.title || post.title}
        description={post.seo?.description || post.excerpt}
        keywords={post.seo?.keywords || post.tags?.join(', ')}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.featuredImage}
      />
      <Breadcrumbs
        items={[
          { name: 'Home', to: '/' },
          { name: 'Blog', to: '/blog' },
          { name: post.title },
        ]}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        {post.category}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-3 text-sm text-muted">
        {post.author}
        {post.publishedAt
          ? ` · ${new Date(post.publishedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}`
          : ''}
      </p>
      {post.featuredImage ? (
        <img
          src={post.featuredImage}
          alt=""
          className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover shadow-card"
        />
      ) : null}
      <div
        className="prose-pet mt-8 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base [&_strong]:text-ink"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />

      {post.relatedCategorySlugs?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.relatedCategorySlugs.map((c) => (
            <Link
              key={c}
              to={`/products/${c}`}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand-200 hover:text-brand-700"
            >
              Shop {c.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>
      )}

      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-ink">Related products</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
