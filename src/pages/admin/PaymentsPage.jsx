import { useMemo, useState } from 'react'
import { CreditCard, Info } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Pagination from '../../admin/components/Pagination'
import EmptyState from '../../admin/components/EmptyState'
import { formatDateTime, formatINR, paginate } from '../../admin/utils'
import { usePaymentsService } from '../../services/adminServices'

export default function PaymentsPage() {
  const paymentsApi = usePaymentsService()
  const payments = paymentsApi.list()
  const settings = paymentsApi.settings()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return payments
    return payments.filter((p) => p.status === statusFilter)
  }, [payments, statusFilter])

  const { items, totalPages } = paginate(filtered, page, 10)

  const totals = useMemo(() => {
    const captured = payments
      .filter((p) => p.status === 'Captured')
      .reduce((s, p) => s + p.amount, 0)
    const pending = payments.filter((p) => p.status === 'Pending').length
    const refunded = payments.filter((p) => p.status === 'Refunded').length
    return { captured, pending, refunded, count: payments.length }
  }, [payments])

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Demo payment records seeded from orders. Razorpay connects via paymentService later."
      />

      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-900">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">
              Active provider: {settings.activeProvider}
            </p>
            <p className="mt-1 text-brand-800/80">{settings.note}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Payments', value: totals.count },
          { label: 'Captured', value: formatINR(totals.captured) },
          { label: 'Pending', value: totals.pending },
          { label: 'Refunded', value: totals.refunded },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-line bg-white p-4 shadow-card"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {label}
            </p>
            <p className="mt-1 text-xl font-extrabold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'Captured', 'Pending', 'Refunded'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setStatusFilter(key)
              setPage(1)
            }}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              statusFilter === key
                ? 'bg-brand-500 text-white'
                : 'border border-line bg-white text-ink-soft hover:bg-surface'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments"
          description="Payment records appear when orders are seeded or created."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Provider</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/40">
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                      {p.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {p.orderId}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{p.customer}</td>
                    <td className="px-4 py-3">{p.provider}</td>
                    <td className="px-4 py-3 text-muted">{p.method}</td>
                    <td className="px-4 py-3 font-bold text-ink">
                      {formatINR(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatDateTime(p.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line px-4 py-3">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
