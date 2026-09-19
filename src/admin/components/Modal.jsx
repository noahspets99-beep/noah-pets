import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

let scrollLockCount = 0
let previousBodyOverflow = ''

function lockBodyScroll() {
  if (typeof document === 'undefined') return
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockCount += 1
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow
  }
}

/**
 * Shared admin dialog: viewport-centered, sticky header/footer, scrollable body.
 * Portaled to document.body so Admin layout overflow cannot clip it.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
  closeOnBackdrop = true,
}) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    lockBodyScroll()
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.()
    }
    document.addEventListener('keydown', onKey)
    // Focus the dialog once when it opens. Do not depend on `onClose` —
    // inline handlers are new every parent render and would steal focus
    // from inputs after each keystroke.
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      const active = document.activeElement
      if (active && panel.contains(active) && active !== panel) return
      panel.focus()
    })
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      unlockBodyScroll()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  const widths = {
    sm: 'max-w-[min(28rem,100%)]',
    md: 'max-w-[min(32rem,100%)]',
    lg: 'max-w-[min(42rem,100%)]',
    xl: 'max-w-[min(56rem,100%)]',
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        aria-label="Close dialog"
        onClick={() => {
          if (closeOnBackdrop) onClose?.()
        }}
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className={`flex max-h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-fade-up outline-none ${widths[size] || widths.md}`}
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5 sm:py-4">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="truncate text-base font-bold text-ink sm:text-lg"
              >
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="mt-0.5 text-sm text-muted">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl p-2 text-muted transition hover:bg-surface hover:text-ink"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
            {children}
          </div>
          {footer ? (
            <footer className="shrink-0 border-t border-line bg-surface/60 px-4 py-3 sm:px-5 sm:py-4">
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
