import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMyStore, fetchMyStores } from '@src/api/stores'
import { buildSubdomainUrl } from '@src/lib/storefront'
import { normalizeEntityId } from '@src/lib/normalize-entity-id'
import {
  clearStoreSession,
  getStoreSession,
  normalizeStoreSession,
  saveStoreSession,
} from '@src/lib/store-storage'
import { showWarning } from '@src/lib/toast'
import type {
  Store,
  StoreAccessRole,
  StoreListItem,
} from '@src/types/store'

type StoreContextValue = {
  store: Store | null
  stores: StoreListItem[]
  role: StoreAccessRole | null
  subdomainUrl: string | null
  isLoading: boolean
  refreshStores: () => Promise<StoreListItem[]>
  refreshStore: (options?: { silent?: boolean }) => Promise<{ hasStore: boolean; subdomainUrl: string | null }>
  switchStore: (storeId: number) => Promise<boolean>
  activateStoreSession: (
    store: Store,
    subdomainUrl: string,
    role?: StoreAccessRole
  ) => Promise<void>
  clearStore: () => Promise<void>
}

const StoreContext = createContext<StoreContextValue | null>(null)

function normalizeStoreFromApi(raw: Store | null): Store | null {
  if (!raw) return null
  const id = normalizeEntityId(raw.id)
  if (id == null) return null
  return { ...raw, id }
}

async function persistSession(
  store: Store,
  subdomainUrl: string,
  role: StoreAccessRole
) {
  await saveStoreSession({
    storeId: store.id,
    slug: store.slug,
    name: store.name,
    subdomainUrl,
    role,
  })
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null)
  const [stores, setStores] = useState<StoreListItem[]>([])
  const [role, setRole] = useState<StoreAccessRole | null>(null)
  const [subdomainUrl, setSubdomainUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStoreId, setSessionStoreId] = useState<number | null>(null)

  useEffect(() => {
    getStoreSession().then((session) => {
      const normalized = normalizeStoreSession(session)
      if (normalized) {
        setSubdomainUrl(normalized.subdomainUrl)
        setSessionStoreId(normalized.storeId)
        setRole(normalized.role)
      }
    })
  }, [])

  const activateStoreSession = useCallback(
    async (next: Store, url: string, nextRole: StoreAccessRole = 'owner') => {
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
      setRole(nextRole)
      setSessionStoreId(normalized.id)
      await persistSession(normalized, url, nextRole)
    },
    []
  )

  const refreshStores = useCallback(async () => {
    const res = await fetchMyStores()
    const list = res.data.stores
      .map((item) => {
        const normalized = normalizeStoreFromApi(item.store)
        if (!normalized) return null
        return { store: normalized, role: item.role }
      })
      .filter((item): item is StoreListItem => item != null)
    setStores(list)
    return list
  }, [])

  const refreshStore = useCallback(async (options?: { silent?: boolean }) => {
    const showLoading = !options?.silent
    if (showLoading) setIsLoading(true)
    try {
      const list = await refreshStores()
      const preferredId =
        sessionStoreId ??
        normalizeStoreSession(await getStoreSession())?.storeId ??
        undefined

      const res = await fetchMyStore(preferredId)
      const rawStore = res.data.store
      const normalized = normalizeStoreFromApi(rawStore)

      if (rawStore && !normalized) {
        await clearStoreSession()
        setStore(null)
        setSubdomainUrl(null)
        setRole(null)
        setSessionStoreId(null)
        showWarning(
          'Database update required',
          'Run migration 028_integer_ids.sql on Supabase, then create a new store.'
        )
        return { hasStore: false, subdomainUrl: null }
      }

      const url = normalized ? buildSubdomainUrl(normalized.slug) : null
      const nextRole = res.data.role ?? null

      setStore(normalized)
      setSubdomainUrl(url)
      setRole(nextRole)
      if (normalized?.id) setSessionStoreId(normalized.id)

      if (normalized && url && nextRole) {
        await persistSession(normalized, url, nextRole)
      } else if (!res.data.hasStore) {
        await clearStoreSession()
        setSessionStoreId(null)
      }

      return {
        hasStore: res.data.hasStore && normalized !== null,
        subdomainUrl: url,
      }
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [refreshStores, sessionStoreId])

  const switchStore = useCallback(
    async (storeId: number) => {
      const match = stores.find((item) => item.store.id === storeId)
      if (!match) {
        const list = await refreshStores()
        const found = list.find((item) => item.store.id === storeId)
        if (!found) return false
        const url = buildSubdomainUrl(found.store.slug)
        await activateStoreSession(found.store, url, found.role)
        return true
      }
      const url = buildSubdomainUrl(match.store.slug)
      await activateStoreSession(match.store, url, match.role)
      return true
    },
    [stores, refreshStores, activateStoreSession]
  )

  const clearStore = useCallback(async () => {
    setStore(null)
    setStores([])
    setRole(null)
    setSubdomainUrl(null)
    setSessionStoreId(null)
    await clearStoreSession()
  }, [])

  const value = useMemo(
    () => ({
      store,
      stores,
      role,
      subdomainUrl,
      isLoading,
      refreshStores,
      refreshStore,
      switchStore,
      activateStoreSession,
      clearStore,
    }),
    [
      store,
      stores,
      role,
      subdomainUrl,
      isLoading,
      refreshStores,
      refreshStore,
      switchStore,
      activateStoreSession,
      clearStore,
    ]
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
