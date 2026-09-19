import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'
import { useCatalog } from '../context/CatalogProvider'
import { useShop } from '../context/useShop'
import BrandMark from './BrandMark'
import MobileMenu from './MobileMenu'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Dogs', to: '/products/dogs' },
  { label: 'Cats', to: '/products/cats' },
  { label: 'Food', to: '/products/dog-food' },
  { label: 'Toys', to: '/products/toys' },
  { label: 'Offers', to: '/offers' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const {
    cartCount,
    wishlistCount,
    setCartOpen,
    searchQuery,
    setSearchQuery,
    mobileSearchOpen,
    setMobileSearchOpen,
  } = useShop()
  const { searchProducts } = useCatalog()
  const navigate = useNavigate()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow =
      menuOpen || mobileSearchOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, mobileSearchOpen])

  const searchMatches = useMemo(
    () => searchProducts(searchQuery),
    [searchQuery, searchProducts],
  )
  const results = useMemo(() => searchMatches.slice(0, 6), [searchMatches])
  const totalMatches = searchMatches.length
  const showDesktopResults = searchFocused && searchQuery.trim().length > 0

  const goSearch = (e) => {
    e?.preventDefault?.()
    const q = searchQuery.trim()
    if (!q) {
      navigate('/search')
      return
    }
    navigate(`/search?q=${encodeURIComponent(q)}`)
    setSearchFocused(false)
    setMobileSearchOpen(false)
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition duration-300 ${
          scrolled
            ? 'border-b border-line/80 bg-white/85 shadow-soft backdrop-blur-xl'
            : 'border-b border-transparent bg-white/95 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            className="rounded-xl p-2 text-ink transition hover:bg-surface lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2">
            <BrandMark className="h-9 w-9 sm:h-10 sm:w-10" />
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight text-ink sm:text-lg">
                Noah&apos;s Pets
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-muted sm:block">
                Premium Pet Care
              </span>
            </span>
          </Link>

          <nav
            className="ml-4 hidden items-center gap-0.5 xl:flex"
            aria-label="Primary"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="rounded-lg px-2.5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={goSearch}
            className="relative ml-auto hidden min-w-0 flex-1 max-w-md md:block lg:ml-6"
          >
            <label htmlFor="desktop-search" className="sr-only">
              Search products
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="desktop-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search food, toys, accessories & more..."
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:bg-white hover:text-ink"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {showDesktopResults && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-fade-in">
                <div className="border-b border-line px-4 py-2 text-xs font-medium text-muted">
                  {totalMatches} result{totalMatches === 1 ? '' : 's'} for “
                  {searchQuery}”
                </div>
                {results.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted">
                    No products found for &apos;{searchQuery}&apos;.
                  </p>
                ) : (
                  <ul>
                    {results.map((product) => (
                      <li key={product.id}>
                        <Link
                          to={`/product/${product.slug || product.id}`}
                          className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface"
                          onClick={() => setSearchQuery('')}
                        >
                          <img
                            src={product.image}
                            alt=""
                            className="h-11 w-11 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted">
                              {product.brand} · {product.petType}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {totalMatches > 0 && (
                  <button
                    type="submit"
                    className="w-full border-t border-line px-4 py-3 text-left text-sm font-semibold text-brand-600 hover:bg-brand-50"
                  >
                    View all results
                  </button>
                )}
              </div>
            )}
          </form>

          <div className="ml-auto flex items-center gap-0.5 md:ml-2">
            <button
              type="button"
              className="rounded-xl p-2.5 text-ink transition hover:bg-surface md:hidden"
              aria-label="Search"
              onClick={() => setMobileSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/account"
              className="hidden rounded-xl p-2.5 text-ink transition hover:bg-surface sm:inline-flex"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              to="/wishlist"
              className="relative rounded-xl p-2.5 text-ink transition hover:bg-surface"
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative rounded-xl p-2.5 text-ink transition hover:bg-surface"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <nav
          className="scrollbar-hide flex gap-1 overflow-x-auto border-t border-line/70 px-4 py-2 xl:hidden"
          aria-label="Quick links"
        >
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} />

      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white animate-fade-in md:hidden">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="rounded-xl p-2 text-ink hover:bg-surface"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={goSearch} className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, toys, accessories & more..."
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-sm outline-none focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>
          <div className="overflow-y-auto px-4 py-4">
            {!searchQuery.trim() ? (
              <p className="text-sm text-muted">
                Try “dog food”, “cat toys”, or a brand name.
              </p>
            ) : totalMatches === 0 ? (
              <p className="text-sm text-muted">
                No products found for &apos;{searchQuery}&apos;.
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs font-medium text-muted">
                  {totalMatches} result{totalMatches === 1 ? '' : 's'}
                </p>
                <ul className="space-y-2">
                  {searchProducts(products, searchQuery).map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/product/${product.slug || product.id}`}
                        onClick={() => {
                          setSearchQuery('')
                          setMobileSearchOpen(false)
                        }}
                        className="flex items-center gap-3 rounded-2xl border border-line p-3"
                      >
                        <img
                          src={product.image}
                          alt=""
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted">
                            {product.brand} · {product.petType}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={goSearch}
                  className="mt-4 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white"
                >
                  View all on search page
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
