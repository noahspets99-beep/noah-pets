import { Heart, PawPrint, ShoppingBag, User, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useShop } from '../context/useShop'

export default function MobileMenu({ open, onClose, links }) {
  const { cartCount, wishlistCount, setCartOpen } = useShop()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[65] lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-white shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
              <PawPrint className="h-4 w-4" />
            </span>
            <span className="font-extrabold text-ink">Noah&apos;s Pets</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted hover:bg-surface hover:text-ink"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to || link.href || '/'}
                  onClick={onClose}
                  className="block rounded-xl px-3 py-3 text-sm font-semibold text-ink transition hover:bg-brand-50 hover:text-brand-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-3 gap-2 border-t border-line p-4">
          <Link
            to="/account"
            onClick={onClose}
            className="flex flex-col items-center gap-1 rounded-xl bg-surface py-3 text-xs font-semibold text-ink"
            aria-label="Account"
          >
            <User className="h-5 w-5 text-brand-600" />
            Account
          </Link>
          <Link
            to="/wishlist"
            onClick={onClose}
            className="flex flex-col items-center gap-1 rounded-xl bg-surface py-3 text-xs font-semibold text-ink"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Heart className="h-5 w-5 text-brand-600" />
            Wishlist
          </Link>
          <button
            type="button"
            onClick={() => {
              onClose()
              setCartOpen(true)
            }}
            className="flex flex-col items-center gap-1 rounded-xl bg-surface py-3 text-xs font-semibold text-ink"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingBag className="h-5 w-5 text-brand-600" />
            Cart
          </button>
        </div>
      </div>
    </div>
  )
}
