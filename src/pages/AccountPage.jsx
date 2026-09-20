import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { isAdminUser } from '../config/admin'
import {
  Heart,
  LogOut,
  Mail,
  Package,
  Phone,
  ShoppingBag,
  User,
} from 'lucide-react'
import { STORE } from '../config/store'
import { useAuth } from '../context/useAuth'
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

const fieldClass =
  'mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100'

export default function AccountPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orders, wishlistCount, cartCount, showToast } = useShop()
  const {
    user,
    authReady,
    isAuthenticated,
    isFirebaseConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  } = useAuth()

  const nextPath =
    typeof location.state?.next === 'string' && location.state.next.startsWith('/')
      ? location.state.next
      : null
  const authMessage =
    typeof location.state?.authMessage === 'string'
      ? location.state.authMessage
      : ''

  const [mode, setMode] = useState('signin') // signin | signup
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authReady || !isAuthenticated || !user) return
    // Configured admin email always lands in Admin — never the customer account page
    if (isAdminUser(user)) {
      navigate('/admin/dashboard', { replace: true })
      return
    }
    if (nextPath) {
      navigate(nextPath, { replace: true })
    }
  }, [authReady, isAuthenticated, user, nextPath, navigate])

  const myOrders = isAuthenticated
    ? orders.filter(
        (o) =>
          o.customerId === user?.uid ||
          o.customer?.email?.toLowerCase() === user?.email?.toLowerCase() ||
          o.shippingAddress?.email?.toLowerCase() === user?.email?.toLowerCase(),
      )
    : orders

  const resetForm = () => {
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  const afterAuthSuccess = (authUser, toastMessage) => {
    resetForm()
    showToast(toastMessage)
    if (isAdminUser(authUser)) {
      navigate('/admin/dashboard', { replace: true })
      return
    }
    if (nextPath) {
      navigate(nextPath, { replace: true })
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn({ email, password })
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    afterAuthSuccess(result.user, 'Signed in successfully')
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Enter your name')
      return
    }
    if (!email.includes('@')) {
      setError('Enter a valid email')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const result = await signUp({ name, email, password })
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    afterAuthSuccess(result.user, 'Account created')
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    const result = await signInWithGoogle()
    setLoading(false)
    if (!result.ok) {
      if (!result.cancelled) setError(result.error)
      return
    }
    afterAuthSuccess(result.user, 'Signed in with Google')
  }

  const handleSignOut = async () => {
    await signOut()
    showToast('Signed out', 'info')
  }

  if (!authReady) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <SeoHead title="Account" noindex canonical="/account" />
        <p className="text-sm text-muted">Loading account…</p>
      </div>
    )
  }

  // Configured admin must never stay on the customer account surface
  if (isAuthenticated && isAdminUser(user)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-8 sm:px-6 lg:py-10">
        <SeoHead title="Account" noindex canonical="/account" />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {authMessage ||
            (mode === 'signin'
              ? 'Sign in to view your orders and account.'
              : 'Register with email or continue with Google.')}
        </p>

        {!isFirebaseConfigured && (
          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Firebase Auth is not configured. Add VITE_FIREBASE_* to .env.local.
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-danger"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
            className="space-y-4"
          >
            {mode === 'signup' && (
              <label className="block text-sm font-semibold text-ink">
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className={fieldClass}
                />
              </label>
            )}
            <label className="block text-sm font-semibold text-ink">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={fieldClass}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                className={fieldClass}
              />
            </label>
            {mode === 'signup' && (
              <label className="block text-sm font-semibold text-ink">
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={fieldClass}
                />
              </label>
            )}

            <button
              type="submit"
              disabled={loading || !isFirebaseConfigured}
              className="flex w-full items-center justify-center rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {loading
                ? 'Please wait…'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>

          <div className="relative my-5 text-center text-xs font-semibold uppercase tracking-wide text-muted">
            <span className="relative z-10 bg-white px-3">or</span>
            <span className="absolute inset-x-0 top-1/2 border-t border-line" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || !isFirebaseConfigured}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white py-3 text-sm font-semibold text-ink transition hover:bg-surface disabled:opacity-60"
          >
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-muted">
            {mode === 'signin' ? (
              <>
                New here?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setError('')
                  }}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setError('')
                  }}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    )
  }

  const displayName =
    user.displayName || user.email?.split('@')[0] || 'Pet parent'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead title="Account" noindex canonical="/account" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">
            Account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Signed in as {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <User className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold text-ink">{displayName}</p>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
          {myOrders.length} orders
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
