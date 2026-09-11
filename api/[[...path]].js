/**
 * Vercel Serverless catch-all for /api and /api/*
 * Keeps the full request path so Express routes like /api/health match.
 * SPA deep links are handled separately via vercel.json → /index.html
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
