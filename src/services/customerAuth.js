import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import { mapAuthError } from './adminAuth'

export { mapAuthError }

function requireAuth() {
  if (!isFirebaseConfigured || !auth) {
    const err = new Error(
      'Authentication is not configured. Check Firebase environment variables.',
    )
    err.code = 'auth/configuration-not-found'
    throw err
  }
  return auth
}

export async function signUpWithEmail({ name, email, password }) {
  const firebaseAuth = requireAuth()
  try {
    await setPersistence(firebaseAuth, browserLocalPersistence)
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email.trim(),
      password,
    )
    const displayName = String(name || '').trim()
    if (displayName) {
      await updateProfile(credential.user, { displayName })
    }
    return { ok: true, user: credential.user }
  } catch (error) {
    return { ok: false, error: mapCustomerAuthError(error) }
  }
}

export async function signInWithEmail({ email, password }) {
  const firebaseAuth = requireAuth()
  try {
    await setPersistence(firebaseAuth, browserLocalPersistence)
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      email.trim(),
      password,
    )
    return { ok: true, user: credential.user }
  } catch (error) {
    return { ok: false, error: mapCustomerAuthError(error) }
  }
}

export async function signInWithGoogle() {
  const firebaseAuth = requireAuth()
  try {
    await setPersistence(firebaseAuth, browserLocalPersistence)
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const credential = await signInWithPopup(firebaseAuth, provider)
    return { ok: true, user: credential.user }
  } catch (error) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      return { ok: false, error: 'Google sign-in was cancelled.', cancelled: true }
    }
    return { ok: false, error: mapCustomerAuthError(error) }
  }
}

export async function signOutUser() {
  if (!auth) return
  await signOut(auth)
}

function mapCustomerAuthError(error) {
  const code = error?.code || ''
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/popup-blocked':
      return 'Pop-up blocked. Allow pop-ups for Google sign-in.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.'
    default:
      return mapAuthError(error)
  }
}
