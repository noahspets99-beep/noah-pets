import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, PawPrint } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { loginAdmin, requestPasswordReset } from '../../services/adminAuth'

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
        <p className="text-sm font-medium text-muted">Checking authentication…</p>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const { authReady, isAdmin, isAuthenticated, isFirebaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMsg, setForgotMsg] = useState('')

  if (!authReady) {
    return <AuthLoadingScreen />
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setForgotMsg('')
    setLoading(true)
    const result = await loginAdmin(email, password, remember)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    if (result.isAdmin) {
      navigate('/admin/dashboard', { replace: true })
      return
    }
    navigate('/', { replace: true })
  }

  const handleForgotPassword = async () => {
    setError('')
    setForgotMsg('')
    if (!email.trim()) {
      setError('Enter your email above, then tap Forgot password.')
      return
    }
    const result = await requestPasswordReset(email)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setForgotMsg(result.message)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-sky-400 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <PawPrint className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-extrabold">Noah&apos;s Pets</p>
              <p className="text-xs uppercase tracking-[0.16em] text-white/70">
                Admin Console
              </p>
            </div>
          </div>
          <h1 className="mt-16 max-w-md text-4xl font-extrabold leading-tight">
            Manage your pet store with clarity and confidence.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
            Track orders, inventory, customers and campaigns from one premium
            dashboard built for Noah&apos;s Pets.
          </p>
        </div>
        <div className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10 shadow-lift backdrop-blur animate-float">
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&h=700&fit=crop"
            alt="Happy dog"
            className="aspect-[4/3] w-full object-cover opacity-95"
          />
        </div>
      </aside>

      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
              <PawPrint className="h-5 w-5" />
            </span>
            <div>
              <p className="font-extrabold text-ink">Noah&apos;s Pets</p>
              <p className="text-xs text-muted">Admin Console</p>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted">
            Sign in with your Noah Pets administrator account
          </p>

          {!isFirebaseConfigured && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
            >
              Firebase is not configured. Add VITE_FIREBASE_* values to
              .env.local and restart the dev server.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-danger animate-fade-in"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-ink">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 pr-12 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </button>
            </div>

            {forgotMsg && (
              <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-700 animate-fade-in">
                {forgotMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !isFirebaseConfigured}
              className="flex w-full items-center justify-center rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted">
            <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
              ← Back to storefront
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
