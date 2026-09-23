import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CreditCard,
  MapPin,
  User,
} from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Modal from '../../admin/components/Modal'
import { formatDateTime, formatINR } from '../../admin/utils'
import { ORDER_STATUSES } from '../../lib/orderStatus'
import { useAdminStore } from '../../context/AdminStore'

export default function OrderDetailPage() {
  const { id } = useParams()
  const { orders, updateOrderStatus } = useAdminStore()
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id])

  const [pendingStatus, setPendingStatus] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!order) {
    return (
      <div className="animate-fade-up">
        <Link
          to="/admin/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-card">
          <p className="text-lg font-bold text-ink">Order not found</p>
          <p className="mt-1 text-sm text-muted">
            The order &ldquo;{id}&rdquo; does not exist or may have been removed.
          </p>
        </div>
      </div>
    )
  }

  const handleStatusSelect = (status) => {
    if (status === order.status) return
    setPendingStatus(status)
    setConfirmOpen(true)
  }

  const confirmStatusUpdate = async () => {
    if (pendingStatus) {
      await updateOrderStatus(order.id, pendingStatus)
    }
    setConfirmOpen(false)
    setPendingStatus(null)
  }

  return (
    <div className="animate-fade-up space-y-6">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <PageHeader
        title={order.id}
        subtitle={`Placed on ${formatDateTime(order.createdAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={order.status} />
            <select
              value={order.status}
              onChange={(e) => handleStatusSelect(e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
            <h2 className="text-lg font-bold text-ink">Line Items</h2>
            <ul className="mt-4 space-y-3">
              {order.items.map((item) => (
                <li
                  key={`${item.productId}-${item.name}`}
                  className="flex items-center gap-3 rounded-xl border border-line p-3"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{item.name}</p>
                    <p className="text-sm text-muted">
                      Qty {item.quantity} × {formatINR(item.price)}
                    </p>
                  </div>
                  <p className="font-bold text-ink">
                    {formatINR(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{formatINR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-semibold">
                  {order.deliveryFee === 0
                    ? 'Free'
                    : formatINR(order.deliveryFee)}
                </dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Discount</dt>
                  <dd className="font-semibold">−{formatINR(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Tax</dt>
                <dd className="font-semibold">{formatINR(order.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base">
                <dt className="font-bold text-ink">Total</dt>
                <dd className="font-extrabold text-ink">{formatINR(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
            <h2 className="text-lg font-bold text-ink">Order Timeline</h2>
            <ol className="mt-5 space-y-4">
              {(order.timeline || []).map((step) => (
                <li key={step.label} className="flex gap-3">
                  {step.done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-line" />
                  )}
                  <div>
                    <p
                      className={`font-semibold ${
                        step.done ? 'text-ink' : 'text-muted'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.at && (
                      <p className="text-xs text-muted">{formatDateTime(step.at)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-600" />
              <h2 className="font-bold text-ink">Customer</h2>
            </div>
            <p className="font-semibold text-ink">{order.customer.name}</p>
            <p className="mt-1 text-sm text-muted">{order.customer.email}</p>
            <p className="text-sm text-muted">{order.customer.phone}</p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-600" />
              <h2 className="font-bold text-ink">Shipping Address</h2>
            </div>
            <address className="not-italic text-sm leading-relaxed text-ink-soft">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && (
                <>
                  <br />
                  {order.shippingAddress.line2}
                </>
              )}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.pincode}
            </address>
          </section>

          <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-600" />
              <h2 className="font-bold text-ink">Payment</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Status</span>
              <StatusBadge status={order.payment} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">Method</span>
              <span className="font-semibold text-ink">{order.paymentMethod}</span>
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setPendingStatus(null)
        }}
        title="Update order status?"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false)
                setPendingStatus(null)
              }}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmStatusUpdate}
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Confirm Update
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">
          Change order status from{' '}
          <strong className="text-ink">{order.status}</strong> to{' '}
          <strong className="text-ink">{pendingStatus}</strong>? This will update
          the order timeline for the customer.
        </p>
      </Modal>
    </div>
  )
}
