import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { formatPrice } from '../data/products'
import { useShop } from '../context/useShop'
import SeoHead from '../components/seo/SeoHead'

export default function CartPage() {
  const {
    cart,
    cartSubtotal,
    couponDiscount,
    shipping,
    tax,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    removeFromCart,
    updateQuantity,
  } = useShop()

  const handleCoupon = (e) => {
    e.preventDefault()
    const code = new FormData(e.currentTarget).get('coupon')
    applyCoupon(code)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead title="Your Cart" noindex canonical="/cart" />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Cart</h1>

      {cart.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <ShoppingBag className="h-10 w-10 text-brand-500" />
          <p className="mt-4 font-semibold text-ink">Your cart is empty</p>
          <Link
            to="/products/dogs"
            className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={`${item.id}-${item.variantId || 'default'}`}
                className="flex gap-4 rounded-2xl border border-line bg-white p-4 shadow-card"
              >
                <img
                  src={item.image}
                  alt=""
                  className="h-24 w-24 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/product/${item.slug || item.id}`}
                        className="font-bold text-ink hover:text-brand-700"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted">
                        {item.brand}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.id, item.variantId || null)
                      }
                      className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-danger"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1,
                            item.variantId || null,
                          )
                        }
                        className="rounded-lg p-1.5 hover:bg-white"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1,
                            item.variantId || null,
                          )
                        }
                        className="rounded-lg p-1.5 hover:bg-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-bold text-ink">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="text-lg font-bold text-ink">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{formatPrice(cartSubtotal)}</dd>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Discount</dt>
                  <dd className="font-semibold">−{formatPrice(couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-semibold">
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">GST</dt>
                <dd className="font-semibold">{formatPrice(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-extrabold">{formatPrice(cartTotal)}</dd>
              </div>
            </dl>

            {appliedCoupon ? (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-sm">
                <span className="font-semibold text-brand-700">
                  {appliedCoupon.code}
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-semibold text-muted hover:text-danger"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCoupon} className="mt-4 flex gap-2">
                <input
                  name="coupon"
                  placeholder="Coupon code"
                  className="flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-surface"
                >
                  Apply
                </button>
              </form>
            )}

            <Link
              to="/checkout"
              className="mt-5 flex w-full items-center justify-center rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600"
            >
              Proceed to checkout
            </Link>
            <p className="mt-2 text-center text-xs text-muted">
              Try WELCOME100 or PETLOVE20
            </p>
          </aside>
        </div>
      )}
    </div>
  )
}
