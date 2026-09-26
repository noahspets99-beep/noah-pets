import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Package } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import EmptyState from '../../admin/components/EmptyState'
import Modal from '../../admin/components/Modal'
import ProductForm from '../../admin/components/ProductForm'
import { useAdminStore } from '../../context/AdminStore'

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { products, createProduct, updateProduct, deleteProduct } = useAdminStore()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const product = isEdit ? products.find((p) => p.id === id) : null

  if (isEdit && !product) {
    return (
      <EmptyState
        icon={Package}
        title="Product not found"
        description="This product may have been deleted or the link is incorrect."
        action={
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        }
      />
    )
  }

  const handleSubmit = async (data) => {
    if (isEdit) {
      await updateProduct(id, data)
    } else {
      await createProduct(data)
    }
    navigate('/admin/products')
  }

  const handleDelete = async () => {
    await deleteProduct(id)
    setDeleteOpen(false)
    navigate('/admin/products')
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={isEdit ? 'Edit Product' : 'Add Product'}
        subtitle={
          isEdit
            ? `Editing ${product.name}`
            : 'Create a new product for your catalog'
        }
        breadcrumbs={['Catalog', 'Products', isEdit ? 'Edit' : 'New']}
        actions={
          <Link
            to="/admin/products"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back
          </Link>
        }
      />

      <ProductForm
        mode={isEdit ? 'edit' : 'create'}
        formKey={isEdit ? id : 'new'}
        initialValues={isEdit ? product : undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/products')}
        onDelete={isEdit ? () => setDeleteOpen(true) : undefined}
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Product"
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white"
            >
              Delete Product
            </button>
          </div>
        }
      >
        <p className="break-words text-sm text-ink-soft">
          Are you sure you want to delete &ldquo;{product?.name}&rdquo;? This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
