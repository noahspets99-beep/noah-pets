import { Link } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { STORE, TN_SERVICE_AREAS, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'
import JsonLd from '../components/seo/JsonLd'
import { localBusinessSchema } from '../lib/schema'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Contact Us | Pet Shop Tamil Nadu"
        description="Contact Noah's Pets in Chennai for orders, delivery queries and pet product help across Tamil Nadu."
        canonical="/contact"
      />
      <JsonLd data={localBusinessSchema()} />

      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Contact Us
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
        Noah&apos;s Pets is based in Kolathur, Chennai and delivers pet products
        across India. Reach out for order help, shipping support or payment
        questions at{' '}
        <a
          href={`mailto:${STORE.email}`}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          {STORE.email}
        </a>
        .
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-extrabold text-ink">Noah&apos;s Pets</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Address
            </dt>
            <dd className="mt-1">
              <a
                href={STORE.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-start gap-2 font-semibold text-ink hover:text-brand-700"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{formatStoreAddress()}</span>
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Email
            </dt>
            <dd className="mt-1">
              <a
                href={`mailto:${STORE.email}`}
                className="inline-flex items-center gap-2 font-semibold text-ink hover:text-brand-700"
              >
                <Mail className="h-4 w-4 text-brand-600" />
                {STORE.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Phone / WhatsApp
            </dt>
            <dd className="mt-1 flex flex-wrap gap-4">
              <a
                href={`tel:${STORE.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 font-semibold text-ink hover:text-brand-700"
              >
                <Phone className="h-4 w-4 text-brand-600" />
                {STORE.phone}
              </a>
              <a
                href={`https://wa.me/${STORE.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-ink hover:text-brand-700"
              >
                <MessageCircle className="h-4 w-4 text-brand-600" />
                WhatsApp
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Location
            </dt>
            <dd className="mt-1">
              <a
                href={STORE.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                Open in Google Maps
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-ink">
          Customer support
        </h2>
        <p className="mt-2 text-sm text-muted">
          For the fastest help with orders, shipping or payment issues, email{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>
          .
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-ink">
          Service areas in Tamil Nadu
        </h2>
        <p className="mt-2 text-sm text-muted">
          We ship to these cities and many surrounding towns.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TN_SERVICE_AREAS.map((city) => (
            <span
              key={city}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink"
            >
              {city}
            </span>
          ))}
        </div>
      </section>

      <p className="mt-8 text-sm text-muted">
        For shipping and refund policies, see{' '}
        <Link to="/shipping" className="font-semibold text-brand-600">
          Shipping &amp; Delivery Policy
        </Link>{' '}
        and{' '}
        <Link to="/returns" className="font-semibold text-brand-600">
          Refund &amp; Cancellation Policy
        </Link>
        .
      </p>
    </div>
  )
}
