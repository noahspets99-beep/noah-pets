import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Image,
  Layout,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Newspaper,
  Package,
  PawPrint,
  Award,
  Search,
  Settings,
  ShoppingBag,
  Tag,
  TicketPercent,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  logoutAdmin,
  setSidebarCollapsed,
} from '../../services/adminAuth'
import { useAdminStore } from '../../context/useAdminStore'

const navGroups = [
  {
    label: null,
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/categories', label: 'Categories', icon: Tag },
      { to: '/admin/brands', label: 'Brands', icon: Award },
      { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
      { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    ],
  },
  {
    label: 'Customers',
    items: [
      { to: '/admin/customers', label: 'Customers', icon: Users },
      { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/banners', label: 'Banners', icon: Image },
      { to: '/admin/homepage', label: 'Homepage', icon: Layout },
      { to: '/admin/blog', label: 'Blog', icon: Newspaper },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
      { to: '/admin/seo', label: 'SEO', icon: Search },
    ],
  },
  {
    label: 'Store',
    items: [
      { to: '/admin/shipping', label: 'Shipping', icon: Truck },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

function NavItems({ collapsed, onNavigate, onLogout, pendingOrderCount = 0 }) {
  return (
    <>
      {navGroups.map((group, gi) => (
        <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
          {group.label && !collapsed && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              {group.label}
            </p>
          )}
          <ul className="space-y-1">
            {group.items.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/admin/dashboard' || to === '/admin/products'}
                  onClick={onNavigate}
                  title={
                    collapsed
                      ? to === '/admin/orders' && pendingOrderCount > 0
                        ? `${label} (${pendingOrderCount})`
                        : label
                      : undefined
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                        : 'text-ink-soft hover:bg-surface hover:text-ink'
                    } ${collapsed ? 'justify-center px-2' : ''}`
                  }
                >
                  <span className="relative shrink-0">
                    <Icon className="h-4 w-4" />
                    {collapsed &&
                      to === '/admin/orders' &&
                      pendingOrderCount > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-0.5 text-[9px] font-bold text-white">
                          {pendingOrderCount > 99 ? '99+' : pendingOrderCount}
                        </span>
                      )}
                  </span>
                  {!collapsed && (
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span>{label}</span>
                      {to === '/admin/orders' && pendingOrderCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
                          {pendingOrderCount > 99 ? '99+' : pendingOrderCount}
                        </span>
                      )}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger transition hover:bg-red-50 ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  )
}

export function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate()
  const { pendingOrderCount = 0 } = useAdminStore()

  const handleLogout = async () => {
    await logoutAdmin()
    navigate('/admin-login', { replace: true })
  }

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    setSidebarCollapsed(next)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-white transition-all duration-300 lg:flex lg:flex-col ${
          collapsed ? 'w-[4.5rem]' : 'w-64'
        }`}
      >
        <div
          className={`flex h-16 items-center border-b border-line px-4 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className={`flex items-center gap-2 ${collapsed ? '' : ''}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
              <PawPrint className="h-4 w-4" />
            </span>
            {!collapsed && (
              <div>
                <p className="text-sm font-extrabold text-ink">Noah&apos;s Pets</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                  Admin
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="rounded-lg p-1.5 text-muted hover:bg-surface"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            className="mx-auto mt-3 rounded-lg p-1.5 text-muted hover:bg-surface"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
          <NavItems
            collapsed={collapsed}
            pendingOrderCount={pendingOrderCount}
            onLogout={handleLogout}
          />
        </nav>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-white shadow-2xl animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <PawPrint className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-ink">Noah&apos;s Pets</p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                    Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl p-2 text-muted hover:bg-surface"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
              <NavItems
                collapsed={false}
                pendingOrderCount={pendingOrderCount}
                onNavigate={() => setMobileOpen(false)}
                onLogout={() => {
                  setMobileOpen(false)
                  handleLogout()
                }}
              />
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}

export default AdminSidebar
