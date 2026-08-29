import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Pagination from '../../admin/components/Pagination'
import EmptyState from '../../admin/components/EmptyState'
import Modal from '../../admin/components/Modal'
import { formatDate, formatINR, paginate } from '../../admin/utils'
import { useAdminStore } from '../../context/AdminStore'

export default function CustomersPage() {
  const { customers, orders } = useAdminStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')),
    )
  }, [customers, search])

  const { items, totalPages } = paginate(filtered, page, 8)

  const customerOrders = useMemo(() => {
    if (!selected) return []
    return orders
      .filter((o) => o.customer.id === selected.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [orders, selected])

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Customers"
        subtitle="View customer profiles, order history, and lifetime value."
      />

      <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search name, email, or phone…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="Try a different search term."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Total Spent</th>
                  <th className="px-4 py-3 font-semibold">Last Order</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer border-t border-line transition hover:bg-surface/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-line"
                        />
                        <span className="font-semibold text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{c.email}</td>
                    <td className="px-4 py-3 text-muted">{c.phone}</td>
                    <td className="px-4 py-3 font-semibold">{c.orders}</td>
                    <td className="px-4 py-3 font-semibold">
                      {formatINR(c.totalSpent)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(c.lastOrderAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(c.joinedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {items.map((c) => (
              <article
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(c)}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(c)}
                className="cursor-pointer rounded-2xl border border-line bg-white p-4 shadow-card transition hover:border-brand-200"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatar}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-line"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-ink">{c.name}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="truncate text-sm text-muted">{c.email}</p>
                    <p className="text-sm text-muted">{c.phone}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted">Orders</p>
                    <p className="font-semibold">{c.orders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Total Spent</p>
                    <p className="font-semibold">{formatINR(c.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Last Order</p>
                    <p className="font-semibold">{formatDate(c.lastOrderAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Joined</p>
                    <p className="font-semibold">{formatDate(c.joinedAt)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Customer'}
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={selected.avatar}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-line"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-ink">{selected.name}</h3>
                  <StatusBadge status={selected.status} />
                </div>
                <p className="text-sm text-muted">{selected.email}</p>
                <p className="text-sm text-muted">{selected.phone}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Orders</p>
                <p className="text-lg font-bold text-ink">{selected.orders}</p>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Total Spent</p>
                <p className="text-lg font-bold text-ink">
                  {formatINR(selected.totalSpent)}
                </p>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Member Since</p>
                <p className="text-lg font-bold text-ink">
                  {formatDate(selected.joinedAt)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-bold text-ink">Address</h4>
              <p className="rounded-xl border border-line bg-surface/60 p-3 text-sm text-ink-soft">
                {selected.address.line1}
                <br />
                {selected.address.city}, {selected.address.state}{' '}
                {selected.address.pincode}
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold text-ink">Recent Orders</h4>
              {customerOrders.length === 0 ? (
                <p className="text-sm text-muted">No orders yet.</p>
              ) : (
                <ul className="space-y-2">
                  {customerOrders.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5"
                    >
                      <div>
                        <Link
                          to={`/admin/orders/${o.id}`}
                          onClick={() => setSelected(null)}
                          className="font-semibold text-brand-600 hover:text-brand-700"
                        >
                          {o.id}
                        </Link>
                        <p className="text-xs text-muted">
                          {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-ink">
                          {formatINR(o.total)}
                        </p>
                        <StatusBadge status={o.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
