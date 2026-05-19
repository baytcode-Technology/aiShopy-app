import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMyStore } from '@src/api/stores'
import { buildSubdomainUrl } from '@src/lib/storefront'
import {
  clearStoreSession,
  getStoreSession,
  saveStoreSession,
} from '@src/lib/store-storage'
import type { Store } from '@src/types/store'

type StoreContextValue = {
  store: Store | null
  subdomainUrl: string | null
  isLoading: boolean
  refreshStore: () => Promise<{ hasStore: boolean; subdomainUrl: string | null }>
  activateStoreSession: (store: Store, subdomainUrl: string) => Promise<void>
  clearStore: () => Promise<void>
}

const StoreContext = createContext<StoreContextValue | null>(null)

async function persistSession(store: Store, subdomainUrl: string) {
  await saveStoreSession({
    storeId: store.id,
    slug: store.slug,
    name: store.name,
    subdomainUrl,
  })
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null)
  const [subdomainUrl, setSubdomainUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getStoreSession().then((session) => {
      if (session) {
        setSubdomainUrl(session.subdomainUrl)
      }
    })
  }, [])

  const activateStoreSession = useCallback(async (next: Store, url: string) => {
    setStore(next)
    setSubdomainUrl(url)
    await persistSession(next, url)
  }, [])

  const refreshStore = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchMyStore()
      const url = res.data.store ? buildSubdomainUrl(res.data.store.slug) : null
      setStore(res.data.store)
      setSubdomainUrl(url)
      if (res.data.store && url) {
        await persistSession(res.data.store, url)
      } else if (!res.data.hasStore) {
        await clearStoreSession()
      }
      return { hasStore: res.data.hasStore, subdomainUrl: url }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearStore = useCallback(async () => {
    setStore(null)
    setSubdomainUrl(null)
    await clearStoreSession()
  }, [])

  const value = useMemo(
    () => ({
      store,
      subdomainUrl,
      isLoading,
      refreshStore,
      activateStoreSession,
      clearStore,
    }),
    [store, subdomainUrl, isLoading, refreshStore, activateStoreSession, clearStore]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return ctx
}
