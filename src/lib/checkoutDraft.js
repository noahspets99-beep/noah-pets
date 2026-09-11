const CHECKOUT_DRAFT_KEY = 'noah_checkout_draft_v1'

export function saveCheckoutDraft(form) {
  if (typeof sessionStorage === 'undefined' || !form) return
  try {
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(form))
  } catch {
    /* ignore quota */
  }
}

export function loadCheckoutDraft() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function clearCheckoutDraft() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(CHECKOUT_DRAFT_KEY)
  } catch {
    /* ignore */
  }
}
