import { useMemo, useState } from 'react'
import { Newspaper, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatusBadge from '../../admin/components/StatusBadge'
import Pagination from '../../admin/components/Pagination'
import EmptyState from '../../admin/components/EmptyState'
import Modal from '../../admin/components/Modal'
import { formatDate, paginate } from '../../admin/utils'
import { useBlogService } from '../../services/adminServices'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  category: 'Nutrition',
  tags: '',
  publishedAt: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  status: 'Draft',
  author: "Noah's Pets Care Team",
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function BlogAdminPage() {
  const blog = useBlogService()
  const posts = blog.list()
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return posts
    return posts.filter((p) => p.status === statusFilter)
  }, [posts, statusFilter])

  const { items, totalPages } = paginate(filtered, page, 8)

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...EMPTY_FORM,
      publishedAt: new Date().toISOString().slice(0, 10),
    })
    setFormOpen(true)
  }

  const openEdit = (post) => {
    setEditing(post)
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      featuredImage: post.featuredImage || '',
      category: post.category || 'Nutrition',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      publishedAt: post.publishedAt
        ? post.publishedAt.slice(0, 10)
        : '',
      seoTitle: post.seoTitle || post.seo?.title || '',
      seoDescription: post.seoDescription || post.seo?.description || '',
      seoKeywords: post.seoKeywords || post.seo?.keywords || '',
      status: post.status || 'Published',
      author: post.author || "Noah's Pets Care Team",
    })
    setFormOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim(),
      content: form.content,
      featuredImage: form.featuredImage.trim(),
      category: form.category.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      publishedAt: form.publishedAt
        ? new Date(form.publishedAt).toISOString()
        : new Date().toISOString(),
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
      seoKeywords: form.seoKeywords.trim(),
      status: form.status,
      author: form.author.trim(),
    }
    if (editing) {
      await blog.update(editing.id, payload)
    } else {
      await blog.create(payload)
    }
    setFormOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const confirmDelete = async () => {
    if (deleteTarget) {
      await blog.remove(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Blog"
        subtitle="Create and publish pet-care guides for the storefront."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            New post
          </button>
        }
      />

      <div className="flex gap-2">
        {['All', 'Published', 'Draft'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setStatusFilter(key)
              setPage(1)
            }}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              statusFilter === key
                ? 'bg-brand-500 text-white'
                : 'border border-line bg-white text-ink-soft hover:bg-surface'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No blog posts"
          description="Create your first guide for Tamil Nadu pet parents."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
              New post
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((post) => (
                  <tr key={post.id} className="hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{post.title}</p>
                      <p className="text-xs text-muted">/{post.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{post.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status || 'Published'} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {post.publishedAt ? formatDate(post.publishedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(post)}
                          className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-surface"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(post)}
                          className="rounded-lg border border-danger/30 p-1.5 text-danger hover:bg-red-50"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line px-4 py-3">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit blog post' : 'New blog post'}
        description={
          editing
            ? 'Update this post'
            : 'Create a new blog post'
        }
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="blog-form"
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
            >
              {editing ? 'Save changes' : 'Create post'}
            </button>
          </div>
        }
      >
        <form id="blog-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">Title</label>
              <input
                required
                className={inputClass}
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: editing ? f.slug : slugify(title),
                  }))
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Slug</label>
              <input
                required
                className={inputClass}
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Category
              </label>
              <input
                className={inputClass}
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Excerpt
              </label>
              <textarea
                rows={2}
                className={`${inputClass} resize-y`}
                value={form.excerpt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Content (HTML OK)
              </label>
              <textarea
                rows={6}
                className={`${inputClass} resize-y font-mono text-xs`}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Featured image URL
              </label>
              <input
                className={inputClass}
                value={form.featuredImage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featuredImage: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Tags (comma-separated)
              </label>
              <input
                className={inputClass}
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Published date
              </label>
              <input
                type="date"
                className={inputClass}
                value={form.publishedAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, publishedAt: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Status</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Author</label>
              <input
                className={inputClass}
                value={form.author}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2 border-t border-line pt-4">
              <p className="mb-3 text-sm font-bold text-ink">SEO</p>
              <div className="space-y-3">
                <input
                  className={inputClass}
                  placeholder="SEO title"
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoTitle: e.target.value }))
                  }
                />
                <textarea
                  rows={2}
                  className={`${inputClass} resize-y`}
                  placeholder="SEO description"
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoDescription: e.target.value }))
                  }
                />
                <input
                  className={inputClass}
                  placeholder="SEO keywords"
                  value={form.seoKeywords}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoKeywords: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete blog post?"
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-xl bg-danger px-4 py-2.5 text-sm font-bold text-white"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          Delete &ldquo;{deleteTarget?.title}&rdquo; permanently from the admin
          blog list.
        </p>
      </Modal>
    </div>
  )
}
