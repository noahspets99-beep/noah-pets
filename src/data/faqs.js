/** Storefront FAQs — delivery, returns, payment, stock (Tamil Nadu) */

export const faqs = [
  {
    id: 'faq1',
    question: 'Do you deliver across Tamil Nadu?',
    answer:
      "Yes. Noah's Pets delivers across Tamil Nadu including Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem and Tirunelveli. Metro areas usually arrive in 2–4 business days; other districts may take up to 5 business days.",
    category: 'Delivery',
    sortOrder: 1,
  },
  {
    id: 'faq2',
    question: 'Is there free shipping?',
    answer:
      'Orders of ₹999 and above qualify for free standard shipping within Tamil Nadu. Below ₹999, a flat delivery fee applies (shown at checkout). Heavy aquariums or oversized items may have special shipping notes on the product page.',
    category: 'Delivery',
    sortOrder: 2,
  },
  {
    id: 'faq3',
    question: 'What is your return and refund policy?',
    answer:
      "Once an order is placed, it cannot be cancelled by the customer. Unopened, unused items in original packaging may be eligible for return within 7 days of delivery. Opened pet food, treats, litter and hygiene products are non-returnable. Damaged or wrong items — contact us within 48 hours with photos. Full details are on our Refund & Cancellation Policy page.",
    category: 'Returns',
    sortOrder: 3,
  },
  {
    id: 'faq4',
    question: 'How do refunds work?',
    answer:
      'Where a refund is approved under our Refund & Cancellation Policy, it is credited to the original payment method according to that policy and the payment provider’s processing timelines. Contact noahspets99@gmail.com with your order ID for help.',
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
    question: 'Will I get a GST invoice?',
    answer:
      'Yes. Every paid order includes a GST-compliant invoice. Exact tax rates appear on the invoice line items.',
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
    answer:
      'No. Once an order has been successfully placed, it cannot be cancelled by the customer. Please review your cart and delivery address carefully before completing payment. After handover to the courier, delivery is handled by the courier/transport agency; contact noahspets99@gmail.com if you need support.',
    category: 'Delivery',
    sortOrder: 8,
  },
]

export function getFaqsByCategory(category) {
  if (!category) return faqs
  return faqs.filter((f) => f.category === category)
}
