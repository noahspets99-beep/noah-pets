import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { faqs } from '../data/faqs'
import JsonLd from './seo/JsonLd'
import { faqSchema } from '../lib/schema'
import SectionHeader from './SectionHeader'

export default function FaqSection({ limit = 6 }) {
  const items = faqs.slice(0, limit)
  const [openId, setOpenId] = useState(items[0]?.id || null)

  return (
    <section className="bg-surface py-12 sm:py-16">
      <JsonLd data={faqSchema(items)} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Help"
          title="Frequently Asked Questions"
          subtitle="Delivery, returns, GST invoices and stock — answered for shoppers across India."
          action={
            <Link
              to="/faq"
              className="text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              View all FAQs
            </Link>
          }
        />
        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((faq) => {
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
                  <span className="text-sm font-bold text-ink sm:text-[15px]">
                    {faq.question}
                  </span>
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
    </section>
  )
}
