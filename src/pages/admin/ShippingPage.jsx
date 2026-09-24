import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  MapPin,
  Plus,
  Search,
  Trash2,
  Truck,
} from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import { useShippingService } from '../../services/adminServices'
import { useAdminStore } from '../../context/AdminStore'
import { formatINR } from '../../admin/utils'
import {
  INDIA_STATES_AND_UTS,
  citiesForState,
  normalizePriorityCities,
  normalizePriorityCity,
  slugifyCityName,
} from '../../data/indiaCities'

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

function PriorityCitiesPanel({ cities, onChange }) {
  const [state, setState] = useState('Tamil Nadu')
  const [citySearch, setCitySearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [etaDays, setEtaDays] = useState('2–5')
  const [pincodePrefix, setPincodePrefix] = useState('')

  const catalogCities = useMemo(() => {
    const list = citiesForState(state)
    const q = citySearch.trim().toLowerCase()
    if (!q) return list
    return list.filter((c) => c.toLowerCase().includes(q))
  }, [state, citySearch])

  const sorted = useMemo(
    () => normalizePriorityCities(cities),
    [cities],
  )

  const addCity = () => {
    const name = (customCity.trim() || selectedCity.trim()).trim()
    if (!name || !state) return
    const slug = slugifyCityName(name)
    if (sorted.some((c) => c.slug === slug || (c.city === name && c.state === state))) {
      return
    }
    const next = normalizePriorityCity({
      city: name,
      state,
      slug,
      region: state,
      etaDays: etaDays.trim() || '2–5',
      pincodePrefix: pincodePrefix.trim(),
      enabled: true,
      sortOrder: sorted.length + 1,
      highlights: `Pet food, accessories and essentials delivered to ${name}, ${state}.`,
    })
    onChange([...sorted, next])
    setSelectedCity('')
    setCustomCity('')
    setCitySearch('')
  }

  const updateCity = (id, patch) => {
    onChange(
      sorted.map((c) =>
        c.id === id ? normalizePriorityCity({ ...c, ...patch }) : c,
      ),
    )
  }

  const removeCity = (id) => {
    onChange(
      sorted
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, sortOrder: i + 1 })),
    )
  }

  const moveCity = (id, direction) => {
    const idx = sorted.findIndex((c) => c.id === id)
    if (idx < 0) return
    const swap = direction === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= sorted.length) return
    const next = [...sorted]
    const a = { ...next[idx] }
    const b = { ...next[swap] }
    const aOrder = a.sortOrder
    a.sortOrder = b.sortOrder
    b.sortOrder = aOrder
    next[idx] = b
    next[swap] = a
    onChange(normalizePriorityCities(next))
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-xl border border-line bg-surface/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className={labelClass}>State / UT</label>
          <select
            className={inputClass}
            value={state}
            onChange={(e) => {
              setState(e.target.value)
              setSelectedCity('')
              setCitySearch('')
            }}
          >
            {INDIA_STATES_AND_UTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Search cities</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className={`${inputClass} pl-10`}
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Filter catalog…"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Select city</label>
          <select
            className={inputClass}
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value)
              setCustomCity('')
            }}
          >
            <option value="">Choose from catalog…</option>
            {catalogCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Or add custom city</label>
          <input
            className={inputClass}
            value={customCity}
            onChange={(e) => {
              setCustomCity(e.target.value)
              if (e.target.value) setSelectedCity('')
            }}
            placeholder="City name"
          />
        </div>
        <div>
          <label className={labelClass}>ETA (days)</label>
          <input
            className={inputClass}
            value={etaDays}
            onChange={(e) => setEtaDays(e.target.value)}
            placeholder="2–5"
          />
        </div>
        <div>
          <label className={labelClass}>Pincode prefix (optional)</label>
          <input
            className={inputClass}
            value={pincodePrefix}
            onChange={(e) => setPincodePrefix(e.target.value)}
            placeholder="e.g. 560"
          />
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-3">
          <button
            type="button"
            onClick={addCity}
            disabled={!selectedCity && !customCity.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add to Priority Cities
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          No priority cities yet. Select any Indian state/UT and add cities
          above.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {sorted.map((city, index) => (
            <li
              key={city.id}
              className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-ink">
                    {city.city}
                    <span className="ml-2 text-xs font-medium text-muted">
                      {city.state}
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    /locations/{city.slug} · ETA {city.etaDays}
                    {city.pincodePrefix ? ` · PIN ${city.pincodePrefix}` : ''}
                  </p>
                  <input
                    className="mt-2 w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-brand-300"
                    value={city.highlights || ''}
                    onChange={(e) =>
                      updateCity(city.id, { highlights: e.target.value })
                    }
                    placeholder="Storefront highlight text"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveCity(city.id, 'up')}
                  className="rounded-lg border border-line p-2 text-muted hover:bg-surface disabled:opacity-40"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={index === sorted.length - 1}
                  onClick={() => moveCity(city.id, 'down')}
                  className="rounded-lg border border-line p-2 text-muted hover:bg-surface disabled:opacity-40"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCity(city.id, { enabled: !city.enabled })
                  }
                  className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink hover:bg-surface"
                >
                  {city.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => removeCity(city.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-danger hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ShippingPage() {
  const shippingApi = useShippingService()
  const { shippingSettings: liveShipping, taxSettings: liveTax } = useAdminStore()
  const [shipping, setShipping] = useState(() => {
    const s = shippingApi.getShipping()
    return {
      ...s,
      priorityCities: normalizePriorityCities(s.priorityCities),
      serviceableStates:
        Array.isArray(s.serviceableStates) && s.serviceableStates.length
          ? s.serviceableStates
          : [...INDIA_STATES_AND_UTS],
    }
  })
  const [tax, setTax] = useState(() => shippingApi.getTax())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setShipping({
      ...liveShipping,
      priorityCities: normalizePriorityCities(liveShipping.priorityCities),
      serviceableStates:
        Array.isArray(liveShipping.serviceableStates) &&
        liveShipping.serviceableStates.length
          ? liveShipping.serviceableStates
          : [...INDIA_STATES_AND_UTS],
    })
    setTax({ ...liveTax })
  }, [liveShipping, liveTax])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const priorityCities = normalizePriorityCities(shipping.priorityCities)
      await shippingApi.saveShipping({
        ...shipping,
        freeShippingMinOrder: Number(shipping.freeShippingMinOrder) || 0,
        standardShippingFee: Number(shipping.standardShippingFee) || 0,
        expressShippingFee: Number(shipping.expressShippingFee) || 0,
        codFee: Number(shipping.codFee) || 0,
        codMaxOrderValue: Number(shipping.codMaxOrderValue) || 0,
        remoteAreaSurcharge: Number(shipping.remoteAreaSurcharge) || 0,
        priorityCities,
        serviceableStates:
          Array.isArray(shipping.serviceableStates) &&
          shipping.serviceableStates.length
            ? shipping.serviceableStates
            : [...INDIA_STATES_AND_UTS],
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

  const toggleServiceableState = (stateName) => {
    setShipping((s) => {
      const current = Array.isArray(s.serviceableStates)
        ? [...s.serviceableStates]
        : []
      const has = current.includes(stateName)
      return {
        ...s,
        serviceableStates: has
          ? current.filter((x) => x !== stateName)
          : [...current, stateName],
      }
    })
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Shipping & Tax"
        subtitle="Fees, COD, GST, and Priority Cities across all Indian states & UTs."
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

        <Section
          title="Priority Cities"
          description="Manage priority delivery cities from any Indian state or union territory. Enabled cities appear on the storefront delivery section and /locations pages."
        >
          <PriorityCitiesPanel
            cities={shipping.priorityCities || []}
            onChange={(priorityCities) =>
              setShipping((s) => ({ ...s, priorityCities }))
            }
          />
        </Section>

        <Section
          title="Serviceable states & UTs"
          description="Which states/UTs are treated as serviceable for shipping. Defaults to all of India."
        >
          <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-line bg-surface/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {INDIA_STATES_AND_UTS.map((st) => {
              const checked = (shipping.serviceableStates || []).includes(st)
              return (
                <label
                  key={st}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleServiceableState(st)}
                    className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
                  />
                  <span className="font-medium text-ink">{st}</span>
                </label>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() =>
              setShipping((s) => ({
                ...s,
                serviceableStates: [...INDIA_STATES_AND_UTS],
              }))
            }
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Select all states & UTs
          </button>
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
