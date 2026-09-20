import { Link } from 'react-router-dom'
import { STORE, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Privacy Policy"
        description="How Noah's Pets collects, uses and protects customer information."
        canonical="/privacy"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          This Privacy Policy explains how Noah&apos;s Pets collects and uses
          information when you use our website or place an order.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">1. Who we are</h2>
        <p>
          <strong className="text-ink">Noah&apos;s Pets</strong>
          <br />
          <a
            href={STORE.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {formatStoreAddress()}
          </a>
          <br />
          Email:{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          2. Information we collect
        </h2>
        <p>
          We may collect your name, email address, phone number, delivery
          address, order details, and payment-related information needed to
          process your purchase. Payment card details are handled by our payment
          partner (Razorpay) and are not stored on our servers.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          3. How we use information
        </h2>
        <p>
          We use your information to process orders, arrange delivery, provide
          customer support, send order updates, improve our website, and meet
          legal or accounting requirements.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          4. Sharing of information
        </h2>
        <p>
          We may share necessary details with payment providers, courier/transport
          agencies, and service providers who help us operate the store. We do
          not sell your personal information.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">5. Data security</h2>
        <p>
          We take reasonable measures to protect personal information. No method
          of transmission over the internet is completely secure; please use a
          strong password for your account.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">6. Your choices</h2>
        <p>
          You may contact us at{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>{' '}
          to update account details or ask questions about your information.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">7. Related policies</h2>
        <p>
          See also our{' '}
          <Link to="/terms" className="font-semibold text-brand-600">
            Terms &amp; Conditions
          </Link>
          ,{' '}
          <Link to="/shipping" className="font-semibold text-brand-600">
            Shipping Policy
          </Link>
          , and{' '}
          <Link to="/returns" className="font-semibold text-brand-600">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
