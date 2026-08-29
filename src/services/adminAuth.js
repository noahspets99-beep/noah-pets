const SESSION_KEY = 'noah_admin_session'
const COLLAPSE_KEY = 'noah_admin_sidebar_collapsed'

// Demo-only credentials for frontend mock auth (replace with Firebase Auth later)
const DEMO_EMAIL = 'admin@petshop.com'
const DEMO_PASSWORD = 'admin123'

export function loginAdmin(email, password, remember = true) {
  if (
    email.trim().toLowerCase() !== DEMO_EMAIL ||
    password !== DEMO_PASSWORD
  ) {
    return { ok: false, error: 'Invalid email or password.' }
  }

  const session = {
    email: DEMO_EMAIL,
    name: 'Admin',
    title: 'Store Administrator',
    loggedInAt: new Date().toISOString(),
  }

  const storage = remember ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, JSON.stringify(session))
  if (!remember) localStorage.removeItem(SESSION_KEY)
  else sessionStorage.removeItem(SESSION_KEY)

  return { ok: true, session }
}

export function logoutAdmin() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function getAdminSession() {
  const raw =
    localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isAdminLoggedIn() {
  return Boolean(getAdminSession())
}

export function getSidebarCollapsed() {
  return localStorage.getItem(COLLAPSE_KEY) === '1'
}

export function setSidebarCollapsed(collapsed) {
  localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
}
