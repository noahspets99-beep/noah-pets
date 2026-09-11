import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { formatPrice } from '../data/products'
import { useAuth } from '../context/useAuth'
import { useShop } from '../context/useShop'
import SeoHead from '../components/seo/SeoHead'

export default function OrdersPage() {
  const { orders } = useShop()
  const { user, isAuthenticated } = useAuth()

  const visibleOrders = isAuthenticated
    ? orders.filter(
        (o) =>
          o.customerId === user?.uid ||
          o.customer?.email?.toLowerCase() === user?.email?.toLowerCase() ||
          o.shippingAddress?.email?.toLowerCase() === user?.email?.toLowerCase() ||
          // Guest orders placed before sign-in still live in this browser
          !o.customerId,
      )
    : orders

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead title="My Orders" noindex canonical="/orders" />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">My Orders</h1>
      <p className="mt-2 text-sm text-muted">
        {isAuthenticated
          ? 'Orders linked to your account on this device.'
          : 'Orders placed on this device. Sign in from Account to keep them with your profile.'}
      </p>

      {visibleOrders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-brand-500" />
          <p className="mt-4 font-semibold text-ink">No orders yet</p>
          <Link
            to="/products/dogs"
            className="mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {visibleOrders.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-line bg-white p-5 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-lg font-bold text-ink hover:text-brand-700"
                  >
                    {order.id}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {order.status}
                  </span>
                  <p className="mt-2 text-sm font-extrabold text-ink">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">
                {order.items?.length || 0} item
                {(order.items?.length || 0) === 1 ? '' : 's'} · Payment{' '}
                {order.paymentStatus}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
