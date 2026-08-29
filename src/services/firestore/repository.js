/**
 * Firestore repository helpers.
 * Uses Firebase when VITE_FIREBASE_* is configured; otherwise demo/local mode.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'

export { isFirebaseConfigured }

export async function listCollection(name, constraints = []) {
  if (!isFirebaseConfigured || !db) {
    return { mode: 'demo', data: null }
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

export async function getDocument(name, id) {
  if (!isFirebaseConfigured || !db) {
    return { mode: 'demo', data: null }
  }
  const snap = await getDoc(doc(db, name, id))
  if (!snap.exists()) return { mode: 'firestore', data: null }
  return { mode: 'firestore', data: { id: snap.id, ...snap.data() } }
}

export async function upsertDocument(name, id, data) {
  if (!isFirebaseConfigured || !db) {
    return { mode: 'demo', ok: true }
  }
  await setDoc(doc(db, name, id), data, { merge: true })
  return { mode: 'firestore', ok: true }
}

export async function patchDocument(name, id, data) {
  if (!isFirebaseConfigured || !db) {
    return { mode: 'demo', ok: true }
  }
  await updateDoc(doc(db, name, id), data)
  return { mode: 'firestore', ok: true }
}

export async function removeDocument(name, id) {
  if (!isFirebaseConfigured || !db) {
    return { mode: 'demo', ok: true }
  }
  await deleteDoc(doc(db, name, id))
  return { mode: 'firestore', ok: true }
}

export const fsQuery = { query, where, orderBy, limit, collection, doc }
