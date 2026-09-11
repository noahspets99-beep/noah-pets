import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { ADMIN_EMAIL, isAdminUser } from '../config/admin'
import { auth, isFirebaseConfigured } from '../lib/firebase'

export { ADMIN_EMAIL, isAdminUser }

const LEGACY_SESSION_KEY = 'noah_admin_session'
const COLLAPSE_KEY = 'noah_admin_sidebar_collapsed'

export function mapAuthError(error) {
  const code = error?.code || ''
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return 'Sign-in is not available right now. Please try again later.'
    default:
      if (!isFirebaseConfigured) {
        return 'Firebase is not configured. Check your environment variables.'
      }
      return 'Unable to sign in. Please try again.'
  }
}

function clearLegacySessions() {
  localStorage.removeItem(LEGACY_SESSION_KEY)
  sessionStorage.removeItem(LEGACY_SESSION_KEY)
}

/**
 * Sign in with Firebase Authentication.
 * Admin access is determined from the authenticated user's email — not storage.
 */
export async function loginAdmin(email, password, remember = true) {
  if (!isFirebaseConfigured || !auth) {
    return {
      ok: false,
      error:
        'Firebase is not configured. Add VITE_FIREBASE_* values to your .env.local file.',
    }
  }

  try {
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence,
    )
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    )
    clearLegacySessions()
    const user = credential.user
    return {
      ok: true,
      user,
      isAdmin: isAdminUser(user),
      session: {
        email: user.email,
        name: isAdminUser(user) ? 'Admin' : user.displayName || 'Customer',
        title: isAdminUser(user) ? 'Store Administrator' : 'Customer',
        uid: user.uid,
      },
    }
  } catch (error) {
    return { ok: false, error: mapAuthError(error) }
  }
}

export async function logoutAdmin() {
  clearLegacySessions()
  if (auth) {
    await signOut(auth)
  }
}

export async function requestPasswordReset(email) {
  if (!isFirebaseConfigured || !auth) {
    return {
      ok: false,
      error: 'Firebase is not configured. Password reset is unavailable.',
    }
  }
  try {
    await sendPasswordResetEmail(auth, email.trim())
    return {
      ok: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    }
  } catch (error) {
    // Avoid account enumeration — still show a generic success-style message
    // for user-not-found, but surface real config/network errors.
    if (
      error?.code === 'auth/user-not-found' ||
      error?.code === 'auth/invalid-email'
    ) {
      return {
        ok: true,
        message:
          'If an account exists for that email, a reset link has been sent.',
      }
    }
    return { ok: false, error: mapAuthError(error) }
  }
}

export function getSidebarCollapsed() {
  return localStorage.getItem(COLLAPSE_KEY) === '1'
}

export function setSidebarCollapsed(collapsed) {
  localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
}
