export function Sparkline({ values = [], className = '' }) {
  if (!values.length) return null
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * 100
      const y = 100 - ((v - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`h-10 w-full ${className}`}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function BarChart({ data = [], valueKey = 'revenue', className = '' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div className={`flex h-56 items-end gap-2 sm:gap-3 ${className}`}>
      {data.map((item) => {
        const height = Math.max(8, (item[valueKey] / max) * 100)
        return (
          <div
            key={item.label}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition hover:from-brand-700 hover:to-brand-500"
              style={{ height: `${height}%` }}
              title={`${item.label}: ${item[valueKey]}`}
            />
            <span className="truncate text-[10px] font-medium text-muted sm:text-xs">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function DonutChart({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const colors = ['#0ea5e9', '#38bdf8', '#0369a1', '#f59e0b', '#94a3b8']
  const segments = data.reduce((acc, d, i) => {
    const start = acc.length ? acc[acc.length - 1].end : 0
    const end = start + d.value / total
    acc.push({
      ...d,
      start,
      end,
      color: colors[i % colors.length],
    })
    return acc
  }, [])

  const gradient = segments
    .map((s) => `${s.color} ${s.start * 100}% ${s.end * 100}%`)
    .join(', ')

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <div
        className="h-36 w-36 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${gradient})`,
          mask: 'radial-gradient(circle, transparent 52%, black 53%)',
          WebkitMask: 'radial-gradient(circle, transparent 52%, black 53%)',
        }}
        aria-hidden="true"
      />
      <ul className="w-full space-y-2">
        {segments.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ink-soft">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
              />
              {s.name}
            </span>
            <span className="font-semibold text-ink">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
