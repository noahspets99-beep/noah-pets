import { useMemo, useState } from 'react'
import { foodTabs } from '../data/products'
import { useCatalog } from '../context/CatalogProvider'
import ProductCard from './ProductCard'
import SectionHeader from './SectionHeader'

export default function FoodSection() {
  const { products } = useCatalog()
  const [tab, setTab] = useState('Dog Food')

  const foodProducts = useMemo(() => {
    return products.filter((p) => {
      if (tab === 'Treats') return p.category === 'Treats'
      return p.subcategory === tab
    })
  }, [tab, products])

  return (
    <section id="food" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Nutrition"
          title="Nutrition They’ll Love"
          subtitle="Wholesome formulas with clear age, flavor and weight details."
        />

        <div
          className="mb-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Food categories"
        >
          {foodTabs.map((item) => {
            const active = tab === item
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-ink text-white'
                    : 'bg-surface text-ink-soft hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>

        <div
          key={tab}
          className="grid grid-cols-2 gap-3 animate-fade-in sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          {foodProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
