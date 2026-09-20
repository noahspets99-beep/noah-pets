import { Navigate, Outlet } from 'react-router-dom'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'
import Toast from './Toast'
import BottomNav from './BottomNav'
import { ShopProvider } from '../context/ShopContext'
import { CatalogProvider } from '../context/CatalogProvider'
import { useAuth } from '../context/useAuth'
import JsonLd from './seo/JsonLd'
import { organizationSchema, websiteSchema } from '../lib/schema'

/**
 * When the configured admin email is signed in, keep frontend routing on Admin.
 * Does not weaken Firestore/backend admin checks — routing only.
 */
function AdminStorefrontRedirect({ children }) {
  const { authReady, isAdmin } = useAuth()
  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-white text-sm text-muted">
        Checking authentication…
      </div>
    )
  }
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }
  return children
}

export default function StoreLayout() {
  return (
    <CatalogProvider>
      <ShopProvider>
        <AdminStorefrontRedirect>
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
        </AdminStorefrontRedirect>
      </ShopProvider>
    </CatalogProvider>
  )
}
