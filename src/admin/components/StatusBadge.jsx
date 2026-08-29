const styles = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  Draft: 'bg-amber-50 text-amber-700 ring-amber-100',
  'Out of Stock': 'bg-red-50 text-red-700 ring-red-100',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  Confirmed: 'bg-sky-50 text-sky-700 ring-sky-100',
  Processing: 'bg-blue-50 text-blue-700 ring-blue-100',
  Shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  'Out for Delivery': 'bg-violet-50 text-violet-700 ring-violet-100',
  Delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  Returned: 'bg-orange-50 text-orange-700 ring-orange-100',
  Refunded: 'bg-rose-50 text-rose-700 ring-rose-100',
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Captured: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Published: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Enabled: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Disabled: 'bg-slate-100 text-slate-600 ring-slate-200',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Hidden: 'bg-slate-100 text-slate-600 ring-slate-200',
  Expired: 'bg-red-50 text-red-700 ring-red-100',
  Scheduled: 'bg-sky-50 text-sky-700 ring-sky-100',
  Featured: 'bg-brand-50 text-brand-700 ring-brand-100',
  'Low Stock': 'bg-amber-50 text-amber-700 ring-amber-100',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        styles[status] || 'bg-surface text-ink-soft ring-line'
      }`}
    >
      {status}
    </span>
  )
}
