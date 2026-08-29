import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useAdminStore } from '../../context/AdminStore'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-accent',
  info: 'text-brand-500',
}

export default function AdminToastStack() {
  const { toasts, dismissToast } = useAdminStore()

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-lift animate-toast"
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${colors[toast.type]}`} />
            <p className="flex-1 text-sm font-medium text-ink">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-lg p-1 text-muted hover:bg-surface"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
