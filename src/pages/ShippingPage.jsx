import { Link } from 'react-router-dom'
import { STORE, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Shipping & Delivery Policy"
        description="Noah's Pets Shipping & Delivery Policy - Delivery information for Noah's Pets orders across India."
        canonical="/shipping"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Shipping &amp; Delivery Policy
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          This Shipping &amp; Delivery Policy explains how Noah&apos;s Pets
          processes and delivers orders placed on this website.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          1. Delivery area
        </h2>
        <p>Noah&apos;s Pets delivers products across India.</p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          2. Processing and dispatch
        </h2>
        <p>
          Orders are processed and dispatched after successful order and payment
          confirmation. Applicable shipping charges, if any, are shown at
          checkout before you complete payment.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">3. Delivery</h2>
        <p>
          After dispatch, products are handed over to the applicable delivery or
          courier agency. Delivery is then carried out by that delivery agency.
        </p>
        <p>
          Subject to applicable law, Noah&apos;s Pets is not responsible for
          delays, loss, damage, or other issues caused by the delivery agency
          after the shipment has been handed over to the courier. This statement
          does not attempt to exclude liability where applicable law does not
          allow such exclusion.
        </p>
        <p>
          Customers should provide a complete and accurate delivery address and
          a reachable phone number so the delivery agency can complete delivery.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          4. Order and shipping support
        </h2>
        <p>
          For order or shipping support, contact Noah&apos;s Pets at{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>
          . Where appropriate, Noah&apos;s Pets can coordinate with the delivery
          agency regarding your shipment.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">5. Cancellation</h2>
        <p>
          Once payment has been successfully completed, the order cannot be
          cancelled. Please review your cart and delivery details carefully
          before completing payment. See our{' '}
          <Link to="/returns" className="font-semibold text-brand-600">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">6. Contact</h2>
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
          <Link to="/returns" className="font-semibold text-brand-600">
            Refund &amp; Cancellation Policy
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
    </div>
  )
}
