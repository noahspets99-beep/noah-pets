import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogProvider'

/**
 * Promo / offers banner — same layout; content prefers active Firebase banners.
 */
export default function PromoBanner() {
  const { banners } = useCatalog()
  const banner =
    (banners || []).find((b) => b.active !== false) || null

  const eyebrow = banner?.eyebrow || banner?.badge || 'Limited season offers'
  const title =
    banner?.title || banner?.heading || 'Give Your Pet More. Spend Less.'
  const subtitle =
    banner?.subtitle ||
    banner?.description ||
    'Up to 30% OFF on selected pet essentials — food, toys, beds and grooming must-haves.'
  const ctaLabel = banner?.ctaLabel || banner?.buttonText || 'Shop Offers'
  const ctaTo = banner?.link || banner?.ctaLink || '/offers'
  const image =
    banner?.image ||
    banner?.imageUrl ||
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'
  const badge = banner?.discountLabel || banner?.offerText || '30% OFF'

  const Cta = ctaTo.startsWith('/') ? Link : 'a'
  const ctaProps =
    ctaTo.startsWith('/')
      ? { to: ctaTo }
      : { href: ctaTo.startsWith('#') ? ctaTo : '/offers' }

  return (
    <section id="offers" className="py-4 sm:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-brand-600 via-brand-500 to-sky-400 px-6 py-10 shadow-lift sm:px-10 sm:py-12 lg:px-14">
          <div
            className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/15 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 right-20 h-48 w-48 rounded-full bg-accent/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border-[16px] border-white/10"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-xl animate-fade-up">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                {eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 text-sm text-white/90 sm:text-base">{subtitle}</p>
              <Cta
                {...ctaProps}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98]"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Cta>
            </div>

            <div className="relative mx-auto hidden h-48 w-full max-w-sm sm:block lg:h-56">
              <img
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute left-4 top-2 h-36 w-36 rounded-3xl object-cover shadow-lift ring-4 ring-white/30 animate-float sm:h-40 sm:w-40"
              />
              <div className="absolute right-10 top-0 rounded-2xl bg-accent px-3 py-2 text-xs font-extrabold text-white shadow-soft">
                {badge}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
