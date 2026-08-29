import { Link } from 'react-router-dom'
import { STORE } from '../config/store'
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
          Noah&apos;s Pets started with a simple idea: Tamil Nadu pet parents
          deserve the same brand depth and freshness as big metros — without
          waiting weeks for stock.
        </p>
        <p>
          From our base in {STORE.address.city}, we curate dog food, cat litter,
          toys, grooming and aquarium supplies from trusted names like Pedigree,
          Royal Canin and Whiskas, plus house favourites.
        </p>
        <p>
          Every order includes transparent INR pricing and a GST invoice. We
          pack carefully for TN heat and humidity, and ship statewide with clear
          delivery expectations.
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
