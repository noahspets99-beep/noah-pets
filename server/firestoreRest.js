/**
 * Firestore / Identity Toolkit REST helpers for local payments when
 * Firebase Admin default credentials are unavailable.
 * Uses the public web API key only (same as the client SDK). Rules still apply.
 */

function projectId() {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    'noahpets'
  )
}

export function firestoreWebApiKey() {
  return (
    process.env.FIREBASE_WEB_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY ||
    ''
  )
}

function encodeValue(value) {
  if (value === null) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) }
    return { doubleValue: value }
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((item) => encodeValue(item)) } }
  }
  if (typeof value === 'object') {
    const fields = {}
    for (const [key, nested] of Object.entries(value)) {
      if (nested === undefined) continue
      fields[key] = encodeValue(nested)
    }
    return { mapValue: { fields } }
  }
  return { stringValue: String(value) }
}

export function encodeDocument(data) {
  const fields = {}
  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined) continue
    fields[key] = encodeValue(value)
  }
  return { fields }
}

export async function lookupUidFromIdToken(idToken) {
  if (!idToken) return null
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firestoreWebApiKey())}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      },
    )
    if (!res.ok) return null
    const json = await res.json()
    return json?.users?.[0]?.localId || null
  } catch {
    return null
  }
}

export async function writeFirestoreDocument({
  collectionName,
  documentId,
  data,
  idToken,
}) {
  if (!idToken) {
    throw new Error('Missing auth token for Firestore write')
  }
  const pid = projectId()
  const key = encodeURIComponent(firestoreWebApiKey())
  const parent = `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${collectionName}`
  const docPath = `${parent}/${encodeURIComponent(documentId)}`
  const body = JSON.stringify({ fields: encodeDocument(data).fields })
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
  }

  const createRes = await fetch(`${parent}?documentId=${encodeURIComponent(documentId)}&key=${key}`, {
    method: 'POST',
    headers,
    body,
  })
  if (createRes.ok) return true

  const createText = await createRes.text()
  const alreadyExists =
    createRes.status === 409 || /ALREADY_EXISTS/i.test(createText)
  if (!alreadyExists) {
    const error = new Error(`Firestore REST write failed (${createRes.status})`)
    error.status = createRes.status
    error.details = createText.slice(0, 500)
    throw error
  }

  const patchRes = await fetch(`${docPath}?key=${key}`, {
    method: 'PATCH',
    headers,
    body,
  })
  if (patchRes.ok) return true
  const patchText = await patchRes.text()
  const error = new Error(`Firestore REST write failed (${patchRes.status})`)
  error.status = patchRes.status
  error.details = patchText.slice(0, 500)
  throw error
}
