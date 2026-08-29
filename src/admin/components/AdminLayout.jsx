import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  getSidebarCollapsed,
  isAdminLoggedIn,
} from '../../services/adminAuth'
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
  '/admin/reviews': 'Reviews',
  '/admin/coupons': 'Coupons',
  '/admin/banners': 'Banners',
  '/admin/settings': 'Settings',
}

function resolveTitle(pathname) {
  if (titles[pathname]) return titles[pathname]
  if (pathname.includes('/products/') && pathname.endsWith('/edit')) {
    return 'Edit Product'
  }
  if (pathname.startsWith('/admin/orders/')) return 'Order Details'
  return 'Admin'
}

export default function AdminLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(getSidebarCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />
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
