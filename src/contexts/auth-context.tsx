import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  sendSignInOtp,
  signInWithGoogle as signInWithGoogleApi,
  signInWithGoogleAuthCode as signInWithGoogleAuthCodeApi,
  verifyOtp as verifyOtpApi,
} from '@src/api/auth'
import {
  clearTokens,
  getAccessToken,
  getAuthUser,
  saveAuthSession,
} from '@src/lib/auth-storage'
import { clearNativeGoogleSignInSession } from '@src/lib/google-native-session'
import { emailFromAccessToken } from '@src/lib/jwt-email'
import type { AuthSession, AuthUser } from '@src/types/auth'

type AuthContextValue = {
  isLoading: boolean
  isAuthenticated: boolean
  user: AuthUser | null
  googleAuthInProgress: boolean
  setGoogleAuthInProgress: (value: boolean) => void
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
  signInWithGoogle: (idToken: string) => Promise<void>
  signInWithGoogleAuthCode: (input: {
    code: string
    redirectUri: string
    codeVerifier: string
  }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function applyAuthSession(
  data: { user: AuthUser; session: AuthSession },
  setUser: (user: AuthUser) => void,
  setIsAuthenticated: (value: boolean) => void
) {
  await saveAuthSession(data.session, data.user)
  setUser(data.user)
  setIsAuthenticated(true)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [googleAuthInProgress, setGoogleAuthInProgress] = useState(false)

  useEffect(() => {
    Promise.all([getAccessToken(), getAuthUser()])
      .then(([token, savedUser]) => {
        setIsAuthenticated(Boolean(token))
        if (savedUser) {
          setUser(savedUser)
        } else if (token) {
          const email = emailFromAccessToken(token)
          if (email) {
            setUser({ id: '', email, createdAt: '', isNewUser: false })
          }
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const sendOtp = useCallback(async (email: string) => {
    await sendSignInOtp(email)
  }, [])

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const res = await verifyOtpApi(email, otp)
    await applyAuthSession(res.data, setUser, setIsAuthenticated)
  }, [])

  const signInWithGoogle = useCallback(async (idToken: string) => {
    const res = await signInWithGoogleApi(idToken)
    await applyAuthSession(res.data, setUser, setIsAuthenticated)
  }, [])

  const signInWithGoogleAuthCode = useCallback(
    async (input: { code: string; redirectUri: string; codeVerifier: string }) => {
      const res = await signInWithGoogleAuthCodeApi(input)
      await applyAuthSession(res.data, setUser, setIsAuthenticated)
    },
    []
  )

  const signOut = useCallback(async () => {
    setGoogleAuthInProgress(false)
    await clearNativeGoogleSignInSession()
    await clearTokens()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      googleAuthInProgress,
      setGoogleAuthInProgress,
      sendOtp,
      verifyOtp,
      signInWithGoogle,
      signInWithGoogleAuthCode,
      signOut,
    }),
    [
      isLoading,
      isAuthenticated,
      user,
      googleAuthInProgress,
      sendOtp,
      verifyOtp,
      signInWithGoogle,
      signInWithGoogleAuthCode,
      signOut,
    ]
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
