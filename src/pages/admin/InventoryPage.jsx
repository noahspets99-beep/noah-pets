import { useMemo, useState } from 'react'
import { Boxes, Search } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Pagination from '../../admin/components/Pagination'
import EmptyState from '../../admin/components/EmptyState'
import { paginate } from '../../admin/utils'
import { useInventoryService } from '../../services/adminServices'

const inputClass =
  'w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'low', label: 'Low stock' },
  { key: 'out', label: 'Out of stock' },
]

function stockStatus(product) {
  const stock = Number(product.stock) || 0
  const threshold = Number(product.lowStockThreshold) || 0
  if (stock <= 0 || product.status === 'Out of Stock') return 'Out of Stock'
  if (stock <= threshold) return 'Low Stock'
  return 'Active'
}

export default function InventoryPage() {
  const inventory = useInventoryService()
  const products = inventory.list()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [drafts, setDrafts] = useState({})

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const status = stockStatus(p)
      if (filter === 'low' && status !== 'Low Stock') return false
      if (filter === 'out' && status !== 'Out of Stock') return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
      )
    })
  }, [products, filter, search])

  const { items, totalPages } = paginate(filtered, page, 10)

  const getDraft = (p) =>
    drafts[p.id] || {
      stock: String(p.stock ?? 0),
      lowStockThreshold: String(p.lowStockThreshold ?? 10),
    }

  const setDraftField = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        stock:
          prev[id]?.stock ??
          String(products.find((x) => x.id === id)?.stock ?? 0),
        lowStockThreshold:
          prev[id]?.lowStockThreshold ??
          String(products.find((x) => x.id === id)?.lowStockThreshold ?? 10),
        [field]: value,
      },
    }))
  }

  const saveRow = async (p) => {
    const d = getDraft(p)
    const stock = Math.max(0, Number(d.stock) || 0)
    const lowStockThreshold = Math.max(0, Number(d.lowStockThreshold) || 0)
    let status = p.status
    if (stock === 0) status = 'Out of Stock'
    else if (status === 'Out of Stock') status = 'Active'
    await inventory.update(p.id, { stock, lowStockThreshold, status })
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[p.id]
      return next
    })
  }

  const counts = useMemo(() => {
    let low = 0
    let out = 0
    products.forEach((p) => {
      const s = stockStatus(p)
      if (s === 'Low Stock') low += 1
      if (s === 'Out of Stock') out += 1
    })
    return { all: products.length, low, out }
  }, [products])

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Track stock levels, thresholds, and variant availability."
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'all', label: 'All SKUs', value: counts.all },
          { key: 'low', label: 'Low stock', value: counts.low },
          { key: 'out', label: 'Out of stock', value: counts.out },
        ].map(({ key, label, value }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setFilter(key)
              setPage(1)
            }}
            className={`rounded-2xl border p-4 text-left shadow-card transition ${
              filter === key
                ? 'border-brand-200 bg-brand-50 ring-1 ring-brand-100'
                : 'border-line bg-white hover:bg-surface'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {label}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key)
                setPage(1)
              }}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                filter === key
                  ? 'bg-brand-500 text-white'
                  : 'border border-line bg-white text-ink-soft hover:bg-surface'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search name or SKU..."
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No inventory rows"
          description="No products match this stock filter."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Threshold</th>
                  <th className="px-4 py-3 font-semibold">Variants</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((p) => {
                  const d = getDraft(p)
                  const dirty =
                    Number(d.stock) !== Number(p.stock) ||
                    Number(d.lowStockThreshold) !== Number(p.lowStockThreshold)
                  return (
                    <tr key={p.id} className="hover:bg-surface/40">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{p.name}</p>
                        <p className="text-xs text-muted">{p.category}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={d.stock}
                          onChange={(e) =>
                            setDraftField(p.id, 'stock', e.target.value)
                          }
                          className={`${inputClass} w-24`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={d.lowStockThreshold}
                          onChange={(e) =>
                            setDraftField(
                              p.id,
                              'lowStockThreshold',
                              e.target.value,
                            )
                          }
                          className={`${inputClass} w-24`}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {p.variants?.length ? (
                          <ul className="space-y-0.5">
                            {p.variants.slice(0, 3).map((v) => (
                              <li key={v.id || v.sku}>
                                {v.label}: {v.stock}
                              </li>
                            ))}
                            {p.variants.length > 3 && (
                              <li>+{p.variants.length - 3} more</li>
                            )}
                          </ul>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={stockStatus(p)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={!dirty}
                          onClick={() => saveRow(p)}
                          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line px-4 py-3">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
