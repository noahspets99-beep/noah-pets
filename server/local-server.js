import dotenv from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Prefer root .env.local / server/.env; keep functions/.env for migration continuity.
// Do not override variables already set in the process environment (e.g. PAYMENTS_PORT).
dotenv.config({ path: resolve(root, '.env') })
dotenv.config({ path: resolve(root, '.env.local') })
dotenv.config({ path: resolve(__dirname, '.env') })
dotenv.config({ path: resolve(root, 'functions', '.env') })

function isPlaceholder(value) {
  if (!value) return true
  const v = String(value).trim()
  return (
    v.length === 0 ||
    v === 'REPLACE_ME' ||
    v.includes('REPLACE_ME') ||
    v.includes('REPLACE_WITH')
  )
}

const keyId = (process.env.RAZORPAY_KEY_ID || '').trim()
const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim()

console.log('Razorpay Key ID configured:', Boolean(keyId) && !isPlaceholder(keyId))
console.log(
  'Razorpay Key Secret configured:',
  Boolean(keySecret) && !isPlaceholder(keySecret),
)

if (!keyId || isPlaceholder(keyId)) {
  console.warn('[payments] RAZORPAY_KEY_ID missing — set in .env.local or functions/.env')
}
if (!keySecret || isPlaceholder(keySecret)) {
  console.warn(
    '[payments] RAZORPAY_KEY_SECRET missing — set server-only env (never VITE_)',
  )
}

if (!process.env.PAYMENTS_STORE) {
  process.env.PAYMENTS_STORE = 'memory'
}

const { createApp } = await import('./createApp.js')

const port = Number(process.env.PAYMENTS_PORT || 8787)
const app = createApp()

app.listen(port, () => {
  console.log(`Noah payments API listening on http://localhost:${port}`)
  console.log(`Store mode: ${process.env.PAYMENTS_STORE}`)
  console.log('Runtime: local Express (Vercel-compatible server/)')
})
