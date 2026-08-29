import { useState } from 'react'
import { ExternalLink, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import EmptyState from '../../admin/components/EmptyState'
import Modal from '../../admin/components/Modal'
import { formatDate } from '../../admin/utils'
import { useAdminStore } from '../../context/AdminStore'

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  image: '',
  ctaLabel: '',
  ctaLink: '',
  position: 'Homepage Hero',
  backgroundStyle: 'Sky gradient',
  status: 'Active',
  startDate: '',
  endDate: '',
}

const POSITIONS = [
  'Homepage Hero',
  'Homepage Mid',
  'Promo Strip',
  'Category Header',
]

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

export default function BannersPage() {
  const { banners, createBanner, updateBanner, deleteBanner } = useAdminStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (banner) => {
    setEditing(banner)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      ctaLabel: banner.ctaLabel,
      ctaLink: banner.ctaLink,
      position: banner.position,
      backgroundStyle: banner.backgroundStyle,
      status: banner.status,
      startDate: banner.startDate,
      endDate: banner.endDate,
    })
    setFormOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (editing) {
      await updateBanner(editing.id, payload)
    } else {
      await createBanner(payload)
    }
    setFormOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteBanner(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Banners"
        subtitle="Manage homepage and promotional banners for your storefront."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Add Banner
          </button>
        }
      />

      {banners.length === 0 ? (
        <EmptyState
          icon={ImagePlus}
          title="No banners yet"
          description="Create a banner to highlight offers and new arrivals."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Banner
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {banners.map((b) => (
            <article
              key={b.id}
              className="overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative aspect-[2/1] bg-surface">
                {b.image ? (
                  <img
                    src={b.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <ImagePlus className="h-10 w-10 opacity-40" />
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <StatusBadge status={b.status} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-ink">{b.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {b.subtitle}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
                    {b.position}
                  </span>
                  {b.ctaLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 font-semibold text-ink-soft ring-1 ring-line">
                      {b.ctaLabel}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted">
                  {formatDate(b.startDate)} – {formatDate(b.endDate)}
                </p>
                <div className="mt-4 flex gap-2 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(b)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2 text-sm font-semibold text-ink hover:bg-surface"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(b)}
                    className="inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-danger hover:bg-red-100"
                    aria-label="Delete banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        title={editing ? 'Edit Banner' : 'Create Banner'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setFormOpen(false)
                setEditing(null)
              }}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="banner-form"
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              {editing ? 'Save Changes' : 'Create Banner'}
            </button>
          </div>
        }
      >
        <form id="banner-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Title
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Subtitle
            </label>
            <textarea
              required
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Image URL
            </label>
            <input
              required
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className={inputClass}
              placeholder="https://…"
            />
            {form.image && (
              <img
                src={form.image}
                alt=""
                className="mt-2 h-24 w-full rounded-xl object-cover ring-1 ring-line"
              />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                CTA Label
              </label>
              <input
                required
                value={form.ctaLabel}
                onChange={(e) =>
                  setForm({ ...form, ctaLabel: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                CTA Link
              </label>
              <input
                required
                value={form.ctaLink}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                className={inputClass}
                placeholder="/#offers"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Position
              </label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className={inputClass}
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Background Style
              </label>
              <input
                value={form.backgroundStyle}
                onChange={(e) =>
                  setForm({ ...form, backgroundStyle: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Start Date
              </label>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                End Date
              </label>
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete banner?"
        footer={
          <div className="flex justify-end gap-2">
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
              Delete Banner
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">
          Delete banner <strong className="text-ink">{deleteTarget?.title}</strong>?
          It will be removed from your storefront immediately.
        </p>
      </Modal>
    </div>
  )
}
