import { useEffect, useRef, useState } from 'react'

/**
 * Mount children only when they are near the viewport.
 * rootMargin loads the next homepage sections before the user reaches them,
 * so the layout does not pop in late, and off-screen product images stay unloaded.
 */
export default function DeferUntilVisible({ children, rootMargin = '640px' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, visible])

  return <div ref={ref}>{visible ? children : null}</div>
}
