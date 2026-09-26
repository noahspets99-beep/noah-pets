import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Printer, Search, ShoppingBag } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Pagination from '../../admin/components/Pagination'
import EmptyState from '../../admin/components/EmptyState'
import { formatDate, formatINR, paginate } from '../../admin/utils'
import { printAdminOrder } from '../../admin/printOrder'
import { useAdminStore } from '../../context/AdminStore'

const STATUS_TABS = [
  { key: 'All', match: () => true },
  { key: 'Pending', match: (o) => o.status === 'Pending' },
  { key: 'Confirmed', match: (o) => o.status === 'Confirmed' },
  { key: 'Delivered', match: (o) => o.status === 'Delivered' },
  { key: 'Cancelled', match: (o) => o.status === 'Cancelled' },
]

const PAYMENT_FILTERS = ['All', 'Paid', 'Pending', 'Refunded']

export default function OrdersPage() {
  const { orders, dataStatus, settings } = useAdminStore()
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [amountSort, setAmountSort] = useState('newest')
  const [page, setPage] = useState(1)

  const counts = useMemo(() => {
    const map = {}
    STATUS_TABS.forEach(({ key, match }) => {
      map[key] =
        key === 'All' ? orders.length : orders.filter(match).length
    })
    return map
  }, [orders])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const activeTab = STATUS_TABS.find((t) => t.key === tab)

    let list = orders.filter((o) => {
      if (!activeTab.match(o)) return false
      if (paymentFilter !== 'All') {
        const pay = o.paymentStatus || o.payment
        if (pay !== paymentFilter) return false
      }
      if (!q) return true
      const name = o.customer?.name || ''
      const phone = o.customer?.phone || o.customer?.mobile || ''
      return (
        String(o.id).toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
      )
    })

    list = [...list].sort((a, b) => {
      if (amountSort === 'high') return b.total - a.total
      if (amountSort === 'low') return a.total - b.total
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return list
  }, [orders, tab, search, paymentFilter, amountSort])

  const { items, totalPages } = paginate(filtered, page, 8)

  const handleTabChange = (key) => {
    setTab(key)
    setPage(1)
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Customer orders from Firebase (live)."
      />

      {dataStatus?.error && (
        <div className="rounded-2xl border border-danger/30 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {dataStatus.error}
        </div>
      )}

      {dataStatus?.loading && (
        <p className="text-sm text-muted">Loading orders from Firebase…</p>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map(({ key }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabChange(key)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
              tab === key
                ? 'bg-ink text-white'
                : 'bg-white text-ink-soft ring-1 ring-line hover:bg-brand-50'
            }`}
          >
            {key}
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                tab === key ? 'bg-white/20' : 'bg-surface text-muted'
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-card sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search order ID, customer, phone…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          {PAYMENT_FILTERS.map((p) => (
            <option key={p} value={p}>
              Payment: {p}
            </option>
          ))}
        </select>
        <select
          value={amountSort}
          onChange={(e) => {
            setAmountSort(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          <option value="newest">Sort: Newest first</option>
          <option value="high">Sort: Amount high → low</option>
          <option value="low">Sort: Amount low → high</option>
        </select>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description={
            dataStatus?.error
              ? 'Could not load orders from Firebase.'
              : 'When customers place orders, they will appear here.'
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-card md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="w-[12%] px-4 py-3 font-semibold">Order ID</th>
                  <th className="w-[20%] px-4 py-3 font-semibold">Customer</th>
                  <th className="w-[8%] px-4 py-3 font-semibold">Items</th>
                  <th className="w-[12%] px-4 py-3 font-semibold">Date</th>
                  <th className="w-[10%] px-4 py-3 font-semibold">Amount</th>
                  <th className="w-[10%] px-4 py-3 font-semibold">Payment</th>
                  <th className="w-[10%] px-4 py-3 font-semibold">Status</th>
                  <th className="w-[18%] px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-line transition hover:bg-surface/60"
                  >
                    <td className="max-w-0 px-4 py-3 font-semibold text-ink">
                      <span className="block truncate" title={String(o.id)}>
                        {o.id}
                      </span>
                    </td>
                    <td className="max-w-0 px-4 py-3">
                      <p
                        className="truncate font-medium text-ink"
                        title={o.customer?.name || 'Customer'}
                      >
                        {o.customer?.name || 'Customer'}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {o.customer?.phone || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {(o.items || []).reduce((s, i) => s + (i.quantity || 0), 0)}{' '}
                      items
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">
                      {formatINR(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.payment} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="shrink-0 font-semibold text-brand-600 hover:text-brand-700"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => printAdminOrder(o, settings)}
                          className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-ink-soft hover:text-ink"
                          title={`Print order ${o.id}`}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {items.map((o) => (
              <article
                key={o.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate font-bold text-ink" title={String(o.id)}>
                      {o.id}
                    </p>
                    <p
                      className="truncate text-sm text-muted"
                      title={o.customer?.name || 'Customer'}
                    >
                      {o.customer?.name || 'Customer'}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {o.customer?.phone || '—'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={o.status} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted">Amount</p>
                    <p className="font-semibold text-ink">{formatINR(o.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Date</p>
                    <p className="font-semibold">{formatDate(o.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Items</p>
                    <p className="font-semibold">
                      {o.items.reduce((s, i) => s + i.quantity, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Payment</p>
                    <StatusBadge status={o.payment} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    to={`/admin/orders/${o.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600"
                  >
                    <Package className="h-4 w-4" />
                    View Order
                  </Link>
                  <button
                    type="button"
                    onClick={() => printAdminOrder(o, settings)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"
                  >
                    <Printer className="h-4 w-4" />
                    Print Order
                  </button>
                </div>
              </article>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
