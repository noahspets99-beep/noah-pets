import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  ImagePlus,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  TicketPercent,
  Users,
  AlertTriangle,
} from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import { BarChart, DonutChart, Sparkline } from '../../admin/components/Charts'
import { KpiSkeleton, Skeleton } from '../../admin/components/Skeleton'
import {
  categoryRevenue,
  revenueSeries,
  topSellingProducts,
} from '../../data/adminDashboard'
import { useAdminStore } from '../../context/AdminStore'
import { formatDate, formatINR } from '../../admin/utils'

const ranges = ['Today', '7 Days', '30 Days', 'This Year']
const chartRanges = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '3m', label: '3 Months' },
  { key: '6m', label: '6 Months' },
  { key: '1y', label: '1 Year' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function KpiCard({ title, value, change, icon: Icon, spark, positive = true }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold ${
            positive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {change}
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
      {spark && (
        <div className="mt-3 text-brand-400">
          <Sparkline values={spark} />
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { products, orders, customers } = useAdminStore()
  const [range, setRange] = useState('7 Days')
  const [chartRange, setChartRange] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const pendingOrders = orders.filter((o) =>
    ['Pending', 'Confirmed', 'Processing'].includes(o.status),
  ).length
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold,
  )
  const revenue = orders
    .filter((o) => o.payment === 'Paid' || o.status === 'Delivered')
    .reduce((s, o) => s + o.total, 0)

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [orders],
  )

  const chartData = revenueSeries[chartRange]

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="mb-8 h-4 w-80" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title={`${greeting()}, Admin`}
        subtitle="Here's what's happening with your pet store today."
        actions={
          <div className="flex flex-wrap gap-2">
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  range === r
                    ? 'bg-ink text-white'
                    : 'bg-white text-ink-soft ring-1 ring-line hover:bg-brand-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Revenue"
          value={formatINR(revenue || 124850)}
          change="+12.8%"
          icon={ShoppingBag}
          spark={[12, 14, 13, 18, 20, 19, 24]}
        />
        <KpiCard
          title="Total Orders"
          value={orders.length || 384}
          change="+8.4%"
          icon={Package}
          spark={[8, 10, 9, 12, 14, 13, 16]}
        />
        <KpiCard
          title="Total Customers"
          value={customers.length * 155 || 1240}
          change="+14.2%"
          icon={Users}
          spark={[10, 11, 13, 12, 15, 16, 18]}
        />
        <KpiCard
          title="Total Products"
          value={products.length || 248}
          change="+5.1%"
          icon={Tag}
          spark={[20, 20, 21, 22, 22, 23, 24]}
        />
        <KpiCard
          title="Pending Orders"
          value={pendingOrders}
          change="+2.1%"
          icon={AlertTriangle}
          spark={[4, 5, 3, 6, 5, 7, 6]}
          positive={false}
        />
        <KpiCard
          title="Low Stock"
          value={lowStock.length}
          change="+1.4%"
          icon={Package}
          spark={[2, 3, 2, 4, 3, 5, 4]}
          positive={false}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { to: '/admin/products/new', label: 'Add Product', icon: Plus },
          { to: '/admin/categories', label: 'Add Category', icon: Tag },
          { to: '/admin/coupons', label: 'Create Coupon', icon: TicketPercent },
          { to: '/admin/banners', label: 'Add Banner', icon: ImagePlus },
          { to: '/admin/orders', label: 'View Orders', icon: ShoppingBag },
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to + label}
            to={to}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-4 w-4" />
            </span>
            {label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Revenue Overview</h2>
              <p className="text-sm text-muted">Revenue and orders trend</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chartRanges.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setChartRange(r.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    chartRange === r.key
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface text-ink-soft hover:bg-brand-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={chartData} />
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <p className="text-muted">Revenue</p>
              <p className="font-bold text-ink">
                {formatINR(chartData.reduce((s, d) => s + d.revenue, 0))}
              </p>
            </div>
            <div>
              <p className="text-muted">Orders</p>
              <p className="font-bold text-ink">
                {chartData.reduce((s, d) => s + d.orders, 0)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <h2 className="text-lg font-bold text-ink">Revenue by Category</h2>
          <p className="mb-5 text-sm text-muted">Top pet category mix</p>
          <DonutChart data={categoryRevenue} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Top Selling Products</h2>
          </div>
          <ul className="space-y-3">
            {topSellingProducts.map((p, i) => (
              <li
                key={p.name}
                className="flex items-center gap-3 rounded-xl border border-line px-3 py-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted">{p.sales} sales</p>
                </div>
                <p className="text-sm font-bold text-ink">
                  {formatINR(p.revenue)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Low Stock Products</h2>
            <Link
              to="/admin/products"
              className="text-sm font-semibold text-brand-600"
            >
              Manage
            </Link>
          </div>
          <ul className="space-y-3">
            {lowStock.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-line px-3 py-3"
              >
                <img
                  src={p.images[0]}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted">
                    SKU: {p.sku} · Stock: {p.stock} / {p.lowStockThreshold}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status="Low Stock" />
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    className="text-xs font-semibold text-brand-600"
                  >
                    Manage Stock
                  </Link>
                </div>
              </li>
            ))}
            {lowStock.length === 0 && (
              <p className="py-8 text-center text-sm text-muted">
                All products are sufficiently stocked.
              </p>
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-brand-600">
            View all
          </Link>
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-line md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Products</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-line hover:bg-surface/60">
                  <td className="px-4 py-3 font-semibold text-ink">{o.id}</td>
                  <td className="px-4 py-3">{o.customer.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {o.items.reduce((s, i) => s + i.quantity, 0)} items
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold">{formatINR(o.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.payment} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="font-semibold text-brand-600"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {recentOrders.map((o) => (
            <article
              key={o.id}
              className="rounded-xl border border-line p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-ink">{o.id}</p>
                  <p className="text-sm text-muted">{o.customer.name}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted">Amount</p>
                  <p className="font-semibold">{formatINR(o.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Date</p>
                  <p className="font-semibold">{formatDate(o.createdAt)}</p>
                </div>
              </div>
              <Link
                to={`/admin/orders/${o.id}`}
                className="mt-3 inline-flex text-sm font-semibold text-brand-600"
              >
                View Order →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
