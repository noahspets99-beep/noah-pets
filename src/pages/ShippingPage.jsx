import { Link } from 'react-router-dom'
import { shippingSettings } from '../data/shippingTax'
import { TN_PRIORITY_CITIES } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Shipping Policy Tamil Nadu"
        description="Shipping timelines, free delivery threshold and Tamil Nadu service coverage for Noah's Pets."
        canonical="/shipping"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Shipping
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          Standard delivery across Tamil Nadu typically takes{' '}
          {shippingSettings.standardEtaDays} business days. Express options (
          {shippingSettings.expressEtaDays} days) may be available in select
          metro pin codes.
        </p>
        <p>
          Orders of ₹{shippingSettings.freeShippingMinOrder} and above qualify
          for free standard shipping. Below that, a flat fee of ₹
          {shippingSettings.standardShippingFee} applies.
        </p>
        <p>{shippingSettings.notes}</p>
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
