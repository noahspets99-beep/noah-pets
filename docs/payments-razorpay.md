# API routes for Razorpay — Vercel Serverless (api/ + server/)
# Production: same-origin https://<vercel-domain>/api/...
# Never expose Razorpay key_secret or Firebase Admin private key to the browser.

## Local development
# 1. Frontend `.env.local` — VITE_* Firebase + VITE_RAZORPAY_KEY_ID
# 2. Server secrets in `functions/.env` OR root `.env.local` (non-VITE):
#      RAZORPAY_KEY_ID=
#      RAZORPAY_KEY_SECRET=
#      FIREBASE_PROJECT_ID=
#      FIREBASE_CLIENT_EMAIL=
#      FIREBASE_PRIVATE_KEY=
# 3. npm run payments:dev   → server/local-server.js :8787
# 4. npm run dev            → Vite proxies /api → :8787
#
# Local default PAYMENTS_STORE=memory (orders in RAM).
# Vercel never uses memory store — Admin SDK + Firestore required.

## Production (Vercel)
# Set server env vars in Vercel Dashboard.
# Webhook URL: https://<your-vercel-domain>/api/payments/razorpay/webhook
# Do NOT deploy Firebase Cloud Functions.

## Routes
# GET  /api/health
# GET  /api/admin/ping                         (admin Bearer token → 200; customer → 403)
# POST /api/orders/pending                     (auth required; server prices)
# POST /api/checkout/razorpay                  (auth; pending + Razorpay order)
# POST /api/payments/razorpay/create-order
# POST /api/payments/razorpay/verify
# GET  /api/payments/razorpay/status/:paymentId
# POST /api/payments/razorpay/webhook
# GET  /api/orders/:orderId
