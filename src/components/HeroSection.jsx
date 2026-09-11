import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-sky-50"
    >
      <div
        className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Everything Your Pet Loves
          </span>

          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            Happy Pets.
            <span className="block text-brand-600">Happier Homes.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            Premium food, toys, grooming essentials and accessories for dogs,
            cats and every companion — delivered across Tamil Nadu with care.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/products/dog-food"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-600 hover:shadow-lift active:scale-[0.98]"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#shop-by-pet"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-brand-200 hover:bg-brand-50"
            >
              Explore Categories
            </a>
          </div>
        </div>

        <div
          className="relative mx-auto w-full max-w-lg animate-fade-up lg:max-w-none"
          style={{ animationDelay: '0.12s' }}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-brand-100 shadow-lift sm:aspect-[5/4]">
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&h=800&fit=crop"
              alt="Happy golden retriever ready for a walk"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
          </div>

          <div className="absolute -left-2 top-6 max-w-[11rem] rounded-2xl border border-white/70 bg-white/95 p-3 shadow-lift backdrop-blur animate-float sm:-left-4 sm:max-w-[13rem] sm:p-3.5">
            <img
              src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop"
              alt=""
              loading="lazy"
              decoding="async"
              className="mb-2 h-12 w-12 rounded-xl object-cover"
            />
            <p className="text-xs font-bold text-ink sm:text-sm">
              Premium Dog Food
            </p>
            <p className="text-[11px] text-success sm:text-xs">24% off today</p>
          </div>

          <div
            className="absolute -right-1 bottom-8 max-w-[10.5rem] rounded-2xl border border-white/70 bg-white/95 p-3 shadow-lift backdrop-blur animate-float sm:-right-3 sm:max-w-[12rem]"
            style={{ animationDelay: '1.2s' }}
          >
            <img
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop"
              alt=""
              loading="lazy"
              decoding="async"
              className="mb-2 h-12 w-12 rounded-xl object-cover"
            />
            <p className="text-xs font-bold text-ink sm:text-sm">
              Cat Essentials
            </p>
            <p className="text-[11px] text-muted sm:text-xs">Free shipping*</p>
          </div>

          <div className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1.5 text-xs font-extrabold text-white shadow-soft sm:right-6 sm:top-6 sm:px-4 sm:py-2 sm:text-sm">
            Up to 30% OFF
          </div>
        </div>
      </div>
    </section>
  )
}
