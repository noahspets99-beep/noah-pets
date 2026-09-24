import { Link } from 'react-router-dom'
import { STORE, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="About Noah's Pets"
        description="Noah's Pets is a Chennai-based online pet shop delivering food, toys and accessories across India."
        canonical="/about"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        About Noah&apos;s Pets
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          Noah&apos;s Pets is a Chennai-based pet store offering a wide range of
          pet food, bird supplies, reptile accessories, cat essentials, cages,
          toys, feeding products and everyday pet-care accessories.
        </p>
        <p>
          From everyday essentials to specialty products, we bring trusted pet
          brands and useful products together in one place for pet parents
          across India.
        </p>
        <p>Based in Kolathur, Chennai, we deliver pet products across India. 🇮🇳</p>
        <p>
          <strong className="text-ink">Our Promise:</strong> Quality Products •
          Trusted Brands • Helpful Service • Pan-India Delivery
        </p>
        <p>
          <strong className="text-ink">
            Noah&apos;s Pets — Everything Your Pet Needs, All in One Place.
          </strong>
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
