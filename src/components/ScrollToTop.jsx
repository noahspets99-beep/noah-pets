import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Reset window scroll to the top on every route change.
 * Does not affect overflow containers (modals, carousels, drawers).
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search])

  return null
}
