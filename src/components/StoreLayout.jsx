import { Outlet } from 'react-router-dom'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'
import Toast from './Toast'
import BottomNav from './BottomNav'
import { ShopProvider } from '../context/ShopContext'
import { CatalogProvider } from '../context/CatalogProvider'
import JsonLd from './seo/JsonLd'
import { organizationSchema, websiteSchema } from '../lib/schema'

export default function StoreLayout() {
  return (
    <CatalogProvider>
      <ShopProvider>
        <div className="min-h-screen bg-white pb-16 md:pb-0">
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
    </CatalogProvider>
  )
}
