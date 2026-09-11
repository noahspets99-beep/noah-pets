import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { isAdminUser } from '../config/admin'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import {
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from '../services/customerAuth'
import { AuthContext } from './auth-context'

const firebaseReady = Boolean(isFirebaseConfigured && auth)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(!firebaseReady)

  useEffect(() => {
    if (!firebaseReady) {
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthReady(true)
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user),
      isAdmin: isAdminUser(user),
      isFirebaseConfigured,
      signUp: signUpWithEmail,
      signIn: signInWithEmail,
      signInWithGoogle,
      signOut: signOutUser,
    }),
    [user, authReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
