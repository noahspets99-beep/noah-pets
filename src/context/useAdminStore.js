import { useContext } from 'react'
import { AdminStoreContext } from './admin-store-context'

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext)
  if (!ctx) {
    throw new Error('useAdminStore must be used within AdminStoreProvider')
  }
  return ctx
}
