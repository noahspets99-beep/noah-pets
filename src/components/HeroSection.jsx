import { useEffect, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogProvider'

const ROTATE_MS = 5500

function bannerImage(b) {
  return String(b?.image || b?.imageUrl || '').trim()
}

function isHeroPosition(b) {
  const position = String(b?.position || '').trim().toLowerCase()
  if (!position) return true
  return position.includes('hero')
}

export default function HeroSection() {
  const { banners, loading } = useCatalog()

  const heroBanners = useMemo(() => {
    const list = Array.isArray(banners) ? banners.filter(Boolean) : []
    const heroOnly = list.filter(isHeroPosition)
    const pool = heroOnly.length > 0 ? heroOnly : list
    return pool.filter((b) => bannerImage(b) || b.title || b.heading)
  }, [banners])

  const [index, setIndex] = useState(0)
  const bannerKey = useMemo(
    () =>
      heroBanners
        .map((b) => `${b.id}:${bannerImage(b)}:${b.updatedAt || ''}`)
        .join('|'),
    [heroBanners],
  )

  useEffect(() => {
    setIndex(0)
  }, [bannerKey])

  useEffect(() => {
    if (heroBanners.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % heroBanners.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [heroBanners.length, bannerKey])

  const banner =
    heroBanners[Math.min(index, Math.max(heroBanners.length - 1, 0))] || null
  const title = banner?.title || banner?.heading || ''
  const subtitle = banner?.subtitle || banner?.description || ''
  const ctaLabel = banner?.ctaLabel || banner?.buttonText || ''
  const ctaTo = banner?.ctaLink || banner?.link || '/shop'
  const image = bannerImage(banner)
  const badge = banner?.discountLabel || banner?.offerText || banner?.badge || ''

  const hasCta = Boolean(ctaLabel)
  const Cta = typeof ctaTo === 'string' && ctaTo.startsWith('/') ? Link : 'a'
  const ctaProps =
    typeof ctaTo === 'string' && ctaTo.startsWith('/')
      ? { to: ctaTo }
      : {
          href:
            typeof ctaTo === 'string' &&
            (ctaTo.startsWith('#') || ctaTo.startsWith('http'))
              ? ctaTo
              : '/shop',
        }

  if (loading && heroBanners.length === 0) {
    return (
      <section id="home" className="relative w-full overflow-hidden bg-surface">
        <div className="mx-auto w-full max-w-7xl px-0 sm:px-4 lg:px-8">
          <div className="aspect-[4/5] w-full animate-pulse bg-brand-100 sm:aspect-[16/9] lg:aspect-[2.4/1] sm:rounded-2xl" />
        </div>
      </section>
    )
  }

  if (!loading && heroBanners.length === 0) {
    return (
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-sky-50"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Noah&apos;s Pets
            </h1>
            <p className="mt-2 text-sm text-muted">Premium care for every pet</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-600"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="home" className="relative w-full overflow-x-hidden bg-white">
      <div className="mx-auto w-full max-w-7xl px-0 sm:px-4 lg:px-8">
        {/*
          Same Hero structure on all breakpoints.
          Mobile: taller frame so the banner image reads clearly.
          Desktop: wider/shorter cinematic frame.
        */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink sm:aspect-[16/9] sm:rounded-2xl lg:aspect-[2.4/1]">
          {image ? (
            <img
              key={`${banner?.id || 'banner'}-${image}`}
              src={image}
              alt={title || "Noah's Pets banner"}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-sky-400" />
          )}

          <div
            className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-ink/5 sm:bg-gradient-to-r sm:from-ink/70 sm:via-ink/30 sm:to-transparent"
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-end sm:items-center">
            <div className="w-full max-w-xl px-4 pb-8 pt-10 sm:px-8 sm:pb-0 lg:px-10">
              {badge ? (
                <span className="inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-soft sm:text-xs">
                  {badge}
                </span>
              ) : null}

              {title ? (
                <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                  {title}
                </h1>
              ) : null}

              {subtitle ? (
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90 sm:mt-3 sm:text-base">
                  {subtitle}
                </p>
              ) : null}

              {hasCta ? (
                <Cta
                  {...ctaProps}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-600 active:scale-[0.98] sm:mt-6 sm:px-6 sm:py-3"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Cta>
              ) : null}
            </div>
          </div>

          {heroBanners.length > 1 && (
            <div
              className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-5"
              aria-label="Banner slides"
            >
              {heroBanners.map((b, i) => (
                <button
                  key={b.id || i}
                  type="button"
                  aria-label={`Show banner ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition ${
                    i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
