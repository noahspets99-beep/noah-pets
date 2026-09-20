/** Storefront FAQs — delivery, returns, payment, stock */

import { STORE } from '../config/store'

export const faqs = [
  {
    id: 'faq1',
    question: 'Do you deliver across India?',
    answer:
      "Yes. Noah's Pets delivers products across India. Shipping charges, if any, are shown at checkout before you complete payment.",
    category: 'Delivery',
    sortOrder: 1,
  },
  {
    id: 'faq2',
    question: 'Is there free shipping?',
    answer:
      'Shipping charges, if any, are calculated and shown at checkout before you complete payment. Orders that qualify for free shipping will show a free shipping amount at checkout.',
    category: 'Delivery',
    sortOrder: 2,
  },
  {
    id: 'faq3',
    question: 'What is your return and refund policy?',
    answer:
      "Once payment has been successfully completed, the order cannot be cancelled. Products cannot be returned after purchase, and refunds are not available under the normal order policy merely because a customer changes their mind. Full details are on our Refund & Cancellation Policy page.",
    category: 'Returns',
    sortOrder: 3,
  },
  {
    id: 'faq4',
    question: 'What if I have a payment problem?',
    answer: `If a payment is stuck, failed, deducted but the order is not confirmed, or you experience another payment-related issue, contact ${STORE.email}. Payment issues are reviewed by Noah's Pets and, where applicable, resolved according to the payment provider or bank transaction status and applicable rules. A payment issue does not automatically qualify for a refund.`,
    category: 'Returns',
    sortOrder: 4,
  },
  {
    id: 'faq5',
    question: 'Which payment methods do you accept?',
    answer:
      'We accept online payments through Razorpay, including UPI, credit/debit cards and net banking where available. All prices are in INR. Applicable charges and taxes are shown at checkout before you pay.',
    category: 'Payment',
    sortOrder: 5,
  },
  {
    id: 'faq6',
    question: 'Will I get an invoice?',
    answer:
      'Order and payment details are recorded for your purchase. Contact us at the support email if you need help locating your order information.',
    category: 'Payment',
    sortOrder: 6,
  },
  {
    id: 'faq7',
    question: 'What if an item is out of stock?',
    answer:
      'Out-of-stock products cannot be added to cart. You can browse similar items by pet type or category. Low-stock badges appear when inventory is running low so you can order before we restock.',
    category: 'Stock',
    sortOrder: 7,
  },
  {
    id: 'faq8',
    question: 'Can I cancel my order after placing it?',
    answer: `No. Once payment has been successfully completed, the order cannot be cancelled. Please review your cart and delivery address carefully before completing payment. After handover to the courier, delivery is handled by the delivery agency; contact ${STORE.email} if you need shipping support.`,
    category: 'Delivery',
    sortOrder: 8,
  },
]

export function getFaqsByCategory(category) {
  if (!category) return faqs
  return faqs.filter((f) => f.category === category)
}
