import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqs } from '../data/faqs'
import SeoHead from '../components/seo/SeoHead'
import JsonLd from '../components/seo/JsonLd'
import { faqSchema } from '../lib/schema'

export default function FaqPage() {
  const [openId, setOpenId] = useState(faqs[0]?.id || null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead
        title="FAQs | Pet Shop Tamil Nadu"
        description="FAQs on delivery across Tamil Nadu, free shipping, returns, GST invoices and payments at Noah's Pets."
        canonical="/faq"
      />
      <JsonLd data={faqSchema(faqs)} />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">FAQs</h1>
      <p className="mt-2 text-sm text-muted">
        Answers for delivery, returns, payment and stock.
      </p>
      <div className="mt-8 space-y-3">
        {faqs.map((faq) => {
          const open = openId === faq.id
          return (
            <div
              key={faq.id}
              className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : faq.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                aria-expanded={open}
              >
                <span className="text-sm font-bold text-ink">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted transition ${
                    open ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>
              {open && (
                <div className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-soft">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
