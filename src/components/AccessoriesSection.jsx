import { accessoryCategories } from '../data/products'
import SectionHeader from './SectionHeader'

export default function AccessoriesSection() {
  return (
    <section id="accessories" className="bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Lifestyle"
          title="Everything Beyond Food"
          subtitle="Collars, beds, toys and travel gear that make everyday life better."
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {accessoryCategories.map((cat) => (
            <a
              key={cat.id}
              href="#featured"
              className="group relative overflow-hidden rounded-2xl border border-line shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h3 className="text-sm font-bold text-white sm:text-base">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-white/80 sm:text-xs">
                  Shop collection
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
