import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage, isFirebaseConfigured } from '../lib/firebase'

/**
 * Upload a product image to Firebase Storage. Returns a public HTTPS download URL.
 * Never stores local file paths or blob: URLs as permanent product images.
 */
export async function uploadProductImage(file, productId = 'new') {
  if (!isFirebaseConfigured || !storage) {
    throw new Error('Firebase Storage is not configured.')
  }
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image must be under 8 MB.')
  }

  const safeName = String(file.name || 'image')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80)
  const path = `products/${productId}/${Date.now()}-${safeName}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, {
    contentType: file.type,
    cacheControl: 'public,max-age=31536000',
  })
  return getDownloadURL(storageRef)
}
