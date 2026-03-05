'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/LoginForm'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted font-sans">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted font-sans">You don&apos;t have admin privileges.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
