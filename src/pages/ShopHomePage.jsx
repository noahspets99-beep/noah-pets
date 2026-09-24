import AccessoriesSection from '../components/AccessoriesSection'
import BestSellers from '../components/BestSellers'
import BrandsSection from '../components/BrandsSection'
import CareTipsSection from '../components/CareTipsSection'
import DealsSection from '../components/DealsSection'
import DeliveryTNSection from '../components/DeliveryTNSection'
import FaqSection from '../components/FaqSection'
import FeaturedProducts from '../components/FeaturedProducts'
import FoodSection from '../components/FoodSection'
import HeroSection from '../components/HeroSection'
import NewArrivalsSection from '../components/NewArrivalsSection'
import Newsletter from '../components/Newsletter'
import PetCategorySection from '../components/PetCategorySection'
import PetProductsRow from '../components/PetProductsRow'
import PromoBanner from '../components/PromoBanner'
import ReviewsSection from '../components/ReviewsSection'
import TrustFeatures from '../components/TrustFeatures'
import SeoHead from '../components/seo/SeoHead'
import { useStoreContent } from '../context/StoreContentProvider'
import { getEnabledHomepageSections } from '../data/homepageSections'

function renderSection(section) {
  const config = section.config || {}
  switch (section.key) {
    case 'hero':
      return <HeroSection key={section.id} />
    case 'shopByPet':
    case 'shopByCategory':
      return <PetCategorySection key={section.id} />
    case 'featured':
      return <FeaturedProducts key={section.id} config={config} />
    case 'promo':
      return <PromoBanner key={section.id} />
    case 'bestSellers':
      return <BestSellers key={section.id} config={config} />
    case 'newArrivals':
      return <NewArrivalsSection key={section.id} config={config} />
    case 'deals':
      return <DealsSection key={section.id} config={config} />
    case 'dogProducts':
    case 'catProducts':
    case 'birdProducts':
    case 'fishProducts':
      return (
        <PetProductsRow
          key={section.id}
          petType={config.petType || 'Dogs'}
          title={config.title || section.title}
          subtitle={config.subtitle || ''}
          slug={config.slug || String(config.petType || 'dogs').toLowerCase()}
          limit={config.limit || 8}
        />
      )
    case 'food':
    case 'recommended':
      return <FoodSection key={section.id} />
    case 'accessories':
      return <AccessoriesSection key={section.id} />
    case 'brands':
      return <BrandsSection key={section.id} config={config} />
    case 'whyChooseUs':
      return <TrustFeatures key={section.id} config={config} />
    case 'deliveryTN':
      return <DeliveryTNSection key={section.id} config={config} />
    case 'reviews':
      return <ReviewsSection key={section.id} config={config} />
    case 'careTips':
      return <CareTipsSection key={section.id} />
    case 'faq':
      return <FaqSection key={section.id} />
    case 'newsletter':
      return <Newsletter key={section.id} />
    default:
      return null
  }
}

export default function ShopHomePage() {
  const { homepageSeo, homepageSections, homepageReady } = useStoreContent()
  const sections = getEnabledHomepageSections(
    homepageReady && homepageSections?.length
      ? homepageSections
      : undefined,
  )

  return (
    <>
      <SeoHead
        title={homepageSeo.title}
        description={homepageSeo.description}
        keywords={homepageSeo.keywords}
        canonical="/"
        ogTitle={homepageSeo.ogTitle || undefined}
        ogDescription={homepageSeo.ogDescription || undefined}
        ogImage={homepageSeo.ogImage || undefined}
        twitterCard={homepageSeo.twitterCard}
        googleVerification={homepageSeo.googleVerification || undefined}
        analyticsId={homepageSeo.analyticsId || undefined}
      />
      {sections.map((section) => renderSection(section))}
    </>
  )
}
