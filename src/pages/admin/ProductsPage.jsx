import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Copy,
  Eye,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Pagination from '../../admin/components/Pagination'
import EmptyState from '../../admin/components/EmptyState'
import Modal from '../../admin/components/Modal'
import ActionMenu from '../../admin/components/ActionMenu'
import { formatDate, formatINR, paginate } from '../../admin/utils'
import { useAdminStore } from '../../context/AdminStore'
import { PET_TYPES } from '../../admin/productConstants'

const PER_PAGE = 10

const sortOptions = [
  { value: 'updated-desc', label: 'Recently updated' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'price-asc', label: 'Price low–high' },
  { value: 'price-desc', label: 'Price high–low' },
  { value: 'stock-asc', label: 'Stock low–high' },
  { value: 'sales-desc', label: 'Best sellers' },
]

function stockLevel(product) {
  if (product.stock === 0) return 'out'
  if (product.stock <= product.lowStockThreshold) return 'low'
  return 'in'
}

function RowActions({ product, onView, onDuplicate, onDeactivate }) {
  const navigate = useNavigate()

  return (
    <ActionMenu>
      {(close) => (
        <>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close()
              onView(product)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-ink hover:bg-surface"
          >
            <Eye className="h-4 w-4 text-muted" />
            View
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close()
              navigate(`/admin/products/${product.id}/edit`)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-ink hover:bg-surface"
          >
            <Pencil className="h-4 w-4 text-muted" />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close()
              onDuplicate(product.id)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-ink hover:bg-surface"
          >
            <Copy className="h-4 w-4 text-muted" />
            Duplicate
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close()
              onDeactivate(product)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-danger hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Deactivate
          </button>
        </>
      )}
    </ActionMenu>
  )
}

function ProductQuickView({ product }) {
  if (!product) return null
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <img
          src={product.images?.[0]}
          alt=""
          className="h-24 w-24 shrink-0 rounded-xl border border-line object-cover"
        />
        <div className="min-w-0">
          <h3 className="font-bold text-ink">{product.name}</h3>
          <p className="text-sm text-muted">SKU: {product.sku}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={product.status} />
            {product.featured && <StatusBadge status="Featured" />}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted">Price</p>
          <p className="font-semibold">{formatINR(product.price)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">MRP</p>
          <p className="font-semibold">{formatINR(product.mrp)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Stock</p>
          <p className="font-semibold">{product.stock}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Sales</p>
          <p className="font-semibold">{product.sales ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Pet Type</p>
          <p className="font-semibold">{product.petType}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Category</p>
          <p className="font-semibold">{product.category}</p>
        </div>
      </div>
      {product.shortDescription && (
        <p className="text-sm text-ink-soft">{product.shortDescription}</p>
      )}
    </div>
  )
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const {
    products,
    categories,
    deleteProduct,
    duplicateProduct,
    dataStatus,
  } = useAdminStore()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [petType, setPetType] = useState('')
  const [status, setStatus] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [sort, setSort] = useState('updated-desc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [viewProduct, setViewProduct] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)

  const categoryOptions = useMemo(
    () => [...new Set(categories.map((c) => c.name))].sort(),
    [categories],
  )

  const filtered = useMemo(() => {
    let list = [...products]
    const q = search.trim().toLowerCase()

    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q),
      )
    }
    if (category) list = list.filter((p) => p.category === category)
    if (petType) list = list.filter((p) => p.petType === petType)
    if (status) list = list.filter((p) => p.status === status)
    if (stockFilter !== 'all') {
      list = list.filter((p) => stockLevel(p) === stockFilter)
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'stock-asc':
          return a.stock - b.stock
        case 'sales-desc':
          return (b.sales ?? 0) - (a.sales ?? 0)
        case 'updated-desc':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
    })

    return list
  }, [products, search, category, petType, status, stockFilter, sort])

  const { items, totalPages, total } = paginate(filtered, page, PER_PAGE)
  const safePage = Math.min(page, totalPages)
  const pageItems =
    safePage === page ? items : paginate(filtered, safePage, PER_PAGE).items

  const selectedOnPage = selected.filter((id) =>
    products.some((p) => p.id === id),
  )

  const allPageSelected =
    pageItems.length > 0 && pageItems.every((p) => selectedOnPage.includes(p.id))

  const toggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) =>
        prev.filter((id) => !pageItems.some((p) => p.id === id)),
      )
    } else {
      const ids = pageItems.map((p) => p.id)
      setSelected((prev) => [...new Set([...prev, ...ids])])
    }
  }

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return
    await deleteProduct(deactivateTarget.id)
    setDeactivateTarget(null)
  }

  const selectClass =
    'rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100'

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Products"
        subtitle={`${products.length} products in catalog`}
        breadcrumbs={['Catalog', 'Products']}
        actions={
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        }
      />

      {dataStatus?.error && (
        <div className="mb-4 rounded-2xl border border-danger/30 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {dataStatus.error}
        </div>
      )}

      <div className="mb-4 space-y-3 rounded-2xl border border-line bg-white p-4 shadow-card">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name, SKU, or brand..."
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            className={selectClass}
          >
            <option value="">All categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={petType}
            onChange={(e) => {
              setPetType(e.target.value)
              setPage(1)
            }}
            className={selectClass}
          >
            <option value="">All pets</option>
            {PET_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className={selectClass}
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value)
              setPage(1)
            }}
            className={selectClass}
          >
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
            }}
            className={selectClass}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try adjusting your filters or add a new product to get started."
          action={
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          }
        />
      ) : (
        <>
          <p className="mb-3 text-xs text-muted">
            Showing {pageItems.length} of {total} products
          </p>

          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-card md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-line text-brand-500"
                      aria-label="Select all on page"
                    />
                  </th>
                  <th className="w-[28%] px-4 py-3 font-semibold">Product</th>
                  <th className="w-[12%] px-4 py-3 font-semibold">SKU</th>
                  <th className="w-[16%] px-4 py-3 font-semibold">Category</th>
                  <th className="w-[10%] px-4 py-3 font-semibold">Price</th>
                  <th className="w-[8%] px-4 py-3 font-semibold">Stock</th>
                  <th className="w-[10%] px-4 py-3 font-semibold">Status</th>
                  <th className="w-[10%] px-4 py-3 font-semibold">Updated</th>
                  <th className="w-[8%] px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr key={p.id} className="border-t border-line hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleOne(p.id)}
                        className="h-4 w-4 rounded border-line text-brand-500"
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    <td className="max-w-0 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={p.images?.[0]}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p
                            className="truncate font-semibold text-ink"
                            title={p.name}
                          >
                            {p.name}
                          </p>
                          <p className="truncate text-xs text-muted">{p.petType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-0 px-4 py-3 text-muted">
                      <span className="block truncate" title={p.sku}>
                        {p.sku}
                      </span>
                    </td>
                    <td className="max-w-0 px-4 py-3 text-muted">
                      <span className="block truncate" title={p.category}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatINR(p.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          stockLevel(p) === 'out'
                            ? 'font-semibold text-danger'
                            : stockLevel(p) === 'low'
                              ? 'font-semibold text-amber-600'
                              : ''
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(p.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <RowActions
                          product={p}
                          onView={setViewProduct}
                          onDuplicate={duplicateProduct}
                          onDeactivate={setDeactivateTarget}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {pageItems.map((p) => (
              <article
                key={p.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-line text-brand-500"
                    aria-label={`Select ${p.name}`}
                  />
                  <img
                    src={p.images?.[0]}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate font-bold text-ink" title={p.name}>
                      {p.name}
                    </p>
                    <p className="truncate text-xs text-muted" title={`${p.sku} · ${p.petType}`}>
                      {p.sku} · {p.petType}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                  <div className="shrink-0">
                    <RowActions
                      product={p}
                      onView={setViewProduct}
                      onDuplicate={duplicateProduct}
                      onDeactivate={setDeactivateTarget}
                    />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm">
                  <div>
                    <p className="text-xs text-muted">Price</p>
                    <p className="font-semibold">{formatINR(p.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Stock</p>
                    <p
                      className={`font-semibold ${
                        stockLevel(p) === 'out'
                          ? 'text-danger'
                          : stockLevel(p) === 'low'
                            ? 'text-amber-600'
                            : ''
                      }`}
                    >
                      {p.stock}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Category</p>
                    <p className="font-semibold">{p.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Updated</p>
                    <p className="font-semibold">{formatDate(p.updatedAt)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(viewProduct)}
        onClose={() => setViewProduct(null)}
        title="Product Quick View"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setViewProduct(null)}
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold"
            >
              Close
            </button>
            {viewProduct && (
              <button
                type="button"
                onClick={() => {
                  navigate(`/admin/products/${viewProduct.id}/edit`)
                  setViewProduct(null)
                }}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white"
              >
                Edit Product
              </button>
            )}
          </div>
        }
      >
        <ProductQuickView product={viewProduct} />
      </Modal>

      <Modal
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title="Deactivate product?"
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeactivateTarget(null)}
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeactivate}
              className="rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white"
            >
              Deactivate
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">
          Deactivate{' '}
          <strong className="text-ink">{deactivateTarget?.name}</strong>? It will
          be hidden from the storefront (soft delete).
        </p>
      </Modal>
    </div>
  )
}
