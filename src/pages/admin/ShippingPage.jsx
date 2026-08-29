import { useState } from 'react'
import { Truck } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import { useShippingService } from '../../services/adminServices'
import { formatINR } from '../../admin/utils'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

const labelClass = 'mb-1.5 block text-sm font-semibold text-ink'

function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-ink sm:text-lg">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function ShippingPage() {
  const shippingApi = useShippingService()
  const [shipping, setShipping] = useState(() => shippingApi.getShipping())
  const [tax, setTax] = useState(() => shippingApi.getTax())
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await shippingApi.saveShipping({
        ...shipping,
        freeShippingMinOrder: Number(shipping.freeShippingMinOrder) || 0,
        standardShippingFee: Number(shipping.standardShippingFee) || 0,
        expressShippingFee: Number(shipping.expressShippingFee) || 0,
        codFee: Number(shipping.codFee) || 0,
        codMaxOrderValue: Number(shipping.codMaxOrderValue) || 0,
        remoteAreaSurcharge: Number(shipping.remoteAreaSurcharge) || 0,
      })
      await shippingApi.saveTax({
        ...tax,
        defaultRate: Number(tax.defaultRate) || 0,
        rates: (tax.rates || []).map((r) => ({
          ...r,
          rate: Number(r.rate) || 0,
        })),
      })
    } finally {
      setSaving(false)
    }
  }

  const updateRate = (index, field, value) => {
    setTax((prev) => ({
      ...prev,
      rates: prev.rates.map((r, i) =>
        i === index ? { ...r, [field]: value } : r,
      ),
    }))
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Shipping & Tax"
        subtitle="Free shipping threshold, fees, COD, and GST rates for Tamil Nadu."
        actions={
          <button
            type="submit"
            form="shipping-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            <Truck className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        }
      />

      <form id="shipping-form" onSubmit={handleSave} className="space-y-6">
        <Section title="Shipping" description="Fees and thresholds in INR">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Free shipping min order</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={shipping.freeShippingMinOrder}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    freeShippingMinOrder: e.target.value,
                  }))
                }
              />
              <p className="mt-1 text-xs text-muted">
                Currently {formatINR(Number(shipping.freeShippingMinOrder) || 0)}
              </p>
            </div>
            <div>
              <label className={labelClass}>Standard fee</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={shipping.standardShippingFee}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    standardShippingFee: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Express fee</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={shipping.expressShippingFee}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    expressShippingFee: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Standard ETA (days)</label>
              <input
                className={inputClass}
                value={shipping.standardEtaDays || ''}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    standardEtaDays: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Express ETA (days)</label>
              <input
                className={inputClass}
                value={shipping.expressEtaDays || ''}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    expressEtaDays: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Remote area surcharge</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={shipping.remoteAreaSurcharge}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    remoteAreaSurcharge: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!shipping.codAvailable}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    codAvailable: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
              />
              <span className="text-sm font-semibold text-ink">COD available</span>
            </label>
            <div>
              <label className={labelClass}>COD fee</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={shipping.codFee}
                onChange={(e) =>
                  setShipping((s) => ({ ...s, codFee: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>COD max order value</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={shipping.codMaxOrderValue}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    codMaxOrderValue: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-y`}
              value={shipping.notes || ''}
              onChange={(e) =>
                setShipping((s) => ({ ...s, notes: e.target.value }))
              }
            />
          </div>
        </Section>

        <Section title="Tax (GST)" description="Default rate and category rules">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Tax name</label>
              <input
                className={inputClass}
                value={tax.taxName || ''}
                onChange={(e) =>
                  setTax((t) => ({ ...t, taxName: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Default GST %</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={tax.defaultRate}
                onChange={(e) =>
                  setTax((t) => ({ ...t, defaultRate: e.target.value }))
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!tax.cgstSgstSplit}
              onChange={(e) =>
                setTax((t) => ({ ...t, cgstSgstSplit: e.target.checked }))
              }
              className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
            />
            <span className="text-sm font-semibold text-ink">
              Split CGST / SGST on invoices
            </span>
          </label>
          <div className="space-y-3">
            {(tax.rates || []).map((rate, index) => (
              <div
                key={rate.id}
                className="grid gap-3 rounded-xl border border-line bg-surface/40 p-4 sm:grid-cols-3"
              >
                <div className="sm:col-span-2">
                  <label className={labelClass}>Rule name</label>
                  <input
                    className={inputClass}
                    value={rate.name}
                    onChange={(e) => updateRate(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Rate %</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={rate.rate}
                    onChange={(e) => updateRate(index, 'rate', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>HSN hint</label>
                  <input
                    className={inputClass}
                    value={rate.hsnHint || ''}
                    onChange={(e) =>
                      updateRate(index, 'hsnHint', e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className={labelClass}>Tax notes</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-y`}
              value={tax.notes || ''}
              onChange={(e) => setTax((t) => ({ ...t, notes: e.target.value }))}
            />
          </div>
        </Section>
      </form>
    </div>
  )
}
