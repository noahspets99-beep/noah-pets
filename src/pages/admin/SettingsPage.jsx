import { useState } from 'react'
import { Save, Settings, Shield } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import { useAdminStore } from '../../context/AdminStore'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-muted">{description}</p>
      )}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line bg-surface/40 p-4 transition hover:bg-surface">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-brand-500' : 'bg-line'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'left-[1.375rem]' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  )
}

export default function SettingsPage() {
  const { settings, saveSettings } = useAdminStore()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [settingsVersion, setSettingsVersion] = useState(settings)

  if (settingsVersion !== settings) {
    setSettingsVersion(settings)
    setForm(settings)
  }

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await saveSettings(form)
    setSaving(false)
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure your store details, delivery rules, and storefront preferences."
        actions={
          <button
            type="submit"
            form="settings-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        }
      />

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        <SectionCard
          title="Store Information"
          description="Basic details shown to customers and on invoices."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Store Name">
              <input
                value={form.storeName}
                onChange={(e) => update('storeName', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Contact Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Currency">
              <select
                value={form.currency}
                onChange={(e) => update('currency', e.target.value)}
                className={inputClass}
              >
                <option value="INR">INR (₹)</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Store Address">
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Delivery Settings"
          description="Configure shipping fees and free delivery thresholds."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Standard Delivery Fee (₹)">
              <input
                type="number"
                min="0"
                value={form.deliveryFee}
                onChange={(e) =>
                  update('deliveryFee', Number(e.target.value))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Free Delivery Above (₹)">
              <input
                type="number"
                min="0"
                value={form.freeDeliveryThreshold}
                onChange={(e) =>
                  update('freeDeliveryThreshold', Number(e.target.value))
                }
                className={inputClass}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Order Settings"
          description="Minimum order value and checkout rules."
        >
          <Field label="Minimum Order Amount (₹)">
            <input
              type="number"
              min="0"
              value={form.minimumOrderAmount}
              onChange={(e) =>
                update('minimumOrderAmount', Number(e.target.value))
              }
              className={`${inputClass} max-w-xs`}
            />
          </Field>
        </SectionCard>

        <SectionCard title="Tax" description="Default tax rate applied at checkout.">
          <Field label="Tax Rate (%)">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.taxPercent}
              onChange={(e) => update('taxPercent', Number(e.target.value))}
              className={`${inputClass} max-w-xs`}
            />
          </Field>
        </SectionCard>

        <SectionCard
          title="Social Links"
          description="Links displayed in the footer and contact sections."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram URL">
              <input
                type="url"
                value={form.instagram}
                onChange={(e) => update('instagram', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Facebook URL">
              <input
                type="url"
                value={form.facebook}
                onChange={(e) => update('facebook', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="WhatsApp Number">
              <input
                value={form.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Storefront Toggles"
          description="Enable or disable features on your customer-facing store."
        >
          <div className="space-y-3">
            <Toggle
              label="Show out-of-stock products"
              description="Display products with zero stock on the storefront."
              checked={form.showOutOfStock}
              onChange={(v) => update('showOutOfStock', v)}
            />
            <Toggle
              label="Enable customer reviews"
              description="Allow shoppers to leave product reviews."
              checked={form.enableReviews}
              onChange={(v) => update('enableReviews', v)}
            />
            <Toggle
              label="Enable wishlist"
              description="Let customers save products to a wishlist."
              checked={form.enableWishlist}
              onChange={(v) => update('enableWishlist', v)}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Admin Account"
          description="Administrator access is controlled by Firebase Authentication."
        >
          <Field label="Authorized admin email">
            <input
              type="email"
              value={form.adminEmail}
              readOnly
              className={`${inputClass} max-w-md bg-surface/80 text-muted`}
            />
          </Field>
          <div className="rounded-xl border border-line bg-surface/60 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Password</p>
                <p className="mt-1 text-sm text-muted">
                  Sign in and password changes are managed through Firebase
                  Authentication. Use Forgot password on the admin login page
                  to reset.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            <Settings className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
