import { Link } from 'react-router-dom'
import { STORE, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Terms & Conditions"
        description="Terms and conditions for shopping at Noah's Pets online store in Tamil Nadu."
        canonical="/terms"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Terms &amp; Conditions
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          These Terms &amp; Conditions govern your use of the Noah&apos;s Pets
          website and the purchase of products from us. By placing an order you
          agree to these terms.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">1. Business details</h2>
        <p>
          <strong className="text-ink">Noah&apos;s Pets</strong>
          <br />
          <a
            href={STORE.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {formatStoreAddress()}
          </a>
          <br />
          Email:{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">2. Orders and payment</h2>
        <p>
          Orders are placed through our website and paid online via our payment
          partner (Razorpay). An order is confirmed only after successful payment
          verification. Prices are shown in INR and may include applicable taxes
          as displayed at checkout.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">3. Cancellation</h2>
        <p>
          Once an order has been successfully placed, it cannot be cancelled by
          the customer. Please review your order carefully before completing
          payment.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">4. Shipping and delivery</h2>
        <p>
          Noah&apos;s Pets prepares and hands orders over to the
          courier/transport agency. After handover, transportation and delivery
          are handled by the courier/transport agency. Customers must provide an
          accurate delivery address and remain reachable for delivery. For full
          details see our{' '}
          <Link to="/shipping" className="font-semibold text-brand-600">
            Shipping Policy
          </Link>
          .
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">5. Returns and refunds</h2>
        <p>
          Returns and refunds are governed by our{' '}
          <Link to="/returns" className="font-semibold text-brand-600">
            Refund &amp; Cancellation Policy
          </Link>
          . Refunds, where applicable, are processed according to that policy and
          payment-provider timelines.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">6. Product information</h2>
        <p>
          We aim to keep product descriptions and stock accurate. Images are for
          illustration; packaging may vary. If an item cannot be fulfilled after
          payment due to stock or similar issues, we will contact you and process
          a refund where appropriate.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">7. Privacy</h2>
        <p>
          How we collect and use personal information is described in our{' '}
          <Link to="/privacy" className="font-semibold text-brand-600">
            Privacy Policy
          </Link>
          .
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">8. Contact</h2>
        <p>
          For questions about these terms, contact{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>
          .
        </p>
      </div>
    </div>
  )
}
