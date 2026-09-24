import { Star } from 'lucide-react'
import { isFirebaseConfigured } from '../services/firestore/repository'
import { useStoreContent } from '../context/StoreContentProvider'
import { reviews as seedReviews } from '../data/products'
import SectionHeader from './SectionHeader'

/**
 * Homepage reviews — Approved reviews from Admin/Firestore when available.
 * No seed fallback when Firebase is configured (empty = hide section).
 */
export default function ReviewsSection({ config = {} }) {
  const { approvedReviews, reviewsReady } = useStoreContent()
  const limit = Number(config.limit) || 4
  const minRating = Number(config.minRating) || 0

  const list = (
    isFirebaseConfigured
      ? approvedReviews
      : reviewsReady && approvedReviews.length > 0
        ? approvedReviews
        : seedReviews
  )
    .filter((r) => (Number(r.rating) || 0) >= minRating)
    .slice(0, limit)

  if (!reviewsReady && isFirebaseConfigured) return null
  if (list.length === 0) return null

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
          {list.map((review) => (
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
