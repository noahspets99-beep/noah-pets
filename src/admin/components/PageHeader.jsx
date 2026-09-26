export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) {
  const titleText = typeof title === 'string' ? title : undefined
  const subtitleText = typeof subtitle === 'string' ? subtitle : undefined

  return (
    <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 overflow-hidden">
        {breadcrumbs && (
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb} className="flex min-w-0 items-center gap-1">
                {i > 0 && <span className="shrink-0">/</span>}
                <span
                  className={`truncate ${i === breadcrumbs.length - 1 ? 'text-ink' : ''}`}
                  title={typeof crumb === 'string' ? crumb : undefined}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1
          className="truncate text-xl font-extrabold tracking-tight text-ink sm:text-2xl"
          title={titleText}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 truncate text-sm text-muted" title={subtitleText}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
