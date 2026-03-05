'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { isAdmin } from '@/lib/admins'

type AuthState = {
  user: User | null
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, isAdmin: false, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAdmin: false, loading: true })

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminStatus = await isAdmin(user.uid)
        setState({ user, isAdmin: adminStatus, loading: false })
      } else {
        setState({ user: null, isAdmin: false, loading: false })
      }
    })
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
