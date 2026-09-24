import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'
import Toast from './Toast'
import BottomNav from './BottomNav'
import { ShopProvider } from '../context/ShopContext'
import { CatalogProvider } from '../context/CatalogProvider'
import {
  StoreContentProvider,
  useStoreContent,
} from '../context/StoreContentProvider'
import JsonLd from './seo/JsonLd'
import { organizationSchema, websiteSchema } from '../lib/schema'

function SiteSeoDefaults() {
  const { homepageSeo, seoReady } = useStoreContent()
  if (!seoReady) return null
  const verification = homepageSeo.googleVerification
  const analyticsId = homepageSeo.analyticsId
  if (!verification && !analyticsId) return null
  return (
    <Helmet>
      {verification ? (
        <meta name="google-site-verification" content={verification} />
      ) : null}
      {analyticsId ? (
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
        />
      ) : null}
      {analyticsId ? (
        <script>
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${String(analyticsId).replace(/'/g, '')}');`}
        </script>
      ) : null}
    </Helmet>
  )
}

/**
 * Storefront shell. Admin auth still gates /admin routes separately.
 * CatalogProvider stays mounted so banner/catalog cache invalidation works
 * when returning from Admin to Home.
 */
export default function StoreLayout() {
  return (
    <CatalogProvider>
      <StoreContentProvider>
        <ShopProvider>
          <div className="min-h-screen bg-white pb-16 md:pb-0">
            <SiteSeoDefaults />
            <JsonLd data={[organizationSchema(), websiteSchema()]} />
            <Header />
            <main className="overflow-x-hidden">
              <Outlet />
            </main>
            <div className="overflow-x-hidden">
              <Footer />
            </div>
            <BottomNav />
            <CartDrawer />
            <Toast />
          </div>
        </ShopProvider>
      </StoreContentProvider>
    </CatalogProvider>
  )
}
