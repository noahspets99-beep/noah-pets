import { useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import { BarChart, DonutChart, Sparkline } from '../../admin/components/Charts'
import { useReportsHelpers } from '../../services/adminServices'
import { formatINR } from '../../admin/utils'

const RANGES = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '3m', label: '3 months' },
]

export default function ReportsPage() {
  const reports = useReportsHelpers()
  const [range, setRange] = useState('7d')

  const series = useMemo(
    () => reports.revenueSeries[range] || [],
    [reports.revenueSeries, range],
  )
  const sparkValues = useMemo(
    () => series.map((d) => d.revenue),
    [series],
  )
  const rangeRevenue = series.reduce((s, d) => s + d.revenue, 0)
  const rangeOrders = series.reduce((s, d) => s + d.orders, 0)

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Revenue trends, order mix, category sales, and best sellers."
      />

      <div className="flex flex-wrap gap-2">
        {RANGES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              range === key
                ? 'bg-brand-500 text-white'
                : 'border border-line bg-white text-ink-soft hover:bg-surface'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Period revenue',
            value: formatINR(rangeRevenue),
            spark: sparkValues,
          },
          {
            label: 'Period orders',
            value: rangeOrders,
            spark: series.map((d) => d.orders),
          },
          {
            label: 'Catalog revenue (orders)',
            value: formatINR(reports.totalRevenue),
          },
          {
            label: 'Total orders',
            value: reports.orderCount,
          },
        ].map(({ label, value, spark }) => (
          <div
            key={label}
            className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {label}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
            {spark && (
              <div className="mt-3 text-brand-400">
                <Sparkline values={spark} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-600" />
            <h2 className="text-base font-bold text-ink">Revenue</h2>
          </div>
          <BarChart data={series} valueKey="revenue" />
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <h2 className="mb-4 text-base font-bold text-ink">Orders by status</h2>
          <DonutChart data={reports.ordersByStatus} />
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <h2 className="mb-4 text-base font-bold text-ink">Sales by category</h2>
          <DonutChart data={reports.categoryRevenue} />
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <h2 className="mb-4 text-base font-bold text-ink">Best sellers</h2>
          <ul className="divide-y divide-line">
            {reports.topSellingProducts.map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted">{p.sales} sold</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-brand-700">
                  {formatINR(p.revenue)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
