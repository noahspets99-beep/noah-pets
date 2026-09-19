/**
 * Single Vercel Serverless entry for all /api/* traffic.
 * vercel.json rewrites /api/(.*) → /api so Express receives nested paths.
 */
import { createApp } from '../server/createApp.js'

const app = createApp()

export default app

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: false,
  },
}
