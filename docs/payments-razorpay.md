# API routes for Razorpay (deploy separately — Cloud Functions / your Node server)
# Never expose Razorpay key_secret to the browser.

## POST /api/payments/razorpay/create-order
# Body: { amount, currency, orderId, customer }
# Server: create Razorpay order with key_id + key_secret
# Return: { provider: 'razorpay', paymentOrderId, amount, currency, orderId, keyId }

## POST /api/payments/razorpay/verify
# Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
# Server: verify HMAC signature; mark order paid in Firestore
# Return: { provider: 'razorpay', paymentId, status: 'paid', ... }

## GET /api/payments/razorpay/status/:paymentId
# Return payment status from Razorpay API

Set in .env.local:
  VITE_PAYMENT_PROVIDER=razorpay
  VITE_PAYMENT_CREATE_ORDER_URL=https://YOUR_API/payments/razorpay/create-order
  VITE_PAYMENT_VERIFY_URL=https://YOUR_API/payments/razorpay/verify
