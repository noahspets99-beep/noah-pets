import { Outlet } from 'react-router-dom'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'
import Toast from './Toast'
import BottomNav from './BottomNav'
import { ShopProvider } from '../context/ShopContext'
import JsonLd from './seo/JsonLd'
import { organizationSchema, websiteSchema } from '../lib/schema'

export default function StoreLayout() {
  return (
    <ShopProvider>
      <div className="min-h-screen overflow-x-hidden bg-white pb-16 md:pb-0">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <BottomNav />
        <CartDrawer />
        <Toast />
      </div>
    </ShopProvider>
  )
}
