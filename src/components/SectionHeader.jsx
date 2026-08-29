export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  align = 'left',
  className = '',
}) {
  return (
    <div
      className={`mb-8 flex flex-col gap-4 sm:mb-10 ${
        align === 'center'
          ? 'items-center text-center'
          : 'sm:flex-row sm:items-end sm:justify-between'
      } ${className}`}
    >
      <div className={align === 'center' ? 'max-w-2xl' : 'max-w-xl'}>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
