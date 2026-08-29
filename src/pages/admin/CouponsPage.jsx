import { useMemo, useState } from 'react'
import { Plus, TicketPercent, Trash2 } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Pagination from '../../admin/components/Pagination'
import EmptyState from '../../admin/components/EmptyState'
import Modal from '../../admin/components/Modal'
import { formatDate, formatINR, paginate } from '../../admin/utils'
import { useAdminStore } from '../../context/AdminStore'

const EMPTY_FORM = {
  code: '',
  type: 'Percentage',
  value: '',
  minOrder: '',
  maxDiscount: '',
  startDate: '',
  endDate: '',
  usageLimit: '',
  status: 'Active',
}

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

function estimateDiscount(coupon) {
  if (coupon.type === 'Fixed Amount') {
    return coupon.used * coupon.value
  }
  return coupon.used * (coupon.maxDiscount || coupon.value * 10)
}

export default function CouponsPage() {
  const { coupons, createCoupon, updateCoupon, deleteCoupon } = useAdminStore()
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const kpis = useMemo(() => {
    const active = coupons.filter((c) => c.status === 'Active').length
    const expired = coupons.filter((c) => c.status === 'Expired').length
    const used = coupons.reduce((s, c) => s + c.used, 0)
    const totalDiscount = coupons.reduce((s, c) => s + estimateDiscount(c), 0)
    return { active, expired, used, totalDiscount }
  }, [coupons])

  const { items, totalPages } = paginate(coupons, page, 8)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (coupon) => {
    setEditing(coupon)
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrder: String(coupon.minOrder),
      maxDiscount: String(coupon.maxDiscount),
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      usageLimit: String(coupon.usageLimit),
      status: coupon.status,
    })
    setFormOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder),
      maxDiscount: Number(form.maxDiscount),
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimit: Number(form.usageLimit),
      status: form.status,
    }
    if (editing) {
      await updateCoupon(editing.id, payload)
    } else {
      await createCoupon(payload)
    }
    setFormOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteCoupon(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Coupons"
        subtitle="Create and manage discount codes for your pet store."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Active', value: kpis.active, tone: 'text-success' },
          { label: 'Expired', value: kpis.expired, tone: 'text-danger' },
          { label: 'Total Used', value: kpis.used, tone: 'text-brand-600' },
          {
            label: 'Est. Total Discount',
            value: formatINR(kpis.totalDiscount),
            tone: 'text-accent',
          },
        ].map(({ label, value, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {label}
            </p>
            <p className={`mt-1 text-2xl font-extrabold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      {coupons.length === 0 ? (
        <EmptyState
          icon={TicketPercent}
          title="No coupons yet"
          description="Create your first discount code to boost sales."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </button>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Min Order</th>
                  <th className="px-4 py-3 font-semibold">Used</th>
                  <th className="px-4 py-3 font-semibold">Valid Until</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t border-line hover:bg-surface/60">
                    <td className="px-4 py-3 font-bold text-ink">{c.code}</td>
                    <td className="px-4 py-3 text-muted">{c.type}</td>
                    <td className="px-4 py-3 font-semibold">
                      {c.type === 'Percentage' ? `${c.value}%` : formatINR(c.value)}
                    </td>
                    <td className="px-4 py-3">{formatINR(c.minOrder)}</td>
                    <td className="px-4 py-3">
                      {c.used} / {c.usageLimit}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(c.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          className="font-semibold text-danger hover:text-red-600"
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
            {items.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink">{c.code}</p>
                    <p className="text-sm text-muted">{c.type}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted">Value</p>
                    <p className="font-semibold">
                      {c.type === 'Percentage'
                        ? `${c.value}%`
                        : formatINR(c.value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Min Order</p>
                    <p className="font-semibold">{formatINR(c.minOrder)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Used</p>
                    <p className="font-semibold">
                      {c.used} / {c.usageLimit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Valid Until</p>
                    <p className="font-semibold">{formatDate(c.endDate)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="text-sm font-semibold text-brand-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(c)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-danger"
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
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        title={editing ? 'Edit Coupon' : 'Create Coupon'}
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
              form="coupon-form"
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              {editing ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        }
      >
        <form id="coupon-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Code
              </label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className={inputClass}
                placeholder="PETLOVE20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed Amount">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Value {form.type === 'Percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Min Order (₹)
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Max Discount (₹)
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.maxDiscount}
                onChange={(e) =>
                  setForm({ ...form, maxDiscount: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Usage Limit
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm({ ...form, usageLimit: e.target.value })
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
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete coupon?"
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
              Delete Coupon
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">
          Delete coupon <strong className="text-ink">{deleteTarget?.code}</strong>?
          Customers will no longer be able to use this code.
        </p>
      </Modal>
    </div>
  )
}
