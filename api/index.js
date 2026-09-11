/**
 * Vercel Serverless entry — all /api/* traffic is rewritten here.
 * Business logic lives in ../server (shared with local payments:dev).
 */
import { createApp } from '../server/createApp.js'

const app = createApp()

export default app

// Webhook signature verification needs the raw body (not pre-parsed JSON).
export const config = {
  maxDuration: 60,
  api: {
    bodyParser: false,
  },
}
