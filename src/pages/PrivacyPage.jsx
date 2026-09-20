import { Link } from 'react-router-dom'
import { STORE, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Privacy Policy"
        description="Noah's Pets Privacy Policy - Information about how customer information is collected and used for order processing and delivery."
        canonical="/privacy"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          This Privacy Policy explains how Noah&apos;s Pets collects and uses
          customer information when you browse our website or place an order.
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
          Noah&apos;s Pets collects only the customer information required to
          process and dispatch orders. This may include:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Customer name</li>
          <li>Mobile number</li>
          <li>Email address</li>
          <li>Delivery / shipping address</li>
          <li>Order details</li>
          <li>
            Payment and order transaction information necessary to process the
            order
          </li>
        </ul>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          3. How we use information
        </h2>
        <p>
          Customer information is collected for legitimate purposes such as:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Processing orders</li>
          <li>Confirming orders</li>
          <li>Dispatching products</li>
          <li>Delivering products</li>
          <li>Contacting customers regarding their orders</li>
          <li>Handling customer support and payment-related issues</li>
        </ul>
        <p>
          Noah&apos;s Pets does not sell customer personal information and does
          not use customer information for unrelated purposes.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          4. Payment processing
        </h2>
        <p>
          Payment processing may involve the payment gateway or payment provider
          used by this website. Necessary transaction information may be
          processed by the payment provider to complete the payment. Noah&apos;s
          Pets does not store full payment card details on its own servers.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          5. Sharing of information
        </h2>
        <p>
          We may share only the information needed to complete your order with
          service providers who help us operate the store, such as payment
          providers and delivery or courier agencies. We do not sell your
          personal information.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">6. Data security</h2>
        <p>
          We take reasonable steps to protect personal information. No method of
          transmission or storage over the internet is completely secure, and we
          cannot guarantee absolute security.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">7. Your choices</h2>
        <p>
          You may contact us to update account or order-related details, or to
          ask questions about your information, at the email address below.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">8. Contact</h2>
        <p>
          <strong className="text-ink">Noah&apos;s Pets</strong>
          <br />
          Email:{' '}
          <a
            href={`mailto:${STORE.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {STORE.email}
          </a>
          <br />
          Address:{' '}
          <a
            href={STORE.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {formatStoreAddress()}
          </a>
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">9. Related policies</h2>
        <p>
          See also our{' '}
          <Link to="/terms" className="font-semibold text-brand-600">
            Terms &amp; Conditions
          </Link>
          ,{' '}
          <Link to="/shipping" className="font-semibold text-brand-600">
            Shipping &amp; Delivery Policy
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
