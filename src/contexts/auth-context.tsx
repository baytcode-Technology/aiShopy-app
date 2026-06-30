import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AppState } from 'react-native'
import { router, type Href } from 'expo-router'
import {
  sendSignInOtp,
  signInWithGoogle as signInWithGoogleApi,
  signInWithGoogleAuthCode as signInWithGoogleAuthCodeApi,
  verifyOtp as verifyOtpApi,
} from '@src/api/auth'
import { setOnSessionExpired } from '@src/api/client'
import {
  clearTokens,
  getAccessToken,
  getAuthUser,
  getRefreshToken,
  saveAuthSession,
} from '@src/lib/auth-storage'
import { clearNativeGoogleSignInSession } from '@src/lib/google-native-session'
import { emailFromAccessToken } from '@src/lib/jwt-email'
import {
  ensureValidSession,
  isAccessTokenExpired,
  SessionExpiredError,
} from '@src/lib/session-manager'
import type { AuthSession, AuthUser } from '@src/types/auth'

const FOREGROUND_RESUME_DEBOUNCE_MS = 600

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

async function restoreUserFromStorage(): Promise<AuthUser | null> {
  const savedUser = await getAuthUser()
  if (savedUser) return savedUser

  const token = await getAccessToken()
  if (!token) return null

  const email = emailFromAccessToken(token)
  if (!email) return null

  return { id: '', email, createdAt: '', isNewUser: false }
}

async function applyAuthSession(
  data: { user: AuthUser; session: AuthSession },
  setUser: (user: AuthUser) => void,
  setIsAuthenticated: (value: boolean) => void
) {
  await saveAuthSession(data.session, data.user)
  setUser(data.user)
  setIsAuthenticated(true)
}

async function tryRestoreAuthenticatedSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) {
    return false
  }

  try {
    await ensureValidSession()
    return true
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return false
    }
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return false
    }
    const expired = await isAccessTokenExpired(0)
    return !expired
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [googleAuthInProgress, setGoogleAuthInProgress] = useState(false)

  const signOut = useCallback(async () => {
    setGoogleAuthInProgress(false)
    await clearNativeGoogleSignInSession()
    await clearTokens()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const ok = await tryRestoreAuthenticatedSession()
        if (!ok) {
          await clearTokens()
          setIsAuthenticated(false)
          return
        }

        const restoredUser = await restoreUserFromStorage()
        if (restoredUser) {
          setUser(restoredUser)
        }
        setIsAuthenticated(true)
      } catch {
        await clearTokens()
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    setOnSessionExpired(() => {
      void (async () => {
        await signOut()
        router.replace('/(auth)/login' as Href)
      })()
    })
    return () => setOnSessionExpired(null)
  }, [signOut])

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return

      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      debounceTimer = setTimeout(() => {
        void (async () => {
          try {
            const refreshToken = await getRefreshToken()
            if (!refreshToken) return

            const ok = await tryRestoreAuthenticatedSession()
            if (!ok) {
              await signOut()
              router.replace('/(auth)/login' as Href)
              return
            }

            const restoredUser = await restoreUserFromStorage()
            if (restoredUser) {
              setUser(restoredUser)
            }
            setIsAuthenticated(true)
          } catch (error) {
            if (error instanceof SessionExpiredError) {
              await signOut()
              router.replace('/(auth)/login' as Href)
            } else if (__DEV__) {
              console.warn('[auth] foreground session refresh skipped', error)
            }
          }
        })()
      }, FOREGROUND_RESUME_DEBOUNCE_MS)
    })

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      subscription.remove()
    }
  }, [signOut])

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
