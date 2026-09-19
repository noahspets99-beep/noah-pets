import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

/**
 * Viewport-aware admin ⋮ menu. Portaled so table overflow cannot clip it.
 */
export default function ActionMenu({ children, label = 'Actions' }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const menuRef = useRef(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const place = () => {
    const btn = btnRef.current
    const menu = menuRef.current
    if (!btn || !menu) return
    const r = btn.getBoundingClientRect()
    const mw = menu.offsetWidth || 168
    const mh = menu.offsetHeight || 180
    const pad = 8
    let top = r.bottom + 4
    if (top + mh > window.innerHeight - pad) {
      top = r.top - mh - 4
    }
    if (top < pad) top = pad
    let left = r.right - mw
    if (left + mw > window.innerWidth - pad) {
      left = window.innerWidth - mw - pad
    }
    if (left < pad) left = pad
    setCoords({ top, left })
  }

  useLayoutEffect(() => {
    if (!open) return undefined
    place()
    return undefined
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => {
      if (
        btnRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return
      }
      setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  return (
    <div className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl border border-line p-2 text-muted transition hover:bg-surface hover:text-ink"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-[80] min-w-[160px] rounded-xl border border-line bg-white py-1 shadow-lift"
          >
            {typeof children === 'function'
              ? children(() => setOpen(false))
              : children}
          </div>,
          document.body,
        )}
    </div>
  )
}
