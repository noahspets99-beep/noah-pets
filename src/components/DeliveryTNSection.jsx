import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { TN_PRIORITY_CITIES } from '../config/store'
import { toStorefrontPriorityCity } from '../data/indiaCities'
import { useStoreContent } from '../context/StoreContentProvider'
import SectionHeader from './SectionHeader'

export default function DeliveryTNSection({ config = {} }) {
  const { shippingSettings } = useStoreContent()
  const freeMin =
    Number(config.freeShippingMin) ||
    Number(shippingSettings?.freeShippingMinOrder) ||
    999
  const eta =
    config.etaText ||
    (shippingSettings?.standardEtaDays
      ? `${shippingSettings.standardEtaDays} business days across India`
      : '2–5 business days across India')

  const cityNames = Array.isArray(config.cities) ? config.cities : []

  const fromAdmin = (shippingSettings?.priorityCities || [])
    .map(toStorefrontPriorityCity)
    .filter(Boolean)

  const pool = fromAdmin.length > 0 ? fromAdmin : TN_PRIORITY_CITIES

  const cities =
    cityNames.length > 0
      ? pool.filter((c) =>
          cityNames.some(
            (n) =>
              String(n).toLowerCase() === String(c.name).toLowerCase(),
          ),
        )
      : pool

  const displayCities = cities.length > 0 ? cities : TN_PRIORITY_CITIES

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Delivery across India"
          title="We deliver across India"
          subtitle={`Free shipping on orders ₹${freeMin}+ · Standard ETA ${eta}.`}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayCities.map((city) => (
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
