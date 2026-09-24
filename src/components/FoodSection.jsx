import { useEffect, useMemo, useState } from 'react'
import { foodTabs as seedFoodTabs } from '../data/products'
import { useCatalog } from '../context/CatalogProvider'
import ProductCard from './ProductCard'
import SectionHeader from './SectionHeader'

const FOOD_HINT = /food|treat|nutrition|meal|diet/i

export default function FoodSection() {
  const { products } = useCatalog()

  const tabs = useMemo(() => {
    const fromProducts = [
      ...new Set(
        (products || [])
          .filter(
            (p) =>
              FOOD_HINT.test(String(p.category || '')) ||
              FOOD_HINT.test(String(p.subcategory || '')) ||
              FOOD_HINT.test(String(p.name || '')),
          )
          .map((p) => String(p.subcategory || p.category || '').trim())
          .filter(Boolean),
      ),
    ]
    return fromProducts.length > 0 ? fromProducts.slice(0, 8) : seedFoodTabs
  }, [products])

  const [tab, setTab] = useState(() => tabs[0] || 'Dog Food')

  useEffect(() => {
    if (!tabs.includes(tab)) setTab(tabs[0] || 'Dog Food')
  }, [tabs, tab])

  const foodProducts = useMemo(() => {
    return products.filter((p) => {
      if (tab === 'Treats') {
        return (
          String(p.category || '').toLowerCase() === 'treats' ||
          String(p.subcategory || '').toLowerCase() === 'treats'
        )
      }
      return (
        p.subcategory === tab ||
        p.category === tab ||
        String(p.subcategory || '').toLowerCase() === String(tab).toLowerCase()
      )
    })
  }, [tab, products])

  if (tabs.length === 0) return null

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
          {tabs.map((item) => {
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
