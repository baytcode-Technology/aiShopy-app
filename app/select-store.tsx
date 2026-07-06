import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router, type Href } from 'expo-router'
import { AppLogo } from '@/components/brand/AppLogo'
import { StorePickerList } from '@/components/store/StorePickerList'
import { Button } from '@/components/ui/Button'
import { Heading, Muted } from '@/components/ui/Typography'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { getStoreSession, normalizeStoreSession } from '@src/lib/store-storage'
import { performSignOut } from '@src/lib/safe-sign-out'

export default function SelectStoreScreen() {
  const { isAuthenticated, signOut } = useAuth()
  const { stores, store, refreshStores, switchStore, clearStore } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [lastSessionStoreId, setLastSessionStoreId] = useState<number | null>(null)
  const selectingRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login')
      return
    }

    void (async () => {
      setIsLoading(true)
      try {
        const session = normalizeStoreSession(await getStoreSession())
        setLastSessionStoreId(session?.storeId ?? null)
        await refreshStores()
      } finally {
        setIsLoading(false)
      }
    })()
  }, [isAuthenticated, refreshStores])

  const handleSelect = useCallback(
    async (storeId: number) => {
      if (selectingRef.current) return
      selectingRef.current = true
      try {
        const ok = await switchStore(storeId)
        if (ok) {
          router.replace('/(store)/chats' as Href)
        }
      } finally {
        selectingRef.current = false
      }
    },
    [switchStore]
  )

  return (
    <View className="flex-1 bg-gray-100 px-5 pt-14 pb-8">
      <View className="items-center mb-8">
        <AppLogo variant="wordmark" align="center" className="mb-6" />
        <Heading className="text-2xl text-center tracking-tight">
          Choose a workspace
        </Heading>
        <Muted className="text-center mt-2 text-[15px] leading-6 px-4">
          Which store do you want to open? You can switch anytime from Storefront
          in Settings.
        </Muted>
      </View>

      <StorePickerList
        stores={stores}
        selectedStoreId={store?.id}
        lastSessionStoreId={lastSessionStoreId}
        isLoading={isLoading}
        onSelect={(storeId) => void handleSelect(storeId)}
      />

      <View className="mt-8 gap-3">
        <Pressable
          onPress={() => router.push('/create-store' as Href)}
          className="items-center py-2"
        >
          <Text className="text-[15px] font-semibold text-brand-green">
            Create a new store
          </Text>
        </Pressable>
        <Button
          label="Sign out"
          variant="ghost"
          onPress={() => void performSignOut(clearStore, signOut)}
        />
      </View>
    </View>
  )
}
