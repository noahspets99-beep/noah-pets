import SeoHead from '../components/seo/SeoHead'

const sections = [
  {
    title: 'COMMON REQUEST',
    note: 'Avoid Urgent Orders',
    paragraphs: [
      'No Urgent Orders Please! For safe shipping, please place separate orders for breakable and unbreakable items. MAKE PREPAID ORDERS TO AVOID DELAY / RETURN',
      'PLEASE DON\'T ORDER ANY EMERGIENCEY ITEMS BECAUSE TRANSIT MAY TAKE TIME DUE TO WEATHER / TRANSIT ISSUES SUBJECT TO LOGSITCS / COURIER / POSTAL DEPARTMENT. कृपया कोई आपातकालीन वस्तु ऑर्डर न करें क्योंकि ट्रांज़िट में समय लग सकता है मौसम/पारगमन मुद्दों के कारण लॉजिस्टिक/कूरियर/डाक विभाग के अधीन',
    ],
  },
  {
    title: 'BASIC DELIVERY CHARGE',
    paragraphs: [
      'BASIC DELIVERY CHARGE : Rs. 80/- The order will sent by India Post Business Parcel Service / Private Delivery Servoce. Delivery period : Minimum 3 +/- working days. Exact delivery date & time not available in India post Delivery terms and conditions subject to Postal Department of India / Shiprocket service. Once the order dispatched we can not able to stop / alter / cancel it.',
    ],
  },
  {
    title: 'PREPAID - STANDARD DELIVERY',
    note: 'Subject to Parcel Size',
    paragraphs: [
      'PRIVATE DELIVERY SERVICE : Service provider will provide Delivery Details, Live tracking and Delivery customer care support. Additional Delivery charges may extra (Subject to courier company) Service available only. Once the order dispatched we can not able to stop / alter / cancel it. (Return policy applicable)',
    ],
  },
  {
    title: 'PREPAID - PRIVATE COURIER',
    note: 'Subject to Parcel Size',
    paragraphs: [
      'We now offer Part Payment Facility 🎉 Here\'s how it works: - Pay just 50% of the total bill amount now & Balance payment can be made at the time of delivery. - COD Service charge: 10 to 25% of the total amount (extra) - All other terms & conditions will sent by Whatsapp message - This facility is applicable for selected products / servicable area.',
    ],
  },
  {
    title: 'PART PAYMENT / COD',
    note: 'For selected products only',
    paragraphs: [
      'ONLY PREPAID ORDER - Order will be delivered to your nearest Logistic branch. To choose your nearest Logistic branch, the branch details will sent to you by WhatsApp. After loading the order, the logistic bill will sent to you by WhatsApp. At the time of delivery have to keep your Id proof copy and the logistic bill copy. (Above 25 Kg or Big consignments will send by Logistics) - No Return',
    ],
  },
  {
    title: 'WHOLE SALE DELIVERY',
    paragraphs: ['No Retun Accepted'],
  },
  {
    title: 'RETURN / REFUND POLICY',
    note: 'Unboxing video compulsory',
    highlight: 'No return or refund after payment',
    paragraphs: [
      'Only manufacturing issues and missing orders are eligible to be considered for a return / refund where applicable. Unboxing video must. Your item must be in the same condition that you received it, unworn or unused with tags and in its original packaging and should sent to our registered office. After the return product received us will be refunded. Packing / Bank chrges / Foward & Return delivery charges will not be refunded.',
    ],
  },
  {
    title: 'DELIVERY ISSUES / COMPLIANTS',
    note: 'Unboxing video compulsory',
    paragraphs: [
      'Any claims subject to Coimbatore jurisdiction. All the product disputes / warranty belongs to the manufacturers / brands. The shipment is not covered under insurance and transported at the buyer’s risk entirely. WE ARE NOT RESPONSIBLE FOR DELIVERY DELAY / DAMAGES / CONSIGNMENT MISSING PLEASE GIVE A COMPLAINT WITH RELEVANT DOCUMENTS TO THE SHIPPING SERVICE PROVIDER.',
    ],
  },
  {
    title: 'GENERAL TERMS & CONDITIONS',
    paragraphs: [
      'For safe shipping, please place separate orders for breakable and unbreakable items. To prevent damage, we recommend ordering fragile and non-fragile items in separate transactions. Please note that we are not responsible for any damages that may occur during shipping.',
    ],
  },
  {
    title: 'SHIPPING ADVISORY',
    note: 'Ordering Tip:',
    paragraphs: [
      'No Urgent Orders Please! For safe shipping, please place separate orders for breakable and unbreakable items. MAKE PREPAID ORDERS TO AVOID DELAY / RETURN',
      'PLEASE DON\'T ORDER ANY EMERGIENCEY ITEMS BECAUSE TRANSIT MAY TAKE TIME DUE TO WEATHER / TRANSIT ISSUES SUBJECT TO LOGSITCS / COURIER / POSTAL DEPARTMENT. कृपया कोई आपातकालीन वस्तु ऑर्डर न करें क्योंकि ट्रांज़िट में समय लग सकता है मौसम/पारगमन मुद्दों के कारण लॉजिस्टिक/कूरियर/डाक विभाग के अधीन',
    ],
  },
  {
    title: 'DISCLAIMER',
    note: 'General Notice',
    paragraphs: [
      'The contents of this website are for informational purposes only and not intended to be a substitute for professional medical advice, diagnosis, or treatment. Please seek the advice of a physician or other qualified health provider with any questions you may have regarding a medical condition. Do not disregard professional medical advice or delay in seeking it because of something you have read on',
    ],
  },
]

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
      <div className="mt-6 space-y-3 sm:space-y-4">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5"
          >
            <h2 className="text-base font-extrabold tracking-tight text-ink sm:text-lg">
              {section.title}
            </h2>
            {section.note ? (
              <p className="mt-1 text-sm font-semibold text-ink">{section.note}</p>
            ) : null}
            {section.highlight ? (
              <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-sm font-extrabold text-ink sm:text-base">
                {section.highlight}
              </p>
            ) : null}
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
