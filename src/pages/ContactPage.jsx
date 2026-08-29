import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { STORE, TN_SERVICE_AREAS } from '../config/store'
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
        We are based in Chennai and deliver pet food and supplies across Tamil
        Nadu. Reach out for order help, stock questions or partnership enquiries.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Mail,
            label: 'Email',
            value: STORE.email,
            href: `mailto:${STORE.email}`,
          },
          {
            icon: Phone,
            label: 'Phone',
            value: STORE.phone,
            href: `tel:${STORE.phone.replace(/\s/g, '')}`,
          },
          {
            icon: MessageCircle,
            label: 'WhatsApp',
            value: 'Chat with us',
            href: `https://wa.me/${STORE.whatsapp.replace(/\D/g, '')}`,
          },
          {
            icon: MapPin,
            label: 'Store',
            value: `${STORE.address.line1}, ${STORE.address.city}`,
            href: null,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-line bg-white p-5 shadow-card"
          >
            <item.icon className="h-5 w-5 text-brand-600" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
              {item.label}
            </p>
            {item.href ? (
              <a
                href={item.href}
                className="mt-1 block text-sm font-semibold text-ink hover:text-brand-700"
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                {item.value}
              </a>
            ) : (
              <p className="mt-1 text-sm font-semibold text-ink">{item.value}</p>
            )}
          </div>
        ))}
      </div>

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
    </div>
  )
}
