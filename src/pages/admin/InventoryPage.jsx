import { useMemo, useState } from 'react'
import { Boxes, Search } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Pagination from '../../admin/components/Pagination'
import EmptyState from '../../admin/components/EmptyState'
import { paginate } from '../../admin/utils'
import { useAdminStore } from '../../context/AdminStore'

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
  const { products, updateProduct, pushToast } = useAdminStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [drafts, setDrafts] = useState({})
  const [savingId, setSavingId] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const status = stockStatus(p)
      if (filter === 'low' && status !== 'Low Stock') return false
      if (filter === 'out' && status !== 'Out of Stock') return false
      if (!q) return true
      return (
        String(p.name || '')
          .toLowerCase()
          .includes(q) ||
        String(p.sku || '')
          .toLowerCase()
          .includes(q)
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
        ...(prev[id] || getDraft(products.find((x) => x.id === id) || {})),
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
    setSavingId(p.id)
    try {
      await updateProduct(p.id, { stock, lowStockThreshold, status })
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[p.id]
        return next
      })
    } catch (err) {
      pushToast(err?.message || 'Failed to update stock', 'error')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Update stock in Firebase — storefront availability follows immediately."
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search name or SKU…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setFilter(f.key)
                setPage(1)
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === f.key
                  ? 'bg-ink text-white'
                  : 'bg-surface text-ink-soft ring-1 ring-line'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No inventory rows"
          description={
            products.length === 0
              ? 'No products in Firebase yet.'
              : 'No products match this filter.'
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-card md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Low threshold</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Save</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const d = getDraft(p)
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="px-4 py-3 font-semibold text-ink">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-muted">{p.sku || '—'}</td>
                      <td className="px-4 py-3">
                        <input
                          className={`${inputClass} w-24`}
                          value={d.stock}
                          onChange={(e) =>
                            setDraftField(p.id, 'stock', e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className={`${inputClass} w-24`}
                          value={d.lowStockThreshold}
                          onChange={(e) =>
                            setDraftField(
                              p.id,
                              'lowStockThreshold',
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={stockStatus(p)} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={savingId === p.id}
                          onClick={() => saveRow(p)}
                          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                        >
                          {savingId === p.id ? 'Saving…' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {items.map((p) => {
              const d = getDraft(p)
              return (
                <article
                  key={p.id}
                  className="rounded-2xl border border-line bg-white p-4 shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-ink">{p.name}</p>
                      <p className="text-xs text-muted">{p.sku || '—'}</p>
                    </div>
                    <StatusBadge status={stockStatus(p)} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="text-xs font-semibold text-muted">
                      Stock
                      <input
                        className={`${inputClass} mt-1`}
                        value={d.stock}
                        onChange={(e) =>
                          setDraftField(p.id, 'stock', e.target.value)
                        }
                      />
                    </label>
                    <label className="text-xs font-semibold text-muted">
                      Threshold
                      <input
                        className={`${inputClass} mt-1`}
                        value={d.lowStockThreshold}
                        onChange={(e) =>
                          setDraftField(
                            p.id,
                            'lowStockThreshold',
                            e.target.value,
                          )
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    disabled={savingId === p.id}
                    onClick={() => saveRow(p)}
                    className="mt-3 w-full rounded-xl bg-brand-500 py-2 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {savingId === p.id ? 'Saving…' : 'Save stock'}
                  </button>
                </article>
              )
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
