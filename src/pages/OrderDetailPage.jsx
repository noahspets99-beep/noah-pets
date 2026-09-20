import { Link, useParams } from 'react-router-dom'
import { formatPrice } from '../data/products'
import { useShop } from '../context/useShop'
import SeoHead from '../components/seo/SeoHead'
import NotFoundPage from './NotFoundPage'

export default function OrderDetailPage() {
  const { id } = useParams()
  const { getOrderById } = useShop()
  const order = getOrderById(id)

  if (!order) return <NotFoundPage />

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead title={`Order ${order.id}`} noindex canonical={`/orders/${order.id}`} />
      <div className="print:hidden mb-4">
        <Link to="/orders" className="text-sm font-semibold text-brand-600">
          ← All orders
        </Link>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-card print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{order.id}</h1>
            <p className="mt-1 text-sm text-muted">
              Placed {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {order.status}
            </span>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink">
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
            Track status
          </h2>
          <ol className="mt-4 space-y-3">
            {(order.timeline || []).map((step) => (
              <li key={step.label} className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    step.done ? 'bg-brand-500' : 'bg-line'
                  }`}
                />
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      step.done ? 'text-ink' : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.at && (
                    <p className="text-xs text-muted">
                      {new Date(step.at).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 border-t border-line pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
            Invoice summary
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.items?.map((item) => (
              <li
                key={`${item.id}-${item.variantId || 'default'}`}
                className="flex justify-between gap-3"
              >
                <span>
                  {item.name}
                  {item.variantLabel ? ` (${item.variantLabel})` : ''} ×
                  {item.quantity}
                </span>
                <span className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount {order.coupon ? `(${order.coupon})` : ''}</dt>
                <dd>−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>
                {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>GST</dt>
              <dd>{formatPrice(order.tax)}</dd>
            </div>
            <div className="flex justify-between text-base font-extrabold">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        {order.shippingAddress && (
          <section className="mt-8 border-t border-line pt-6 text-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
              Ship to
            </h2>
            <p className="mt-2 font-semibold text-ink">
              {order.customer?.name || order.shippingAddress.name}
            </p>
            <p className="mt-1 text-ink-soft">
              {order.shippingAddress.address}
              {order.shippingAddress.area
                ? `, ${order.shippingAddress.area}`
                : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.district},{' '}
              {order.shippingAddress.state} {order.shippingAddress.pincode}
            </p>
          </section>
        )}

        <div className="print:hidden mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface"
          >
            Print invoice
          </button>
          <Link
            to="/contact"
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface"
          >
            Contact support
          </Link>
        </div>
        <p className="print:hidden mt-4 text-xs text-muted">
          Once an order has been successfully placed, it cannot be cancelled by
          the customer. See our{' '}
          <Link to="/returns" className="font-semibold text-brand-600">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
