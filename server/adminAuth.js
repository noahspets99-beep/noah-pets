import { getAuth } from 'firebase-admin/auth'
import { initAdmin, getDb } from './orders.js'
import { publicError } from './util.js'

const ADMIN_EMAIL = String(
  process.env.ADMIN_EMAIL || 'noahspets99@gmail.com',
).toLowerCase()

/**
 * Verify Firebase ID token and enforce admin authorization.
 * Admin model matches the client: email allowlist and/or adminUsers/{uid}.active.
 */
export async function requireAdmin(req) {
  initAdmin()
  const header = req?.headers?.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    throw publicError(401, 'unauthorized', 'Sign in required.')
  }

  let decoded
  try {
    decoded = await getAuth().verifyIdToken(token)
  } catch {
    throw publicError(401, 'unauthorized', 'Invalid or expired session.')
  }

  const email = String(decoded.email || '').toLowerCase()
  if (email && email === ADMIN_EMAIL) {
    return decoded
  }

  const db = getDb()
  if (db && decoded.uid) {
    try {
      const snap = await db.collection('adminUsers').doc(decoded.uid).get()
      if (snap.exists && snap.data()?.active === true) {
        return decoded
      }
    } catch (err) {
      console.warn('[admin] adminUsers lookup failed', err?.message || err)
    }
  }

  throw publicError(403, 'forbidden', 'Admin access required.')
}
