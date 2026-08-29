/** Storefront FAQs — delivery, returns, payment, stock (Tamil Nadu) */

export const faqs = [
  {
    id: 'faq1',
    question: 'Do you deliver across Tamil Nadu?',
    answer:
      'Yes. Noah\'s Pets delivers across Tamil Nadu including Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem and Tirunelveli. Metro areas usually arrive in 2–4 business days; other districts may take up to 5 business days.',
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
    question: 'What is your return policy?',
    answer:
      'Unopened, unused items in original packaging can be returned within 7 days of delivery. Opened pet food, treats, litter and hygiene products are non-returnable for safety reasons. Damaged or wrong items — contact us within 48 hours with photos and we will replace or refund.',
    category: 'Returns',
    sortOrder: 3,
  },
  {
    id: 'faq4',
    question: 'How do refunds work?',
    answer:
      'Approved refunds are credited to the original payment method within 5–7 business days. COD refunds are issued via UPI or bank transfer after we verify your details.',
    category: 'Returns',
    sortOrder: 4,
  },
  {
    id: 'faq5',
    question: 'Which payment methods do you accept?',
    answer:
      'We accept UPI, credit/debit cards, net banking and Cash on Delivery (COD) on eligible orders. All prices are in INR and include applicable GST as shown on your invoice.',
    category: 'Payment',
    sortOrder: 5,
  },
  {
    id: 'faq6',
    question: 'Will I get a GST invoice?',
    answer:
      'Yes. Every paid order includes a GST-compliant invoice. Pet food is typically billed at 5% GST and many accessories/toys at 12% for this demo storefront — exact rates appear on the invoice line items.',
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
    question: 'Can I change or cancel my order?',
    answer:
      'You can request changes or cancellation before the order is marked Shipped — contact support with your order ID. Once shipped or out for delivery, please wait for delivery and use our return policy if needed.',
    category: 'Delivery',
    sortOrder: 8,
  },
]

export function getFaqsByCategory(category) {
  if (!category) return faqs
  return faqs.filter((f) => f.category === category)
}
