import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { sendSignInOtp, verifyOtp as verifyOtpApi } from '@src/api/auth'
import { getAccessToken, saveTokens, clearTokens } from '@src/lib/auth-storage'
import type { AuthUser } from '@src/types/auth'

type AuthContextValue = {
  isLoading: boolean
  isAuthenticated: boolean
  user: AuthUser | null
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    getAccessToken()
      .then((token) => {
        setIsAuthenticated(Boolean(token))
      })
      .finally(() => setIsLoading(false))
  }, [])

  const sendOtp = useCallback(async (email: string) => {
    await sendSignInOtp(email)
  }, [])

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const res = await verifyOtpApi(email, otp)
    await saveTokens(res.data.session.accessToken, res.data.session.refreshToken)
    setUser(res.data.user)
    setIsAuthenticated(true)
  }, [])

  const signOut = useCallback(async () => {
    await clearTokens()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      sendOtp,
      verifyOtp,
      signOut,
    }),
    [isLoading, isAuthenticated, user, sendOtp, verifyOtp, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
