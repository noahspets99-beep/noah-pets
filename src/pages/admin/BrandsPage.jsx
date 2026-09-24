import { useMemo, useState } from 'react'
import { Award, Pencil, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import EmptyState from '../../admin/components/EmptyState'
import Modal from '../../admin/components/Modal'
import { slugify } from '../../admin/utils'
import { useAdminStore } from '../../context/AdminStore'

const EMPTY = {
  name: '',
  slug: '',
  logo: '',
  status: 'Active',
  sortOrder: 0,
}

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'

export default function BrandsPage() {
  const { brands, createBrand, updateBrand, deleteBrand } = useAdminStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [slugManual, setSlugManual] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const sorted = useMemo(
    () =>
      [...brands].sort(
        (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0),
      ),
    [brands],
  )

  const openCreate = () => {
    setEditing('new')
    setForm(EMPTY)
    setSlugManual(false)
  }

  const openEdit = (brand) => {
    setEditing(brand)
    setForm({
      name: brand.name || '',
      slug: brand.slug || '',
      logo: brand.logo || brand.image || '',
      status: brand.status || (brand.active === false ? 'Inactive' : 'Active'),
      sortOrder: Number(brand.sortOrder) || 0,
    })
    setSlugManual(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      logo: form.logo.trim(),
      image: form.logo.trim(),
      status: form.status,
      active: form.status === 'Active',
      sortOrder: Number(form.sortOrder) || 0,
    }
    if (!payload.name) return
    if (editing === 'new') {
      await createBrand(payload)
    } else {
      await updateBrand(editing.id, payload)
    }
    setEditing(null)
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Brands"
        subtitle="Manage brand names and logos shown on the Homepage Shop by Brand section."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Add brand
          </button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No brands yet"
          description="Add brands to control the Homepage brand section. Until then, brands are derived from products."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <ul className="divide-y divide-line">
            {sorted.map((brand) => (
              <li
                key={brand.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {brand.logo || brand.image ? (
                    <img
                      src={brand.logo || brand.image}
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-line"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Award className="h-4 w-4" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-ink">{brand.name}</p>
                      <StatusBadge
                        status={
                          brand.active !== false && brand.status !== 'Inactive'
                            ? 'Active'
                            : 'Inactive'
                        }
                      />
                    </div>
                    <p className="text-xs text-muted">
                      Order #{Number(brand.sortOrder) || 0}
                      {brand.slug ? ` · ${brand.slug}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateBrand(brand.id, {
                        status:
                          brand.status === 'Inactive' || brand.active === false
                            ? 'Active'
                            : 'Inactive',
                        active:
                          brand.status === 'Inactive' || brand.active === false,
                      })
                    }
                    className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink hover:bg-surface"
                  >
                    {brand.status === 'Inactive' || brand.active === false
                      ? 'Enable'
                      : 'Disable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(brand)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(brand)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-danger hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add brand' : 'Edit brand'}
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
              form="brand-form"
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
            >
              Save brand
            </button>
          </div>
        }
      >
        {editing && (
          <form id="brand-form" onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm((f) => ({
                    ...f,
                    name,
                    slug: slugManual ? f.slug : slugify(name),
                  }))
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true)
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Logo / image URL
              </label>
              <input
                value={form.logo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, logo: e.target.value }))
                }
                className={inputClass}
                placeholder="https://…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Sort order
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: Number(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete brand?"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                await deleteBrand(deleteTarget.id)
                setDeleteTarget(null)
              }}
              className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">
          Permanently delete{' '}
          <strong className="text-ink">{deleteTarget?.name}</strong>?
        </p>
      </Modal>
    </div>
  )
}
