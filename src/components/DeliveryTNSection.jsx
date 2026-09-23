import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { TN_PRIORITY_CITIES } from '../config/store'
import { shippingSettings } from '../data/shippingTax'
import SectionHeader from './SectionHeader'

export default function DeliveryTNSection() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Delivery across India"
          title="We deliver across India"
          subtitle={`Free shipping on orders ₹${shippingSettings.freeShippingMinOrder}+ · Standard ETA ${shippingSettings.standardEtaDays} business days.`}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TN_PRIORITY_CITIES.map((city) => (
            <Link
              key={city.slug}
              to={`/locations/${city.slug}`}
              className="group rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-ink group-hover:text-brand-700">
                    {city.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
                    {city.region}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {city.highlights}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
