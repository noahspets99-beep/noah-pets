import { ArrowUpRight } from 'lucide-react'
import { careTips } from '../data/products'
import SectionHeader from './SectionHeader'

export default function CareTipsSection() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Learn"
          title="Pet Care Tips"
          subtitle="Practical guidance to help you care for your pets with confidence."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {careTips.map((tip) => (
            <article
              key={tip.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={tip.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-brand-600">
                  {tip.category}
                </span>
                <h3 className="mt-1.5 text-sm font-bold leading-snug text-ink sm:text-[15px]">
                  {tip.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted sm:text-sm">
                  {tip.description}
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-600 transition group-hover:gap-1.5"
                >
                  Read More
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
