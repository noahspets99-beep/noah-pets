import { useEffect, useMemo, useState } from 'react'
import {
  MoreVertical,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import EmptyState from '../../admin/components/EmptyState'
import Modal from '../../admin/components/Modal'
import { formatDate, slugify } from '../../admin/utils'
import { useAdminStore } from '../../context/AdminStore'
import { PET_TYPES } from '../../admin/productConstants'

const CATEGORY_PET_TYPES = ['All', ...PET_TYPES.filter((p) => p !== 'Other')]

const EMPTY_CATEGORY = {
  name: '',
  slug: '',
  parentId: '',
  petType: 'All',
  description: '',
  image: '',
  status: 'Active',
  featured: false,
}

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'

const labelClass = 'mb-1.5 block text-sm font-semibold text-ink'

function CategoryForm({ form, setForm, categories, excludeId, slugManual, setSlugManual }) {
  const parentOptions = categories.filter(
    (c) => c.id !== excludeId && !c.parentId,
  )

  const set = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !slugManual) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cat-name" className={labelClass}>
          Name *
        </label>
        <input
          id="cat-name"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className={inputClass}
          placeholder="Dog Food"
        />
      </div>
      <div>
        <label htmlFor="cat-slug" className={labelClass}>
          Slug
        </label>
        <input
          id="cat-slug"
          value={form.slug}
          onChange={(e) => {
            setSlugManual(true)
            setForm((prev) => ({ ...prev, slug: e.target.value }))
          }}
          className={inputClass}
          placeholder="dog-food"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cat-parent" className={labelClass}>
            Parent Category
          </label>
          <select
            id="cat-parent"
            value={form.parentId || ''}
            onChange={(e) => set('parentId', e.target.value || null)}
            className={inputClass}
          >
            <option value="">None (top level)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cat-pet" className={labelClass}>
            Pet Type
          </label>
          <select
            id="cat-pet"
            value={form.petType}
            onChange={(e) => set('petType', e.target.value)}
            className={inputClass}
          >
            {CATEGORY_PET_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="cat-desc" className={labelClass}>
          Description
        </label>
        <textarea
          id="cat-desc"
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="Brief category description..."
        />
      </div>
      <div>
        <label htmlFor="cat-image" className={labelClass}>
          Image URL
        </label>
        <input
          id="cat-image"
          value={form.image}
          onChange={(e) => set('image', e.target.value)}
          className={inputClass}
          placeholder="https://images.unsplash.com/..."
        />
        {form.image.trim() && (
          <img
            src={form.image.trim()}
            alt=""
            className="mt-2 h-20 w-20 rounded-xl border border-line object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/80x80?text=Error'
            }}
          />
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cat-status" className={labelClass}>
            Status
          </label>
          <select
            id="cat-status"
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className={inputClass}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
            />
            <span className="text-sm font-semibold text-ink">Featured category</span>
          </label>
        </div>
      </div>
    </div>
  )
}

function RowActions({ category, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const close = () => setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="rounded-xl border border-line p-2 text-muted transition hover:bg-surface hover:text-ink"
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 z-20 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lift"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onEdit(category)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-surface"
          >
            <Pencil className="h-4 w-4 text-muted" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onDelete(category)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-danger hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function CategoriesPage() {
  const { categories, createCategory, updateCategory, deleteCategory } =
    useAdminStore()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_CATEGORY)
  const [slugManual, setSlugManual] = useState(false)
  const [saving, setSaving] = useState(false)

  const sorted = useMemo(
    () =>
      [...categories].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      ),
    [categories],
  )

  const parentName = (parentId) => {
    if (!parentId) return '—'
    return categories.find((c) => c.id === parentId)?.name ?? '—'
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_CATEGORY)
    setSlugManual(false)
    setFormOpen(true)
  }

  const openEdit = (category) => {
    setEditingId(category.id)
    setForm({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? '',
      petType: category.petType,
      description: category.description ?? '',
      image: category.image ?? '',
      status: category.status,
      featured: category.featured ?? false,
    })
    setSlugManual(true)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_CATEGORY)
    setSlugManual(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.name),
      parentId: form.parentId || null,
      image:
        form.image.trim() ||
        'https://placehold.co/400x400?text=Category',
    }
    try {
      if (editingId) {
        await updateCategory(editingId, payload)
      } else {
        await createCategory(payload)
      }
      closeForm()
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteCategory(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories in catalog`}
        breadcrumbs={['Catalog', 'Categories']}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Organize your products with categories for easier browsing."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Pet Type</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Parent</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr key={c.id} className="border-t border-line hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.image}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-ink">{c.name}</p>
                          <p className="text-xs text-muted">/{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{c.petType}</td>
                    <td className="px-4 py-3 font-semibold">{c.productCount}</td>
                    <td className="px-4 py-3 text-muted">{parentName(c.parentId)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(c.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <RowActions
                        category={c}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {sorted.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={c.image}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{c.name}</p>
                    <p className="text-xs text-muted">/{c.slug}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={c.status} />
                      {c.featured && <StatusBadge status="Featured" />}
                    </div>
                  </div>
                  <RowActions
                    category={c}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm">
                  <div>
                    <p className="text-xs text-muted">Pet Type</p>
                    <p className="font-semibold">{c.petType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Products</p>
                    <p className="font-semibold">{c.productCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Parent</p>
                    <p className="font-semibold">{parentName(c.parentId)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Updated</p>
                    <p className="font-semibold">{formatDate(c.updatedAt)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingId ? 'Edit Category' : 'Add Category'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={saving}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSave}>
          <CategoryForm
            form={form}
            setForm={setForm}
            categories={categories}
            excludeId={editingId}
            slugManual={slugManual}
            setSlugManual={setSlugManual}
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">
          Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
          Products in this category will not be deleted.
        </p>
      </Modal>
    </div>
  )
}
