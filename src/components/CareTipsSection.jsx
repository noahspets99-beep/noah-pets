import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { useStoreContent } from '../context/StoreContentProvider'

export default function CareTipsSection() {
  const { blogPosts } = useStoreContent()
  const tips = blogPosts.slice(0, 4)

  if (!tips.length) return null

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Learn"
          title="Pet Care Tips"
          subtitle="Practical guidance to help you care for your pets with confidence."
          action={
            <Link
              to="/blog"
              className="text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              View all
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tips.map((tip) => (
            <Link
              key={tip.id}
              to={`/blog/${tip.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-[16/10] overflow-hidden bg-surface">
                {tip.featuredImage ? (
                  <img
                    src={tip.featuredImage}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-brand-600">
                  {tip.category}
                </span>
                <h3 className="mt-1.5 text-sm font-bold leading-snug text-ink sm:text-[15px]">
                  {tip.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted sm:text-sm">
                  {tip.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-600 transition group-hover:gap-1.5">
                  Read More
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
