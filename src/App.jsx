import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import AdminLayout from './admin/components/AdminLayout'
import StoreLayout from './components/StoreLayout'
import { AdminStoreProvider } from './context/AdminStore'
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
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersPage from './pages/OrdersPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ReturnsPage from './pages/ReturnsPage'
import SearchPage from './pages/SearchPage'
import ShippingPage from './pages/ShippingPage'
import ShopHomePage from './pages/ShopHomePage'
import WishlistPage from './pages/WishlistPage'
import AdminLogin from './pages/admin/AdminLogin'
import BannersPage from './pages/admin/BannersPage'
import BlogAdminPage from './pages/admin/BlogAdminPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import CouponsPage from './pages/admin/CouponsPage'
import CustomersPage from './pages/admin/CustomersPage'
import DashboardPage from './pages/admin/DashboardPage'
import HomepagePage from './pages/admin/HomepagePage'
import InventoryPage from './pages/admin/InventoryPage'
import AdminOrderDetailPage from './pages/admin/OrderDetailPage'
import AdminOrdersPage from './pages/admin/OrdersPage'
import PaymentsPage from './pages/admin/PaymentsPage'
import ProductFormPage from './pages/admin/ProductFormPage'
import ProductsPage from './pages/admin/ProductsPage'
import ReportsPage from './pages/admin/ReportsPage'
import ReviewsPage from './pages/admin/ReviewsPage'
import SeoPage from './pages/admin/SeoPage'
import SettingsPage from './pages/admin/SettingsPage'
import AdminShippingPage from './pages/admin/ShippingPage'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
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

          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<Navigate to="/admin-login" replace />} />
          <Route
            path="/admin"
            element={
              <AdminStoreProvider>
                <AdminLayout />
              </AdminStoreProvider>
            }
          >
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
    </HelmetProvider>
  )
}

export default App
