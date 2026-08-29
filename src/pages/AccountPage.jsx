import { Link } from 'react-router-dom'
import { Heart, Mail, Package, Phone, ShoppingBag } from 'lucide-react'
import { STORE } from '../config/store'
import { useShop } from '../context/useShop'
import SeoHead from '../components/seo/SeoHead'

const links = [
  {
    to: '/orders',
    title: 'My Orders',
    desc: 'Track and manage your purchases',
    icon: Package,
  },
  {
    to: '/wishlist',
    title: 'Wishlist',
    desc: 'Items you saved for later',
    icon: Heart,
  },
  {
    to: '/cart',
    title: 'Cart',
    desc: 'Review items before checkout',
    icon: ShoppingBag,
  },
  {
    to: '/contact',
    title: 'Contact support',
    desc: 'Email, phone & WhatsApp help',
    icon: Mail,
  },
]

export default function AccountPage() {
  const { orders, wishlistCount, cartCount } = useShop()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead title="Account" noindex canonical="/account" />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Account</h1>
      <p className="mt-2 text-sm text-muted">
        Demo customer hub — no login required. Orders and wishlist stay on this
        browser.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
          {orders.length} orders
        </span>
        <span className="rounded-full bg-surface px-3 py-1 font-semibold text-ink">
          {wishlistCount} wishlist
        </span>
        <span className="rounded-full bg-surface px-3 py-1 font-semibold text-ink">
          {cartCount} in cart
        </span>
      </div>

      <ul className="mt-8 space-y-3">
        {links.map(({ to, title, desc, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card transition hover:border-brand-200 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-bold text-ink">{title}</span>
                <span className="text-sm text-muted">{desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-5 text-sm">
        <p className="font-bold text-ink">Need help?</p>
        <a
          href={`tel:${STORE.phone.replace(/\s/g, '')}`}
          className="mt-2 inline-flex items-center gap-2 text-brand-700"
        >
          <Phone className="h-4 w-4" />
          {STORE.phone}
        </a>
      </div>
    </div>
  )
}
