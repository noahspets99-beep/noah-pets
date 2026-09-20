import { Link } from 'react-router-dom'
import { STORE, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Refund & Cancellation Policy"
        description="Cancellation, returns, refunds and payment-failure rules for Noah's Pets Tamil Nadu orders."
        canonical="/returns"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Refund &amp; Cancellation Policy
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <h2 className="text-xl font-extrabold text-ink">1. Order cancellation</h2>
        <p>
          Once an order has been successfully placed, it cannot be cancelled by
          the customer. Please verify products, quantities and delivery details
          before completing checkout and payment.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          2. Return eligibility
        </h2>
        <p>
          Unopened, unused items in original packaging may be eligible for return
          within 7 days of delivery, subject to inspection and approval by
          Noah&apos;s Pets.
        </p>
        <p>
          Opened pet food, treats, litter and hygiene products are not eligible
          for return for safety and hygiene reasons.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          3. Damaged or wrong products
        </h2>
        <p>
          If you receive a damaged or incorrect item, contact us within 48 hours
          of delivery at{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>{' '}
          with your order ID and clear photographs. Where a claim is verified,
          we will arrange a replacement or a refund in line with this policy.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          4. Courier / transport issues
        </h2>
        <p>
          After Noah&apos;s Pets has handed the order over to the
          courier/transport agency, transportation and delivery are handled by
          that agency. Issues such as delay, loss or damage in transit should be
          raised with the courier/transport agency. Noah&apos;s Pets will
          provide reasonable support to help you follow up where applicable.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          5. Refund eligibility
        </h2>
        <p>
          Refunds are considered only where this policy provides for a refund
          (for example, a verified wrong or damaged product, or a payment that
          was charged without a confirmed order). Refunds are not available
          solely because a customer wishes to cancel after placing an order.
        </p>
        <p>
          Where a refund is approved, it will be processed to the original
          payment method according to this policy and the payment provider&apos;s
          processing timelines (typically within a few business days after
          approval; bank or UPI credit times may vary).
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          6. Payment failures
        </h2>
        <p>
          If a payment attempt fails or is declined, no order is confirmed and
          no charge should remain. If an amount was debited despite a failed
          checkout, contact{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>{' '}
          with payment details. Any auto-reversal or refund will follow the
          payment provider&apos;s timelines.
        </p>

        <p className="pt-2">
          Related:{' '}
          <Link to="/shipping" className="font-semibold text-brand-600">
            Shipping Policy
          </Link>
          {' · '}
          <Link to="/terms" className="font-semibold text-brand-600">
            Terms &amp; Conditions
          </Link>
        </p>
        <p>
          Noah&apos;s Pets ·{' '}
          <a
            href={STORE.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {formatStoreAddress()}
          </a>
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
