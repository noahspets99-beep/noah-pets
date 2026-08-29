import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { formatPrice } from '../data/products'
import { useShop } from '../context/useShop'

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartSubtotal,
    couponDiscount,
    shipping,
    tax,
    cartTotal,
    removeFromCart,
    updateQuantity,
  } = useShop()
  const navigate = useNavigate()

  if (!cartOpen) return null

  const goCheckout = () => {
    setCartOpen(false)
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        aria-label="Close cart"
        onClick={() => setCartOpen(false)}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold text-ink">Your Cart</h2>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {cart.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="rounded-xl p-2 text-muted transition hover:bg-surface hover:text-ink"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <p className="font-semibold text-ink">Your cart is empty</p>
              <p className="text-sm text-muted">
                Add some treats and essentials for your pet.
              </p>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mt-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li
                  key={`${item.id}-${item.variantId || 'default'}`}
                  className="flex gap-3 rounded-2xl border border-line p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">
                          {item.name}
                        </p>
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
                        className="rounded-lg p-1 text-muted hover:bg-red-50 hover:text-danger"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
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
                          aria-label="Decrease quantity"
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
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-ink">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-line px-5 py-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold text-ink">
                {formatPrice(cartSubtotal)}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted">Discount</span>
                <span className="font-semibold text-success">
                  −{formatPrice(couponDiscount)}
                </span>
              </div>
            )}
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted">Shipping</span>
              <span className="font-semibold text-ink">
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted">GST</span>
              <span className="font-semibold text-ink">{formatPrice(tax)}</span>
            </div>
            <div className="mb-4 flex items-center justify-between border-t border-line pt-3">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="text-xl font-extrabold text-ink">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={goCheckout}
              className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600 active:scale-[0.99]"
            >
              Checkout
            </button>
            <Link
              to="/cart"
              onClick={() => setCartOpen(false)}
              className="mt-2 block text-center text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View full cart
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
