import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isDevelopment = import.meta.env.DEV
    
    if (isDevelopment) {
      let mockUserId = sessionStorage.getItem('mockUserId')
      if (!mockUserId) {
        mockUserId = crypto.randomUUID()
        sessionStorage.setItem('mockUserId', mockUserId)
      }
      
      const mockUser = {
        id: mockUserId,
        email: `dev-user-${mockUserId.slice(0, 8)}@example.com`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated'
      } as User
      
      setUser(mockUser)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, signOut }
}
