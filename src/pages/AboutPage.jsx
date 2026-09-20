import { Link } from 'react-router-dom'
import { STORE, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="About Noah's Pets"
        description="Noah's Pets is a Chennai-based online pet shop delivering food, toys and accessories across Tamil Nadu."
        canonical="/about"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        About Noah&apos;s Pets
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          Noah&apos;s Pets is an online pet store based in Kolathur, Chennai,
          serving pet parents across Tamil Nadu with carefully selected food,
          toys, grooming and accessories.
        </p>
        <p>
          We curate dog food, cat litter, toys, grooming and aquarium supplies
          from trusted brands, with transparent INR pricing and a GST invoice on
          every paid order.
        </p>
        <p>
          Orders are prepared and packed at our Chennai location, then handed
          over to courier/transport partners for statewide delivery. Customers
          are responsible for providing an accurate delivery address and being
          available to receive their order.
        </p>
        <p>
          <strong className="text-ink">Address:</strong>{' '}
          <a
            href={STORE.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {formatStoreAddress()}
          </a>
        </p>
        <p>
          <strong className="text-ink">Support:</strong>{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/products/dogs"
          className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Shop now
        </Link>
        <Link
          to="/contact"
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
        >
          Contact us
        </Link>
      </div>
    </div>
  )
}
