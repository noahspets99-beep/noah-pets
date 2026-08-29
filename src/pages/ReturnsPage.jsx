import { Link } from 'react-router-dom'
import SeoHead from '../components/seo/SeoHead'

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Returns & Refunds"
        description="Return window, non-returnable pet items and refund timelines for Noah's Pets Tamil Nadu orders."
        canonical="/returns"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Returns & Refunds
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          Unopened, unused items in original packaging can be returned within 7
          days of delivery.
        </p>
        <p>
          Opened pet food, treats, litter and hygiene products are non-returnable
          for safety reasons.
        </p>
        <p>
          Damaged or wrong items — contact us within 48 hours with photos and we
          will replace or refund. Approved refunds credit to the original payment
          method within 5–7 business days.
        </p>
      </div>
      <Link
        to="/contact"
        className="mt-8 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Contact support
      </Link>
    </div>
  )
}
