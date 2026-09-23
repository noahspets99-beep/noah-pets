import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Package,
  ShoppingBag,
  Tag,
  Users,
} from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import { BarChart } from '../../admin/components/Charts'
import { KpiSkeleton, Skeleton } from '../../admin/components/Skeleton'
import { useAdminStore } from '../../context/AdminStore'
import { formatDate, formatINR } from '../../admin/utils'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function KpiCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
    </div>
  )
}

function buildRevenueSeries(orders, days = 7) {
  const buckets = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    buckets.push({
      key,
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: 0,
      orders: 0,
    })
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
  for (const o of orders) {
    if (!o.createdAt) continue
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    if (!byKey[key]) continue
    byKey[key].orders += 1
    if (o.payment === 'Paid' || o.paymentStatus === 'Paid') {
      byKey[key].revenue += Number(o.total) || 0
    }
  }
  return buckets
}

export default function DashboardPage() {
  const { products, orders, customers, dataStatus } = useAdminStore()

  const pendingOrders = orders.filter((o) =>
    ['Pending', 'Confirmed'].includes(o.status),
  ).length
  const lowStock = products.filter((p) => {
    const stock = Number(p.stock) || 0
    const threshold = Number(p.lowStockThreshold) || 10
    return stock > 0 && stock <= threshold
  })
  const revenue = orders
    .filter((o) => o.payment === 'Paid' || o.paymentStatus === 'Paid')
    .reduce((s, o) => s + (Number(o.total) || 0), 0)

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [orders],
  )

  const chartData = useMemo(() => buildRevenueSeries(orders, 7), [orders])

  const topSelling = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      for (const item of o.items || []) {
        const id = item.id || item.productId || item.name
        if (!id) continue
        const prev = map.get(id) || {
          name: item.name || id,
          sales: 0,
          revenue: 0,
        }
        prev.sales += Number(item.quantity) || 0
        prev.revenue +=
          Number(item.lineTotal) ||
          (Number(item.price) || 0) * (Number(item.quantity) || 0)
        map.set(id, prev)
      }
    }
    return [...map.values()]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
  }, [orders])

  if (dataStatus?.loading) {
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
        subtitle="Live store metrics from Firebase."
        actions={
          <Link
            to="/admin/orders"
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white"
          >
            View Orders
          </Link>
        }
      />

      {dataStatus?.error && (
        <div className="rounded-2xl border border-danger/30 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {dataStatus.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Total Revenue" value={formatINR(revenue)} icon={ShoppingBag} />
        <KpiCard title="Total Orders" value={orders.length} icon={Package} />
        <KpiCard title="Total Customers" value={customers.length} icon={Users} />
        <KpiCard title="Total Products" value={products.length} icon={Tag} />
        <KpiCard title="Pending Orders" value={pendingOrders} icon={AlertTriangle} />
        <KpiCard title="Low Stock" value={lowStock.length} icon={Package} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-ink">Revenue Overview</h2>
            <p className="text-sm text-muted">Last 7 days from paid orders</p>
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
          <h2 className="text-lg font-bold text-ink">Top Selling Products</h2>
          <p className="mb-5 text-sm text-muted">From real order line items</p>
          {topSelling.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No sales data yet
            </p>
          ) : (
            <ul className="space-y-3">
              {topSelling.map((p, i) => (
                <li
                  key={`${p.name}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-line px-3 py-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted">{p.sales} sold</p>
                  </div>
                  <p className="text-sm font-bold text-ink">
                    {formatINR(p.revenue)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Low Stock Products</h2>
            <Link
              to="/admin/products"
              className="text-sm font-semibold text-brand-600"
            >
              View products
            </Link>
          </div>
          <ul className="space-y-3">
            {lowStock.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-line px-3 py-3"
              >
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-muted">
                    <Package className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted">
                    SKU: {p.sku || '—'} · Stock: {p.stock}
                  </p>
                </div>
                <StatusBadge status="Low Stock" />
              </li>
            ))}
            {lowStock.length === 0 && (
              <p className="py-8 text-center text-sm text-muted">
                {products.length === 0
                  ? 'No products in Firebase yet.'
                  : 'All products are sufficiently stocked.'}
              </p>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-brand-600"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No orders yet</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Order ID</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Payment</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr
                        key={o.id}
                        className="border-t border-line hover:bg-surface/60"
                      >
                        <td className="px-4 py-3 font-semibold text-ink">
                          {o.id}
                        </td>
                        <td className="px-4 py-3">
                          {o.customer?.name || 'Customer'}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {formatINR(o.total)}
                        </td>
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
                        <p className="text-sm text-muted">
                          {o.customer?.name || 'Customer'}
                        </p>
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
                        <p className="font-semibold">
                          {formatDate(o.createdAt)}
                        </p>
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
            </>
          )}
        </section>
      </div>
    </div>
  )
}
