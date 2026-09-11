import PromoBanner from '../components/PromoBanner'
import DealsSection from '../components/DealsSection'
import BestSellers from '../components/BestSellers'
import SeoHead from '../components/seo/SeoHead'

/**
 * Offers destination — reuses existing promo + deals sections (no redesign).
 */
export default function OffersPage() {
  return (
    <>
      <SeoHead
        title="Offers & Deals"
        description="Limited season offers and discounted pet essentials at Noah's Pets."
        canonical="/offers"
      />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Offers
        </h1>
        <p className="mt-2 text-sm text-muted">
          Seasonal savings on food, toys, beds and everyday pet essentials.
        </p>
      </div>
      <PromoBanner />
      <DealsSection />
      <BestSellers />
    </>
  )
}
