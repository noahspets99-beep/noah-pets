import { useMemo, useState } from 'react'
import { EyeOff, MessageSquare, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Pagination from '../../admin/components/Pagination'
import EmptyState from '../../admin/components/EmptyState'
import Modal from '../../admin/components/Modal'
import { formatDate, paginate } from '../../admin/utils'
import { useAdminStore } from '../../context/AdminStore'

const TABS = ['All', 'Pending', 'Approved', 'Hidden']

const EMPTY_FORM = {
  productId: '',
  customer: '',
  review: '',
  rating: 5,
  status: 'Approved',
}

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-accent text-accent' : 'text-line'
          }`}
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const {
    reviews,
    products,
    createReview,
    updateReview,
    updateReviewStatus,
    deleteReview,
  } = useAdminStore()
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const productOptions = useMemo(
    () =>
      [...products]
        .filter((p) => p?.id && p?.name)
        .sort((a, b) => String(a.name).localeCompare(String(b.name))),
    [products],
  )

  const counts = useMemo(() => {
    const map = { All: reviews.length }
    TABS.slice(1).forEach((t) => {
      map[t] = reviews.filter((r) => r.status === t).length
    })
    return map
  }, [reviews])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reviews.filter((r) => {
      if (tab !== 'All' && r.status !== tab) return false
      if (!q) return true
      return (
        String(r.customer || '')
          .toLowerCase()
          .includes(q) ||
        String(r.product || '')
          .toLowerCase()
          .includes(q) ||
        String(r.review || '')
          .toLowerCase()
          .includes(q) ||
        String(r.productId || '')
          .toLowerCase()
          .includes(q)
      )
    })
  }, [reviews, tab, search])

  const { items, totalPages } = paginate(filtered, page, 8)

  const handleTabChange = (t) => {
    setTab(t)
    setPage(1)
  }

  const openCreate = () => {
    setEditing('new')
    setForm(EMPTY_FORM)
  }

  const openEdit = (r) => {
    setEditing(r)
    setForm({
      productId: r.productId || '',
      customer: r.customer || '',
      review: r.review || '',
      rating: Number(r.rating) || 5,
      status: r.status || 'Approved',
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const product = productOptions.find((p) => p.id === form.productId)
    if (!form.productId || !form.customer.trim() || !form.review.trim()) return
    const payload = {
      productId: form.productId,
      product: product?.name || '',
      customer: form.customer.trim(),
      review: form.review.trim(),
      rating: Number(form.rating) || 5,
      status: form.status || 'Approved',
    }
    if (editing === 'new') {
      await createReview(payload)
    } else {
      await updateReview(editing.id, payload)
    }
    setEditing(null)
  }

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteReview(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Reviews"
        subtitle="Add and moderate product reviews. Each review is linked by product ID."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Add review
          </button>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
              tab === t
                ? 'bg-ink text-white'
                : 'bg-white text-ink-soft ring-1 ring-line hover:bg-brand-50'
            }`}
          >
            {t}
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                tab === t ? 'bg-white/20' : 'bg-surface text-muted'
              }`}
            >
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search customer, product, or review…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews found"
          description="Add a review for a product, or adjust filters."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Review</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 font-semibold text-ink">
                      {r.customer}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      <p>{r.product || '—'}</p>
                      {r.productId ? (
                        <p className="text-[10px] text-muted">ID: {r.productId}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={r.rating} />
                    </td>
                    <td className="max-w-xs px-4 py-3 text-muted">
                      <p className="line-clamp-2">{r.review}</p>
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                        >
                          Edit
                        </button>
                        {r.status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => updateReviewStatus(r.id, 'Approved')}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== 'Hidden' && (
                          <button
                            type="button"
                            onClick={() => updateReviewStatus(r.id, 'Hidden')}
                            className="rounded-lg bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-line hover:bg-slate-100"
                          >
                            Hide
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(r)}
                          className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {items.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink">{r.customer}</p>
                    <p className="text-sm text-muted">{r.product}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-2">
                  <StarRating rating={r.rating} />
                </div>
                <p className="mt-2 text-sm text-ink-soft">{r.review}</p>
                <p className="mt-2 text-xs text-muted">{formatDate(r.date)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  {r.status !== 'Approved' && (
                    <button
                      type="button"
                      onClick={() => updateReviewStatus(r.id, 'Approved')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== 'Hidden' && (
                    <button
                      type="button"
                      onClick={() => updateReviewStatus(r.id, 'Hidden')}
                      className="inline-flex items-center gap-1 rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-line"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(r)}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add review' : 'Edit review'}
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="review-form"
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
            >
              Save review
            </button>
          </div>
        }
      >
        {editing && (
          <form id="review-form" onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Product *
              </label>
              <select
                required
                value={form.productId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productId: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">Select product…</option>
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Reviewer name *
              </label>
              <input
                required
                value={form.customer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Rating *
              </label>
              <select
                value={form.rating}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rating: Number(e.target.value) }))
                }
                className={inputClass}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Review text *
              </label>
              <textarea
                required
                rows={4}
                value={form.review}
                onChange={(e) =>
                  setForm((f) => ({ ...f, review: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className={inputClass}
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete review?"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
            >
              Delete Review
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">
          Permanently delete the review from{' '}
          <strong className="text-ink">{deleteTarget?.customer}</strong> on{' '}
          <strong className="text-ink">{deleteTarget?.product}</strong>? This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
