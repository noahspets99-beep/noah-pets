import { Link } from 'react-router-dom'
import { shippingSettings } from '../data/shippingTax'
import { STORE, TN_PRIORITY_CITIES, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Shipping Policy"
        description="Shipping timelines, courier handover responsibility and Tamil Nadu delivery coverage for Noah's Pets."
        canonical="/shipping"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Shipping Policy
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          Noah&apos;s Pets ships pet food and supplies across Tamil Nadu from
          our Chennai location. Standard delivery typically takes{' '}
          {shippingSettings.standardEtaDays} business days. Express options (
          {shippingSettings.expressEtaDays} days) may be available in select
          metro pin codes.
        </p>
        <p>
          Orders of ₹{shippingSettings.freeShippingMinOrder} and above qualify
          for free standard shipping. Below that, a flat fee of ₹
          {shippingSettings.standardShippingFee} applies (shown at checkout).
        </p>

        <h2 className="pt-4 text-xl font-extrabold text-ink">
          Order preparation and courier handover
        </h2>
        <p>
          Noah&apos;s Pets is responsible for preparing your order and handing
          it over to the courier or transport agency in good condition.
        </p>
        <p>
          Once the order has been handed over to the courier/transport agency,
          transportation and delivery are handled by that agency. Any delivery
          delay, loss, damage, or transportation-related issue after handover
          should be raised with the courier/transport agency. Noah&apos;s Pets
          will provide reasonable customer support to help you follow up where
          applicable.
        </p>

        <h2 className="pt-4 text-xl font-extrabold text-ink">
          Customer delivery responsibilities
        </h2>
        <p>
          Please provide a complete and accurate delivery address, including
          pin code, and ensure someone is available to receive the shipment. We
          cannot be held responsible for failed delivery attempts caused by an
          incorrect address, unreachable contact number, or unavailability at
          the delivery location.
        </p>

        <h2 className="pt-4 text-xl font-extrabold text-ink">
          Order cancellation
        </h2>
        <p>
          Once an order has been successfully placed, it cannot be cancelled by
          the customer. Please review your cart and address carefully before
          completing payment.
        </p>

        <p className="pt-2">
          Questions? Email{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>{' '}
          or see our{' '}
          <Link to="/returns" className="font-semibold text-brand-600">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>
        <p>
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

      <h2 className="mt-10 text-xl font-extrabold text-ink">Priority cities</h2>
      <ul className="mt-4 space-y-2">
        {TN_PRIORITY_CITIES.map((c) => (
          <li key={c.slug}>
            <Link
              to={`/locations/${c.slug}`}
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              {c.name}
            </Link>
            <span className="text-sm text-muted"> — {c.highlights}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
