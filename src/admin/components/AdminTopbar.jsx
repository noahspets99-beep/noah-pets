import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  User,
} from 'lucide-react'
import { useAdminStore } from '../../context/useAdminStore'
import { useAuth } from '../../context/useAuth'
import { logoutAdmin } from '../../services/adminAuth'
import Modal from './Modal'

export default function AdminTopbar({ title, onMenuClick }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    pushToast,
  } = useAdminStore()

  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [search, setSearch] = useState('')
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const confirmLogout = async () => {
    await logoutAdmin()
    pushToast('Logged out successfully', 'info')
    navigate('/admin-login', { replace: true })
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl p-2 text-ink hover:bg-surface lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-ink sm:text-lg">
              {title}
            </h1>
          </div>

          <div className="relative hidden max-w-xs flex-1 md:block lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, orders..."
              className="w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
              aria-label="Global search"
            />
          </div>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-xl p-2 text-ink hover:bg-surface"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-fade-in">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <p className="text-sm font-bold text-ink">Notifications</p>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-xs font-semibold text-brand-600"
                  >
                    Mark all as read
                  </button>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-surface ${
                          !n.read ? 'bg-brand-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">{n.title}</p>
                          {!n.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted">{n.message}</p>
                        <p className="text-[11px] text-muted">{n.time}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-surface"
              aria-label="Admin menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <User className="h-4 w-4" />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-bold leading-tight text-ink">
                  Admin
                </span>
                <span className="block max-w-[10rem] truncate text-[11px] text-muted">
                  {user?.email || 'Store Administrator'}
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false)
                    setLogoutOpen(true)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-danger hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Confirm logout"
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          Are you sure you want to log out of the admin panel?
        </p>
      </Modal>
    </>
  )
}
