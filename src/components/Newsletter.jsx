import { useState } from 'react'
import { useShop } from '../context/useShop'

export default function Newsletter() {
  const { showToast } = useShop()
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    showToast('You’re subscribed! Welcome to the pack.')
    setEmail('')
  }

  return (
    <section className="bg-surface py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-sky-50 px-6 py-8 sm:px-10 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-lg">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Get More Tail Wags.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Join our pet-loving community and get exclusive offers, product
              updates and pet care tips.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex w-full max-w-md flex-col gap-2 sm:flex-row lg:mt-0"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 active:scale-[0.98]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
