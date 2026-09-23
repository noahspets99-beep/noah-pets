import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getSidebarCollapsed } from '../../services/adminAuth'
import { useAuth } from '../../context/useAuth'
import AdminSidebar from './AdminSidebar'
import AdminToastStack from './AdminToastStack'
import AdminTopbar from './AdminTopbar'
import { useState } from 'react'

const titles = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/new': 'Add Product',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/inventory': 'Inventory',
  '/admin/reviews': 'Reviews',
  '/admin/coupons': 'Coupons',
  '/admin/banners': 'Banners',
  '/admin/payments': 'Payments',
  '/admin/blog': 'Blog',
  '/admin/settings': 'Settings',
  '/admin/seo': 'SEO',
  '/admin/shipping': 'Shipping',
  '/admin/reports': 'Reports',
  '/admin/homepage': 'Homepage',
}

function resolveTitle(pathname) {
  if (titles[pathname]) return titles[pathname]
  if (pathname.includes('/products/') && pathname.endsWith('/edit')) {
    return 'Edit Product'
  }
  if (pathname.startsWith('/admin/orders/')) return 'Order Details'
  return 'Admin'
}

function AuthGateScreen({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
        <p className="text-sm font-medium text-muted">{message}</p>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const location = useLocation()
  const { authReady, isAuthenticated, isAdmin } = useAuth()
  const [collapsed, setCollapsed] = useState(getSidebarCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Wait for Firebase auth before rendering admin UI (avoids flash of content)
  if (!authReady) {
    return <AuthGateScreen message="Verifying admin access…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64'
        }`}
      >
        <AdminTopbar
          title={resolveTitle(location.pathname)}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <AdminToastStack />
    </div>
  )
}
