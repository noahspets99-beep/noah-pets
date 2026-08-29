import { useEffect } from 'react'
import { CheckCircle2, Info, X } from 'lucide-react'
import { useShop } from '../context/useShop'

export default function Toast() {
  const { toast, dismissToast } = useShop()

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(dismissToast, 2800)
    return () => clearTimeout(timer)
  }, [toast, dismissToast])

  if (!toast) return null

  const Icon = toast.type === 'info' ? Info : CheckCircle2

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-[80] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-lift animate-toast sm:left-auto sm:right-6 sm:bottom-6"
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${
          toast.type === 'info' ? 'text-brand-500' : 'text-success'
        }`}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm font-medium text-ink">{toast.message}</p>
      <button
        type="button"
        onClick={dismissToast}
        className="rounded-lg p-1 text-muted transition hover:bg-surface hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
