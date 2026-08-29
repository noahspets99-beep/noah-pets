import { Home, Heart, Search, ShoppingBag, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useShop } from '../context/useShop'

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/cart', label: 'Cart', icon: ShoppingBag },
  { to: '/account', label: 'Account', icon: User },
]

export default function BottomNav() {
  const { cartCount, wishlistCount, setCartOpen } = useShop()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md md:hidden"
      aria-label="Mobile bottom navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, icon: Icon, end }) => {
          if (to === '/cart') {
            return (
              <li key={to} className="flex-1">
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="relative flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold text-muted"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute right-1/2 top-1 translate-x-3 rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </li>
            )
          }
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold transition ${
                    isActive ? 'text-brand-600' : 'text-muted'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
                {to === '/wishlist' && wishlistCount > 0 && (
                  <span className="absolute right-1/2 top-1 translate-x-3 rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
