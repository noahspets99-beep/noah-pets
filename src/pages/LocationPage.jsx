import { Link, useParams } from 'react-router-dom'
import { TN_PRIORITY_CITIES } from '../config/store'
import { toStorefrontPriorityCity } from '../data/indiaCities'
import { catalogCategories } from '../data/catalog'
import SeoHead from '../components/seo/SeoHead'
import { useStoreContent } from '../context/StoreContentProvider'
import NotFoundPage from './NotFoundPage'

export default function LocationPage() {
  const { citySlug } = useParams()
  const { seoSettings, shippingSettings } = useStoreContent()

  const fromAdmin = (shippingSettings?.priorityCities || [])
    .map(toStorefrontPriorityCity)
    .filter(Boolean)

  const pool = fromAdmin.length > 0 ? fromAdmin : TN_PRIORITY_CITIES
  const city = pool.find((c) => c.slug === citySlug)

  if (!city) return <NotFoundPage />

  const locationSeo = (seoSettings?.locationSeo || []).find(
    (row) => row.slug === city.slug,
  )
  const categories = catalogCategories.filter((c) => !c.parentId).slice(0, 8)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title={
          locationSeo?.title ||
          `Pet Supplies Delivery in ${city.name} | Noah's Pets`
        }
        description={
          locationSeo?.description ||
          `Buy dog food, cat products and pet accessories online with delivery in ${city.name}. ${city.highlights} We deliver across India.`
        }
        keywords={`pet shop ${city.name}, dog food ${city.name}, pet delivery India, Noah's Pets`}
        canonical={`/locations/${city.slug}`}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        {city.region}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Pet supplies delivery in {city.name}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        {city.highlights} Noah&apos;s Pets ships packaged pet food, litter, toys
        and accessories with GST invoices to homes across {city.name} and nearby
        towns.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        Popular orders include adult and puppy dog food, Whiskas and Royal Canin
        for cats, and everyday grooming essentials. Free shipping applies on
        eligible cart totals — see checkout for your pin code estimate.
      </p>

      <h2 className="mt-10 text-xl font-extrabold text-ink">Shop categories</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/products/${c.slug}`}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card hover:border-brand-200 hover:text-brand-700"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-ink-soft">
          We deliver across India.{' '}
          <Link to="/contact" className="font-semibold text-brand-600">
            Contact us
          </Link>{' '}
          or browse{' '}
          <Link to="/shipping" className="font-semibold text-brand-600">
            shipping info
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
