import { Star } from 'lucide-react'
import { reviews } from '../data/products'
import SectionHeader from './SectionHeader'

export default function ReviewsSection() {
  return (
    <section className="bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          align="center"
          eyebrow="Social proof"
          title="What Pet Parents Say"
          subtitle="Real stories from families who shop with Noah’s Pets."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-ink">{review.name}</h3>
                  <p className="text-xs text-muted">
                    {review.petType}
                    {review.petName ? ` · ${review.petName}` : ''}
                  </p>
                </div>
              </div>

              <div
                className="mt-3 flex gap-0.5 text-accent"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating
                        ? 'fill-accent text-accent'
                        : 'text-line'
                    }`}
                  />
                ))}
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                “{review.review}”
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
