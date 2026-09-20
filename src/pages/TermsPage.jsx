import { Link } from 'react-router-dom'
import { STORE, formatStoreAddress } from '../config/store'
import SeoHead from '../components/seo/SeoHead'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="Terms & Conditions"
        description="Noah's Pets Terms & Conditions - Terms governing purchases, orders, payments, shipping and use of the website."
        canonical="/terms"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        Terms &amp; Conditions
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <h2 className="text-xl font-extrabold text-ink">1. Introduction</h2>
        <p>
          These Terms &amp; Conditions govern your use of the Noah&apos;s Pets
          website and purchases made through it. By browsing the website or
          placing an order, you agree to these terms. Please also review our{' '}
          <Link to="/privacy" className="font-semibold text-brand-600">
            Privacy Policy
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
          2. Products and Product Information
        </h2>
        <p>
          Product descriptions, images, and other details on the website are
          provided for informational purposes. We aim to keep product information
          accurate, but packaging, appearance, or availability may vary.
          Product availability may change at any time.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">3. Prices</h2>
        <p>
          Product prices displayed on the website are the applicable prices at
          the time of purchase. Prices are shown in Indian Rupees (INR). Any
          applicable charges or taxes shown at checkout form part of the amount
          payable for that order.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">4. Orders</h2>
        <p>
          An order is subject to successful payment and order acceptance or
          processing by Noah&apos;s Pets. Customers must verify their order
          details before completing payment. Noah&apos;s Pets may decline or be
          unable to fulfil an order where payment is unsuccessful, information
          is incomplete or incorrect, or a product cannot be supplied.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          5. Customer Information
        </h2>
        <p>
          Customers are responsible for providing accurate name, phone number,
          email address, and delivery address. Customer information is collected
          for order processing and dispatch. Noah&apos;s Pets does not sell
          customer personal information. Further details are set out in our{' '}
          <Link to="/privacy" className="font-semibold text-brand-600">
            Privacy Policy
          </Link>
          .
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">6. Payment</h2>
        <p>
          Payments for online orders are processed through the payment gateway
          or provider used on this website. An order is confirmed only after
          successful payment verification according to the payment provider and
          Noah&apos;s Pets order process.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          7. Shipping and Delivery
        </h2>
        <p>
          Shipping and delivery are governed by our{' '}
          <Link to="/shipping" className="font-semibold text-brand-600">
            Shipping &amp; Delivery Policy
          </Link>
          . Noah&apos;s Pets delivers products across India. After dispatch,
          delivery is carried out by the applicable delivery or courier agency.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">8. Cancellation</h2>
        <p>
          Once payment has been successfully completed, the order cannot be
          cancelled. Customers should verify product, quantity, delivery
          address, phone number, and other order details before completing
          payment. Cancellation after successful payment is not accepted. See
          our{' '}
          <Link to="/returns" className="font-semibold text-brand-600">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          9. Returns and Refunds
        </h2>
        <p>
          Returns and refunds are governed by our{' '}
          <Link to="/returns" className="font-semibold text-brand-600">
            Refund &amp; Cancellation Policy
          </Link>
          . Under the normal order policy, products cannot be returned after
          purchase, and refunds are not available once payment has been
          successfully completed merely because a customer changes their mind.
          Nothing in these terms seeks to exclude rights that cannot be excluded
          under applicable Indian law.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          10. Customer Responsibilities
        </h2>
        <p>
          Customers are responsible for providing accurate contact and delivery
          information, verifying order details before payment, and remaining
          reachable for delivery-related communication. Noah&apos;s Pets is not
          responsible for failed delivery caused solely by incorrect address or
          unreachable contact details provided by the customer, subject to
          applicable law.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          11. Website Usage
        </h2>
        <p>
          You agree to use this website lawfully and not to misuse the site,
          interfere with its operation, or attempt unauthorised access to
          systems or data. Content on the website is provided for shopping and
          information related to Noah&apos;s Pets products and services.
        </p>

        <h2 className="pt-2 text-xl font-extrabold text-ink">
          12. Contact Information
        </h2>
        <p>
          For questions about these terms or your order, contact:
        </p>
        <p>
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
      </div>
    </div>
  )
}
