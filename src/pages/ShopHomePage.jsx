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
import ShopCategorySection from '../components/ShopCategorySection'
import TrustFeatures from '../components/TrustFeatures'
import SeoHead from '../components/seo/SeoHead'
import { DEFAULT_SEO } from '../config/store'

export default function ShopHomePage() {
  return (
    <>
      <SeoHead
        title={DEFAULT_SEO.defaultTitle}
        description={DEFAULT_SEO.defaultDescription}
        keywords={DEFAULT_SEO.keywords}
        canonical="/"
      />
      <HeroSection />
      <PetCategorySection />
      <ShopCategorySection />
      <FeaturedProducts />
      <PromoBanner />
      <BestSellers />
      <NewArrivalsSection />
      <DealsSection />
      <PetProductsRow
        petType="Dogs"
        title="For Dogs"
        subtitle="Food, treats, toys and gear for every good boy and girl."
        slug="dogs"
      />
      <PetProductsRow
        petType="Cats"
        title="For Cats"
        subtitle="Nutrition, litter and enrichment for feline homes."
        slug="cats"
      />
      <PetProductsRow
        petType="Birds"
        title="For Birds"
        subtitle="Seeds, cages and enrichment for feathered companions."
        slug="birds"
        limit={4}
      />
      <PetProductsRow
        petType="Fish"
        title="For Fish"
        subtitle="Food, tanks and water care for aquariums."
        slug="fish"
        limit={4}
      />
      <FoodSection />
      <AccessoriesSection />
      <BrandsSection />
      <TrustFeatures />
      <DeliveryTNSection />
      <ReviewsSection />
      <CareTipsSection />
      <FaqSection />
      <Newsletter />
    </>
  )
}
