import { useEffect, useMemo, useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, Upload, X } from 'lucide-react'
import { useAdminStore } from '../../context/AdminStore'
import { slugify } from '../utils'
import { uploadProductImage } from '../../services/storageUpload'
import {
  EMPTY_PRODUCT,
  EMPTY_VARIANT,
  PET_TYPES,
  PRODUCT_STATUSES,
} from '../productConstants'

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'

const inputErrorClass =
  'w-full rounded-xl border border-danger/40 bg-red-50 px-4 py-2.5 text-sm outline-none transition focus:border-danger focus:bg-white focus:ring-4 focus:ring-red-100'

const labelClass = 'mb-1.5 block text-sm font-semibold text-ink'

function computeDiscount(price, mrp) {
  const p = Number(price)
  const m = Number(mrp)
  if (!p || !m || m <= 0 || p >= m) return 0
  return Math.round(((m - p) / m) * 100)
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-ink sm:text-lg">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, htmlFor, children, className = '', error, hint }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}

function buildFormState(initialValues) {
  return {
    ...EMPTY_PRODUCT,
    ...initialValues,
    images:
      initialValues?.images?.length > 0
        ? [...initialValues.images]
        : [''],
    variants: Array.isArray(initialValues?.variants)
      ? initialValues.variants.map((v) => ({ ...EMPTY_VARIANT, ...v }))
      : [],
  }
}

function CollapsibleSection({ title, description, children, defaultOpen = false }) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-line bg-white shadow-card"
    >
      <summary className="cursor-pointer list-none px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink sm:text-lg">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted">{description}</p>
            )}
          </div>
          <span className="text-xs font-semibold text-brand-600 group-open:hidden">
            Expand
          </span>
          <span className="hidden text-xs font-semibold text-muted group-open:inline">
            Collapse
          </span>
        </div>
      </summary>
      <div className="space-y-4 border-t border-line px-4 py-4 sm:px-6 sm:pb-6">
        {children}
      </div>
    </details>
  )
}

export default function ProductForm({
  initialValues,
  mode = 'create',
  onSubmit,
  onCancel,
  onDelete,
  formKey = 'create',
}) {
  const { categories } = useAdminStore()
  const [form, setForm] = useState(() => buildFormState(initialValues))
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [uploadingIndex, setUploadingIndex] = useState(null)
  const [slugTouched, setSlugTouched] = useState(
    () => Boolean(initialValues?.slug),
  )
  const fileInputRefs = useRef({})

  useEffect(() => {
    setForm(buildFormState(initialValues))
    setErrors({})
    setFormError('')
    setSlugTouched(Boolean(initialValues?.slug))
    // Rebind when navigating between create/edit routes (formKey), not on every parent render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey])

  const discount = useMemo(
    () => computeDiscount(form.price, form.mrp),
    [form.price, form.mrp],
  )

  const categoryOptions = useMemo(() => {
    const names = [...new Set(categories.map((c) => c.name))]
    if (form.category && !names.includes(form.category)) {
      names.unshift(form.category)
    }
    return names.sort()
  }, [categories, form.category])

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const setName = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }))
    setErrors((prev) => {
      if (!prev.name && !prev.slug) return prev
      const next = { ...prev }
      delete next.name
      if (!slugTouched) delete next.slug
      return next
    })
  }

  const updateImage = (index, value) => {
    setForm((prev) => {
      const images = [...prev.images]
      images[index] = value
      return { ...prev, images }
    })
  }

  const addImage = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }

  const removeImage = (index) => {
    setForm((prev) => {
      const images = prev.images.filter((_, i) => i !== index)
      return { ...prev, images: images.length ? images : [''] }
    })
  }

  const handleFileUpload = async (index, file) => {
    if (!file) return
    setUploadingIndex(index)
    setFormError('')
    try {
      const productId = initialValues?.id || 'new'
      const url = await uploadProductImage(file, productId)
      updateImage(index, url)
    } catch (err) {
      setFormError(err?.message || 'Image upload failed')
    } finally {
      setUploadingIndex(null)
    }
  }

  const updateVariant = (index, key, value) => {
    setForm((prev) => {
      const variants = [...(prev.variants || [])]
      variants[index] = { ...variants[index], [key]: value }
      return { ...prev, variants }
    })
  }

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { ...EMPTY_VARIANT }],
    }))
  }

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }))
  }

  const validate = (payload) => {
    const next = {}
    if (!payload.name?.trim()) next.name = 'Product name is required'
    if (!payload.sku?.trim()) next.sku = 'SKU is required'
    if (!payload.slug?.trim()) next.slug = 'URL slug is required'
    if (!payload.petType) next.petType = 'Select a pet type'
    if (!payload.category?.trim()) next.category = 'Category is required'
    if (!(Number(payload.price) > 0)) next.price = 'Enter a valid selling price'
    if (Number(payload.mrp) > 0 && Number(payload.mrp) < Number(payload.price)) {
      next.mrp = 'MRP should be greater than or equal to price'
    }
    if (Number.isNaN(Number(payload.stock)) || Number(payload.stock) < 0) {
      next.stock = 'Stock must be 0 or more'
    }
    const hasImage = (payload.images || []).some((u) => String(u).trim())
    if (!hasImage) next.images = 'Add at least one product image'
    return next
  }

  const buildPayload = (statusOverride) => {
    const images = form.images.map((u) => u.trim()).filter(Boolean)
    const price = Number(form.price) || 0
    const mrp = Number(form.mrp) || 0
    const stock = Number(form.stock) || 0
    let status = statusOverride ?? form.status
    if (status === 'Active' && stock === 0) {
      status = 'Out of Stock'
    }

    const variants = (form.variants || [])
      .filter((v) => v.label || v.sku)
      .map((v) => ({
        ...v,
        id: v.id || `v-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        price: Number(v.price) || 0,
        mrp: Number(v.mrp) || 0,
        stock: Number(v.stock) || 0,
      }))

    return {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      slug: form.slug.trim() || slugify(form.name),
      price,
      mrp,
      stock,
      tax: Number(form.tax) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 0,
      minOrderQty: Number(form.minOrderQty) || 1,
      discount: computeDiscount(price, mrp),
      images: images.length ? images : [],
      status,
      active: status === 'Active' || status === 'Out of Stock',
      shippingWeight: String(form.shippingWeight || ''),
      variants,
    }
  }

  const handleSubmit = async (statusOverride) => {
    if (submitting || uploadingIndex !== null) return
    setFormError('')
    const payload = buildPayload(statusOverride)
    const nextErrors = validate(payload)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setFormError('Please fix the highlighted fields before saving.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      setFormError(err?.message || 'Could not save product. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="animate-fade-up space-y-6"
    >
      <Section title="Basic Info" description="Name, SKU, and descriptions">
        {formError && (
          <div className="rounded-xl border border-danger/30 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
            {formError}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Product Name *"
            htmlFor="pf-name"
            className="sm:col-span-2"
            error={errors.name}
          >
            <input
              id="pf-name"
              required
              value={form.name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? inputErrorClass : inputClass}
              placeholder="Premium Adult Dog Food"
            />
          </Field>
          <Field label="SKU *" htmlFor="pf-sku" error={errors.sku}>
            <input
              id="pf-sku"
              required
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              className={errors.sku ? inputErrorClass : inputClass}
              placeholder="DOG-FOOD-001"
            />
          </Field>
          <Field label="Barcode" htmlFor="pf-barcode">
            <input
              id="pf-barcode"
              value={form.barcode}
              onChange={(e) => set('barcode', e.target.value)}
              className={inputClass}
              placeholder="8901001001001"
            />
          </Field>
          <Field label="Brand" htmlFor="pf-brand">
            <input
              id="pf-brand"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              className={inputClass}
              placeholder="PawNutrition"
            />
          </Field>
          <Field label="Short Description" htmlFor="pf-short" className="sm:col-span-2">
            <input
              id="pf-short"
              value={form.shortDescription}
              onChange={(e) => set('shortDescription', e.target.value)}
              className={inputClass}
              placeholder="Brief tagline for listings"
            />
          </Field>
          <Field label="Description" htmlFor="pf-desc" className="sm:col-span-2">
            <textarea
              id="pf-desc"
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={`${inputClass} resize-y`}
              placeholder="Full product description..."
            />
          </Field>
        </div>
      </Section>

      <Section title="Classification" description="Pet type and category">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pet Type *" htmlFor="pf-pet" error={errors.petType}>
            <select
              id="pf-pet"
              value={form.petType}
              onChange={(e) => set('petType', e.target.value)}
              className={errors.petType ? inputErrorClass : inputClass}
            >
              {PET_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category *" htmlFor="pf-category" error={errors.category}>
            <select
              id="pf-category"
              required
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={errors.category ? inputErrorClass : inputClass}
            >
              <option value="">Select category</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory" htmlFor="pf-sub">
            <input
              id="pf-sub"
              value={form.subcategory}
              onChange={(e) => set('subcategory', e.target.value)}
              className={inputClass}
              placeholder="Dry Food, Toys, etc."
            />
          </Field>
        </div>
      </Section>

      <Section title="Pricing" description="Price, MRP, tax, and discount">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Selling Price (₹) *" htmlFor="pf-price" error={errors.price}>
            <input
              id="pf-price"
              type="number"
              min="0"
              required
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              className={errors.price ? inputErrorClass : inputClass}
            />
          </Field>
          <Field label="MRP (₹)" htmlFor="pf-mrp" error={errors.mrp}>
            <input
              id="pf-mrp"
              type="number"
              min="0"
              value={form.mrp}
              onChange={(e) => set('mrp', e.target.value)}
              className={errors.mrp ? inputErrorClass : inputClass}
            />
          </Field>
          <Field label="Discount" htmlFor="pf-discount">
            <div
              id="pf-discount"
              className="flex h-[42px] items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-brand-700"
            >
              {discount > 0 ? `${discount}% off` : '—'}
            </div>
          </Field>
          <Field label="Tax (%)" htmlFor="pf-tax">
            <input
              id="pf-tax"
              type="number"
              min="0"
              value={form.tax}
              onChange={(e) => set('tax', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Inventory" description="Stock levels and thresholds">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stock Quantity *" htmlFor="pf-stock" error={errors.stock}>
            <input
              id="pf-stock"
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
              className={errors.stock ? inputErrorClass : inputClass}
            />
          </Field>
          <Field label="Low Stock Threshold" htmlFor="pf-low">
            <input
              id="pf-low"
              type="number"
              min="0"
              value={form.lowStockThreshold}
              onChange={(e) => set('lowStockThreshold', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Images"
        description="Upload to Firebase Storage or paste a public HTTPS URL"
      >
        {errors.images && (
          <p className="text-xs font-medium text-danger">{errors.images}</p>
        )}
        <div className="space-y-4">
          {form.images.map((url, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface/50 p-3 sm:flex-row sm:items-start"
            >
              {url.trim() ? (
                <img
                  src={url.trim()}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-xl border border-line object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/80x80?text=Error'
                  }}
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-white text-muted">
                  <ImagePlus className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  value={url}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className={inputClass}
                  placeholder="https://… (public image URL)"
                />
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[index] = el
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      handleFileUpload(index, file)
                      e.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingIndex !== null}
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface disabled:opacity-60"
                  >
                    {uploadingIndex === index ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        Upload file
                      </>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="self-start rounded-xl border border-line p-2 text-muted transition hover:border-danger/30 hover:bg-red-50 hover:text-danger"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <ImagePlus className="h-4 w-4" />
            Add another image
          </button>
        </div>
      </Section>

      <Section title="Details" description="Physical attributes and ingredients">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['weight', 'Weight', '10kg'],
            ['size', 'Size', 'Large'],
            ['flavor', 'Flavor', 'Chicken & Rice'],
            ['ageGroup', 'Age Group', 'Adult'],
            ['material', 'Material', 'Cotton rope'],
          ].map(([key, label, placeholder]) => (
            <Field key={key} label={label} htmlFor={`pf-${key}`}>
              <input
                id={`pf-${key}`}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className={inputClass}
                placeholder={placeholder}
              />
            </Field>
          ))}
          <Field label="Ingredients" htmlFor="pf-ingredients" className="sm:col-span-2 lg:col-span-3">
            <textarea
              id="pf-ingredients"
              rows={2}
              value={form.ingredients}
              onChange={(e) => set('ingredients', e.target.value)}
              className={`${inputClass} resize-y`}
              placeholder="Chicken, rice, vitamins..."
            />
          </Field>
        </div>
      </Section>

      <Section title="Shipping" description="Weight, dimensions, and delivery">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Shipping Weight (kg)" htmlFor="pf-ship-w">
            <input
              id="pf-ship-w"
              value={form.shippingWeight}
              onChange={(e) => set('shippingWeight', e.target.value)}
              className={inputClass}
              placeholder="10.5"
            />
          </Field>
          <Field label="Dimensions (L×W×H cm)" htmlFor="pf-dim">
            <input
              id="pf-dim"
              value={form.dimensions}
              onChange={(e) => set('dimensions', e.target.value)}
              className={inputClass}
              placeholder="40x25x10"
            />
          </Field>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.deliveryAvailable}
              onChange={(e) => set('deliveryAvailable', e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
            />
            <span className="text-sm font-semibold text-ink">Delivery available</span>
          </label>
        </div>
      </Section>

      <Section title="Status" description="Visibility and merchandising flags">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor="pf-status">
            <select
              id="pf-status"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className={inputClass}
            >
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
              />
              <span className="text-sm font-semibold text-ink">Featured product</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.bestseller}
                onChange={(e) => set('bestseller', e.target.checked)}
                className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
              />
              <span className="text-sm font-semibold text-ink">Bestseller</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!form.newArrival}
                onChange={(e) => set('newArrival', e.target.checked)}
                className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-200"
              />
              <span className="text-sm font-semibold text-ink">New arrival</span>
            </label>
          </div>
        </div>
      </Section>

      <CollapsibleSection
        title="Variants"
        description="Optional size/weight variants with their own SKU and stock"
      >
        <div className="space-y-3">
          {(form.variants || []).map((variant, index) => (
            <div
              key={variant.id || index}
              className="grid gap-3 rounded-xl border border-line bg-surface/40 p-3 sm:grid-cols-6"
            >
              {[
                ['label', 'Label', '10kg'],
                ['sku', 'SKU', 'SKU-10KG'],
                ['price', 'Price', '2499'],
                ['mrp', 'MRP', '3299'],
                ['stock', 'Stock', '50'],
              ].map(([key, label, placeholder]) => (
                <Field key={key} label={label} htmlFor={`pf-v-${index}-${key}`}>
                  <input
                    id={`pf-v-${index}-${key}`}
                    type={
                      key === 'price' || key === 'mrp' || key === 'stock'
                        ? 'number'
                        : 'text'
                    }
                    min={
                      key === 'price' || key === 'mrp' || key === 'stock'
                        ? '0'
                        : undefined
                    }
                    value={variant[key] ?? ''}
                    onChange={(e) =>
                      updateVariant(index, key, e.target.value)
                    }
                    className={inputClass}
                    placeholder={placeholder}
                  />
                </Field>
              ))}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="rounded-xl border border-danger/30 p-2.5 text-danger hover:bg-red-50"
                  aria-label="Remove variant"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Add variant
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="SEO"
        description="Search and social meta fields for this product"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="URL slug *"
            htmlFor="pf-slug"
            className="sm:col-span-2"
            error={errors.slug}
            hint="Used in /product/… links. Auto-filled from the product name."
          >
            <input
              id="pf-slug"
              value={form.slug || ''}
              onChange={(e) => {
                setSlugTouched(true)
                set('slug', e.target.value)
              }}
              className={errors.slug ? inputErrorClass : inputClass}
              placeholder="premium-adult-dog-food"
            />
          </Field>
          <Field label="SEO title" htmlFor="pf-seo-title" className="sm:col-span-2">
            <input
              id="pf-seo-title"
              value={form.seoTitle || ''}
              onChange={(e) => set('seoTitle', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="SEO description"
            htmlFor="pf-seo-desc"
            className="sm:col-span-2"
          >
            <textarea
              id="pf-seo-desc"
              rows={2}
              value={form.seoDescription || ''}
              onChange={(e) => set('seoDescription', e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>
          <Field label="SEO keywords" htmlFor="pf-seo-kw" className="sm:col-span-2">
            <input
              id="pf-seo-kw"
              value={form.seoKeywords || ''}
              onChange={(e) => set('seoKeywords', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Canonical URL" htmlFor="pf-canonical">
            <input
              id="pf-canonical"
              value={form.canonicalUrl || ''}
              onChange={(e) => set('canonicalUrl', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Social image URL" htmlFor="pf-social-img">
            <input
              id="pf-social-img"
              value={form.socialImage || ''}
              onChange={(e) => set('socialImage', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="OG title" htmlFor="pf-og-title">
            <input
              id="pf-og-title"
              value={form.ogTitle || ''}
              onChange={(e) => set('ogTitle', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="OG description" htmlFor="pf-og-desc">
            <input
              id="pf-og-desc"
              value={form.ogDescription || ''}
              onChange={(e) => set('ogDescription', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </CollapsibleSection>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {mode === 'edit' && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-red-100 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface disabled:opacity-60"
            >
              Cancel
            </button>
          )}
          {mode === 'create' ? (
            <>
              <button
                type="button"
                disabled={submitting || uploadingIndex !== null}
                onClick={() => handleSubmit('Draft')}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                disabled={submitting || uploadingIndex !== null}
                onClick={() => handleSubmit('Active')}
                className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
              >
                {submitting ? 'Publishing...' : 'Publish Product'}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={submitting || uploadingIndex !== null}
              onClick={() => handleSubmit()}
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
