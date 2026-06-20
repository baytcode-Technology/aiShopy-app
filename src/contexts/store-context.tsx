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
import { isLegacyUuidId, normalizeEntityId } from '@src/lib/normalize-entity-id'
import {
  clearStoreSession,
  getStoreSession,
  saveStoreSession,
} from '@src/lib/store-storage'
import { showWarning } from '@src/lib/toast'
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

function normalizeStoreFromApi(raw: Store | null): Store | null {
  if (!raw) return null
  const id = normalizeEntityId(raw.id)
  if (id == null) return null
  return { ...raw, id }
}

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
    const normalized = normalizeStoreFromApi(next)
    if (!normalized) {
      showWarning(
        'Database update required',
        'Run migration 028_integer_ids.sql on Supabase, then create a new store.'
      )
      return
    }
    setStore(normalized)
    setSubdomainUrl(url)
    await persistSession(normalized, url)
  }, [])

  const refreshStore = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchMyStore()
      const rawStore = res.data.store
      const normalized = normalizeStoreFromApi(rawStore)

      // #region agent log
      fetch('http://127.0.0.1:7642/ingest/403551e5-c17d-483b-8ef5-ce6768f0a7b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f8490e' },
        body: JSON.stringify({
          sessionId: 'f8490e',
          location: 'store-context.tsx:refreshStore',
          message: 'store id from API',
          data: {
            hasStore: res.data.hasStore,
            rawId: rawStore?.id,
            rawIdType: typeof rawStore?.id,
            isLegacyUuid: rawStore ? isLegacyUuidId(rawStore.id) : false,
            normalizedId: normalized?.id ?? null,
          },
          timestamp: Date.now(),
          hypothesisId: 'H1-migration-not-applied',
        }),
      }).catch(() => {})
      // #endregion

      if (rawStore && !normalized) {
        await clearStoreSession()
        setStore(null)
        setSubdomainUrl(null)
        showWarning(
          'Database update required',
          'Run migration 028_integer_ids.sql on Supabase, then create a new store.'
        )
        return { hasStore: false, subdomainUrl: null }
      }

      const url = normalized ? buildSubdomainUrl(normalized.slug) : null
      setStore(normalized)
      setSubdomainUrl(url)
      if (normalized && url) {
        await persistSession(normalized, url)
      } else if (!res.data.hasStore) {
        await clearStoreSession()
      }
      return { hasStore: res.data.hasStore && normalized !== null, subdomainUrl: url }
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
