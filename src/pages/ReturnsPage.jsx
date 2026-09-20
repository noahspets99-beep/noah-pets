import { Link } from 'react-router-dom'
import { STORE, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Refund & Cancellation Policy"
        description="Noah's Pets Refund & Cancellation Policy - Information about order cancellation, returns and payment issues."
        canonical="/returns"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Refund &amp; Cancellation Policy
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          This policy explains Noah&apos;s Pets rules for cancellation, returns,
          and refunds. Please read it carefully before completing payment.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">1. Cancellation</h2>
        <p>
          Once payment has been successfully completed, the order cannot be
          cancelled.
        </p>
        <p>
          Customers should verify their product, quantity, delivery address,
          phone number, and other order details before completing payment.
        </p>
        <p>
          Cancellation requests after successful payment are not accepted.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">2. Returns</h2>
        <p>
          Products cannot be returned after purchase.
        </p>
        <p>
          Noah&apos;s Pets does not accept general product returns after an
          order has been purchased, dispatched, or delivered.
        </p>
        <p>
          Customers should carefully verify the product and order information
          before purchasing.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">3. Refunds</h2>
        <p>
          Once a payment has been successfully completed, refunds are not
          available under the normal order policy.
        </p>
        <p>
          No refund is provided merely because the customer changes their mind
          or no longer wants the product.
        </p>
        <p>
          This policy does not promise a standard refund timeline because
          normal refunds are not offered under the order policy described above.
          Nothing in this policy seeks to exclude rights that cannot be excluded
          under applicable Indian law.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          4. Payment problems
        </h2>
        <p>
          If a customer&apos;s payment is stuck, failed, deducted but the order
          is not confirmed, or the customer experiences another payment-related
          issue, please contact:
        </p>
        <p>
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>
        </p>
        <p>
          Payment issues will be reviewed by Noah&apos;s Pets and, where
          applicable, resolved according to the payment provider or bank
          transaction status and applicable rules. A payment issue does not
          automatically qualify for a refund.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">5. Contact</h2>
        <p>
          <strong className="text-ink">Noah&apos;s Pets</strong>
          <br />
          Email:{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>
          <br />
          Address:{' '}
          <a
            href={STORE.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {formatStoreAddress()}
          </a>
        </p>

        <p className="pt-2">
          Related:{' '}
          <Link to="/shipping" className="font-semibold text-brand-600">
            Shipping &amp; Delivery Policy
          </Link>
          {' · '}
          <Link to="/terms" className="font-semibold text-brand-600">
            Terms &amp; Conditions
          </Link>
          {' · '}
          <Link to="/privacy" className="font-semibold text-brand-600">
            Privacy Policy
          </Link>
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
