import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted sm:text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-line" />
              )}
              {last || !item.to ? (
                <span
                  className={last ? 'font-semibold text-ink' : ''}
                  aria-current={last ? 'page' : undefined}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="transition hover:text-brand-700"
                >
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
