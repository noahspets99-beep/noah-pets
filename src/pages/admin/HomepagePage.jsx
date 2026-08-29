import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Image, Layout, Pencil } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Modal from '../../admin/components/Modal'
import EmptyState from '../../admin/components/EmptyState'
import { useHomepageService } from '../../services/adminServices'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

export default function HomepagePage() {
  const homepage = useHomepageService()
  const sections = homepage.list()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', enabled: true, configText: '{}' })

  const sorted = useMemo(
    () => [...sections].sort((a, b) => a.sortOrder - b.sortOrder),
    [sections],
  )

  const openEdit = (section) => {
    setEditing(section)
    setForm({
      title: section.title,
      enabled: section.enabled,
      configText: JSON.stringify(section.config || {}, null, 2),
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editing) return
    let config
    try {
      config = JSON.parse(form.configText)
    } catch {
      return
    }
    await homepage.update(editing.id, {
      title: form.title.trim(),
      enabled: form.enabled,
      config,
    })
    setEditing(null)
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Homepage"
        subtitle="Enable, reorder, and configure storefront homepage sections."
        actions={
          <Link
            to="/admin/banners"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface"
          >
            <Image className="h-4 w-4" />
            Manage banners
          </Link>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={Layout}
          title="No homepage sections"
          description="Seed sections from homepageSections.js will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <ul className="divide-y divide-line">
            {sorted.map((section, index) => (
              <li
                key={section.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted">
                      #{section.sortOrder}
                    </span>
                    <p className="font-bold text-ink">{section.title}</p>
                    <StatusBadge
                      status={section.enabled ? 'Enabled' : 'Disabled'}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Key: {section.key}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => homepage.reorder(section.id, 'up')}
                    className="rounded-lg border border-line p-2 text-muted transition hover:bg-surface disabled:opacity-40"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === sorted.length - 1}
                    onClick={() => homepage.reorder(section.id, 'down')}
                    className="rounded-lg border border-line p-2 text-muted transition hover:bg-surface disabled:opacity-40"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      homepage.update(section.id, {
                        enabled: !section.enabled,
                      })
                    }
                    className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink transition hover:bg-surface"
                  >
                    {section.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(section)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
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
        title={editing ? `Edit · ${editing.key}` : 'Edit section'}
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, enabled: e.target.checked }))
                }
                className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
              />
              <span className="text-sm font-semibold text-ink">Enabled</span>
            </label>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Config (JSON)
              </label>
              <textarea
                rows={10}
                value={form.configText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, configText: e.target.value }))
                }
                className={`${inputClass} font-mono text-xs`}
                spellCheck={false}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
              >
                Save section
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
