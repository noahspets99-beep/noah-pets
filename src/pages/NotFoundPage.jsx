import { Link } from 'react-router-dom'
import { PawPrint } from 'lucide-react'
import SeoHead from '../components/seo/SeoHead'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6">
      <SeoHead title="Page Not Found" noindex canonical="/404" />
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <PawPrint className="h-7 w-7" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-ink">Page not found</h1>
      <p className="mt-3 text-sm text-muted">
        This page may have moved. Try the homepage or browse by pet.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Go home
        </Link>
        <Link
          to="/products/dogs"
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
        >
          Shop dogs
        </Link>
        <Link
          to="/search"
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
        >
          Search
        </Link>
      </div>
    </div>
  )
}
