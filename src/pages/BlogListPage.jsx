import { Link } from 'react-router-dom'
import { blogPosts } from '../data/blogPosts'
import SeoHead from '../components/seo/SeoHead'

export default function BlogListPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Pet Care Blog Tamil Nadu"
        description="Guides on puppy food, cat nutrition, brands and Tamil Nadu weather care from Noah's Pets."
        canonical="/blog"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Pet Care Blog
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
        Practical guides for Tamil Nadu pet parents — nutrition, brands and
        seasonal care.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="aspect-[16/10] overflow-hidden bg-surface">
              <img
                src={post.featuredImage}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {post.category}
              </p>
              <h2 className="mt-2 text-lg font-bold text-ink line-clamp-2 group-hover:text-brand-700">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-muted line-clamp-3">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
