import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import ScrollToTop from './components/ScrollToTop'
import StoreLayout from './components/StoreLayout'
import { AuthProvider } from './context/AuthProvider'
import AboutPage from './pages/AboutPage'
import AccountPage from './pages/AccountPage'
import BlogListPage from './pages/BlogListPage'
import BlogPostPage from './pages/BlogPostPage'
import CartPage from './pages/CartPage'
import CategoryPage from './pages/CategoryPage'
import CheckoutPage from './pages/CheckoutPage'
import ContactPage from './pages/ContactPage'
import FaqPage from './pages/FaqPage'
import LocationPage from './pages/LocationPage'
import NotFoundPage from './pages/NotFoundPage'
import OffersPage from './pages/OffersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersPage from './pages/OrdersPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ReturnsPage from './pages/ReturnsPage'
import SearchPage from './pages/SearchPage'
import ShippingPage from './pages/ShippingPage'
import ShopHomePage from './pages/ShopHomePage'
import WishlistPage from './pages/WishlistPage'

// Admin is code-split so storefront visitors don't download the admin bundle.
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'))
const AdminStoreProvider = lazy(() =>
  import('./context/AdminStore').then((m) => ({ default: m.AdminStoreProvider })),
)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const BannersPage = lazy(() => import('./pages/admin/BannersPage'))
const BlogAdminPage = lazy(() => import('./pages/admin/BlogAdminPage'))
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'))
const CouponsPage = lazy(() => import('./pages/admin/CouponsPage'))
const CustomersPage = lazy(() => import('./pages/admin/CustomersPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const HomepagePage = lazy(() => import('./pages/admin/HomepagePage'))
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage'))
const AdminOrderDetailPage = lazy(() => import('./pages/admin/OrderDetailPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/OrdersPage'))
const PaymentsPage = lazy(() => import('./pages/admin/PaymentsPage'))
const ProductFormPage = lazy(() => import('./pages/admin/ProductFormPage'))
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))
const ReviewsPage = lazy(() => import('./pages/admin/ReviewsPage'))
const SeoPage = lazy(() => import('./pages/admin/SeoPage'))
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'))
const AdminShippingPage = lazy(() => import('./pages/admin/ShippingPage'))

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted">
      Loading admin…
    </div>
  )
}

function AdminTree() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminStoreProvider>
        <AdminLayout />
      </AdminStoreProvider>
    </Suspense>
  )
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<ShopHomePage />} />
              <Route path="products/:categorySlug" element={<CategoryPage />} />
              <Route path="product/:slug" element={<ProductDetailPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="shipping" element={<ShippingPage />} />
              <Route path="returns" element={<ReturnsPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="blog" element={<BlogListPage />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
              <Route path="locations/:citySlug" element={<LocationPage />} />
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route
              path="/admin-login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route path="/admin/login" element={<Navigate to="/admin-login" replace />} />
            <Route path="/admin" element={<AdminTree />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="banners" element={<BannersPage />} />
              <Route path="homepage" element={<HomepagePage />} />
              <Route path="blog" element={<BlogAdminPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="seo" element={<SeoPage />} />
              <Route path="shipping" element={<AdminShippingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
