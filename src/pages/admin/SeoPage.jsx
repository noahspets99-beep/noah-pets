import { useState } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import { useSeoService } from '../../services/adminServices'

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

export default function SeoPage() {
  const seo = useSeoService()
  const [form, setForm] = useState(() => seo.get())
  const [saving, setSaving] = useState(false)

  const setNested = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let cur = next
      for (let i = 0; i < keys.length - 1; i += 1) cur = cur[keys[i]]
      cur[keys[keys.length - 1]] = value
      return next
    })
  }

  const updateLocation = (index, field, value) => {
    setForm((prev) => {
      const locationSeo = prev.locationSeo.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      )
      return { ...prev, locationSeo }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await seo.save(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="SEO"
        subtitle="Homepage meta, defaults, analytics, and Tamil Nadu location SEO."
        actions={
          <button
            type="submit"
            form="seo-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            <Search className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save SEO settings'}
          </button>
        }
      />

      <form id="seo-form" onSubmit={handleSave} className="space-y-6">
        <Section title="Homepage SEO" description="Title, description, and keywords for the shop home">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input
                className={inputClass}
                value={form.homepage?.title || ''}
                onChange={(e) => setNested('homepage.title', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                className={`${inputClass} resize-y`}
                value={form.homepage?.description || ''}
                onChange={(e) =>
                  setNested('homepage.description', e.target.value)
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Keywords</label>
              <input
                className={inputClass}
                value={form.homepage?.keywords || ''}
                onChange={(e) => setNested('homepage.keywords', e.target.value)}
              />
            </div>
          </div>
        </Section>

        <Section title="Defaults" description="Fallback title template and site-wide defaults">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title template</label>
              <input
                className={inputClass}
                value={form.defaults?.titleTemplate || ''}
                onChange={(e) =>
                  setNested('defaults.titleTemplate', e.target.value)
                }
              />
            </div>
            <div>
              <label className={labelClass}>Default title</label>
              <input
                className={inputClass}
                value={form.defaults?.defaultTitle || ''}
                onChange={(e) =>
                  setNested('defaults.defaultTitle', e.target.value)
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Default description</label>
              <textarea
                rows={2}
                className={`${inputClass} resize-y`}
                value={form.defaults?.defaultDescription || ''}
                onChange={(e) =>
                  setNested('defaults.defaultDescription', e.target.value)
                }
              />
            </div>
          </div>
        </Section>

        <Section title="Verification & Analytics">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Google site verification</label>
              <input
                className={inputClass}
                placeholder="content value from meta tag"
                value={form.googleVerification || ''}
                onChange={(e) =>
                  setNested('googleVerification', e.target.value)
                }
              />
            </div>
            <div>
              <label className={labelClass}>Analytics ID (GA4)</label>
              <input
                className={inputClass}
                placeholder="G-XXXXXXXXXX"
                value={form.analyticsId || ''}
                onChange={(e) => setNested('analyticsId', e.target.value)}
              />
            </div>
          </div>
        </Section>

        <Section title="Sitemap & robots" description="Operational notes for production SEO">
          <div>
            <label className={labelClass}>Sitemap notes</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-y`}
              value={form.sitemapNotes || ''}
              onChange={(e) => setNested('sitemapNotes', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Robots notes</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-y`}
              value={form.robotsNotes || ''}
              onChange={(e) => setNested('robotsNotes', e.target.value)}
            />
          </div>
        </Section>

        <Section title="Social sharing defaults" description="Open Graph / Twitter defaults">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>OG title</label>
              <input
                className={inputClass}
                value={form.social?.ogTitle || ''}
                onChange={(e) => setNested('social.ogTitle', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>OG description</label>
              <textarea
                rows={2}
                className={`${inputClass} resize-y`}
                value={form.social?.ogDescription || ''}
                onChange={(e) =>
                  setNested('social.ogDescription', e.target.value)
                }
              />
            </div>
            <div>
              <label className={labelClass}>OG image URL</label>
              <input
                className={inputClass}
                value={form.social?.ogImage || ''}
                onChange={(e) => setNested('social.ogImage', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Twitter card</label>
              <input
                className={inputClass}
                value={form.social?.twitterCard || ''}
                onChange={(e) =>
                  setNested('social.twitterCard', e.target.value)
                }
              />
            </div>
          </div>
        </Section>

        <Section
          title="Location SEO (Tamil Nadu)"
          description="Titles and descriptions for priority city landing pages"
        >
          <div className="space-y-4">
            {(form.locationSeo || []).map((row, index) => (
              <div
                key={row.slug}
                className="rounded-xl border border-line bg-surface/40 p-4"
              >
                <p className="mb-3 text-sm font-bold text-ink">{row.name}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>SEO title</label>
                    <input
                      className={inputClass}
                      value={row.title || ''}
                      onChange={(e) =>
                        updateLocation(index, 'title', e.target.value)
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>SEO description</label>
                    <textarea
                      rows={2}
                      className={`${inputClass} resize-y`}
                      value={row.description || ''}
                      onChange={(e) =>
                        updateLocation(index, 'description', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </form>
    </div>
  )
}
