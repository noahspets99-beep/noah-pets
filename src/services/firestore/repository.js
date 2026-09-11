/**
 * Firestore repository helpers.
 * Uses Firebase when VITE_FIREBASE_* is configured.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../../lib/firebase'

export { isFirebaseConfigured }

export async function listCollection(name, constraints = []) {
  if (!isFirebaseConfigured || !db) {
    return {
      mode: 'unavailable',
      data: null,
      error: 'Firebase is not configured',
    }
  }
  const q = constraints.length
    ? query(collection(db, name), ...constraints)
    : collection(db, name)
  const snap = await getDocs(q)
  return {
    mode: 'firestore',
    data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
  }
}

/**
 * Realtime listener. Returns unsubscribe fn.
 * Never falls back to demo data — callers must show empty/error states.
 */
export function subscribeCollection(name, constraints, { onData, onError } = {}) {
  if (!isFirebaseConfigured || !db) {
    onError?.('Firebase is not configured')
    return () => {}
  }
  const q = constraints?.length
    ? query(collection(db, name), ...constraints)
    : collection(db, name)

  return onSnapshot(
    q,
    (snap) => {
      onData?.(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    },
    (err) => {
      console.error(`subscribeCollection(${name})`, err?.code || err?.message || err)
      onError?.(err?.message || 'Failed to load data from Firebase')
    },
  )
}

export async function getDocument(name, id) {
  if (!isFirebaseConfigured || !db) {
    return {
      mode: 'unavailable',
      data: null,
      error: 'Firebase is not configured',
    }
  }
  const snap = await getDoc(doc(db, name, id))
  if (!snap.exists()) return { mode: 'firestore', data: null }
  return { mode: 'firestore', data: { id: snap.id, ...snap.data() } }
}

export async function upsertDocument(name, id, data) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured')
  }
  await setDoc(doc(db, name, id), data, { merge: true })
  return { mode: 'firestore', ok: true }
}

export async function patchDocument(name, id, data) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured')
  }
  await updateDoc(doc(db, name, id), data)
  return { mode: 'firestore', ok: true }
}

export async function removeDocument(name, id) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured')
  }
  await deleteDoc(doc(db, name, id))
  return { mode: 'firestore', ok: true }
}

export const fsQuery = { query, where, orderBy, limit, collection, doc }
