import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { ADMIN_EMAIL, isAdminUser } from '../config/admin'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import { STORE } from '../config/store'

export { ADMIN_EMAIL, isAdminUser }

const LEGACY_SESSION_KEY = 'noah_admin_session'
const COLLAPSE_KEY = 'noah_admin_sidebar_collapsed'
const NOT_ADMIN_ERROR =
  'Admin access required. This account is not authorized for the admin console.'

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
    case 'auth/popup-blocked':
      return 'Pop-up blocked. Allow pop-ups for Google sign-in.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled.'
    default:
      if (!isFirebaseConfigured) {
        return 'Firebase is not configured. Check your environment variables.'
      }
      return 'Unable to sign in. Please try again.'
  }
}

function mapPasswordResetError(error) {
  const code = error?.code || ''
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-not-found':
      return 'No password account found for this email. If you sign in with Google only, use Continue with Google instead.'
    case 'auth/missing-continue-uri':
    case 'auth/invalid-continue-uri':
    case 'auth/unauthorized-continue-uri':
      return 'Password reset could not be completed because the reset link domain is not authorized in Firebase Authentication.'
    case 'auth/too-many-requests':
      return 'Too many reset attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/operation-not-allowed':
      return 'Email/password reset is not enabled for this Firebase project.'
    default:
      return mapAuthError(error)
  }
}

function clearLegacySessions() {
  localStorage.removeItem(LEGACY_SESSION_KEY)
  sessionStorage.removeItem(LEGACY_SESSION_KEY)
}

function resetContinueUrl() {
  const site = String(STORE.siteUrl || '').trim().replace(/\/$/, '')
  if (site && /^https?:\/\//i.test(site)) {
    return `${site}/admin-login`
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/admin-login`
  }
  return undefined
}

async function enforceAdminSession(user) {
  if (isAdminUser(user)) {
    clearLegacySessions()
    return {
      ok: true,
      user,
      isAdmin: true,
      session: {
        email: user.email,
        name: 'Admin',
        title: 'Store Administrator',
        uid: user.uid,
      },
    }
  }
  if (auth) {
    await signOut(auth)
  }
  clearLegacySessions()
  return { ok: false, error: NOT_ADMIN_ERROR, isAdmin: false }
}

/**
 * Sign in with Firebase email/password for the admin portal.
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
    return enforceAdminSession(credential.user)
  } catch (error) {
    return { ok: false, error: mapAuthError(error) }
  }
}

/**
 * Google Sign-In for the admin portal. Only the configured admin email is allowed.
 */
export async function loginAdminWithGoogle(remember = true) {
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
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const credential = await signInWithPopup(auth, provider)
    return enforceAdminSession(credential.user)
  } catch (error) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      return { ok: false, error: mapAuthError(error), cancelled: true }
    }
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

  const trimmed = String(email || '').trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter your email above, then tap Forgot password.' }
  }

  try {
    const continueUrl = resetContinueUrl()
    if (continueUrl) {
      await sendPasswordResetEmail(auth, trimmed, {
        url: continueUrl,
        handleCodeInApp: false,
      })
    } else {
      await sendPasswordResetEmail(auth, trimmed)
    }
    return {
      ok: true,
      message:
        'Password reset email sent. Please check your inbox and spam folder.',
    }
  } catch (error) {
    // If continue URL is rejected, retry once with Firebase's default handler
    // so a misconfigured domain does not block reset emails entirely.
    if (
      error?.code === 'auth/unauthorized-continue-uri' ||
      error?.code === 'auth/invalid-continue-uri' ||
      error?.code === 'auth/missing-continue-uri'
    ) {
      try {
        await sendPasswordResetEmail(auth, trimmed)
        return {
          ok: true,
          message:
            'Password reset email sent. Please check your inbox and spam folder.',
        }
      } catch (retryError) {
        return { ok: false, error: mapPasswordResetError(retryError) }
      }
    }
    // Never pretend the email was sent when Firebase returned an error
    return { ok: false, error: mapPasswordResetError(error) }
  }
}

export function getSidebarCollapsed() {
  return localStorage.getItem(COLLAPSE_KEY) === '1'
}

export function setSidebarCollapsed(collapsed) {
  localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
}
