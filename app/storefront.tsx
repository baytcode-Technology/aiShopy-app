import { useCallback, useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router, useFocusEffect, type Href } from 'expo-router'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Caption, Heading, Muted } from '@/components/ui/Typography'
import { StoreAvatar } from '@/components/store/StoreAvatar'
import { StorePickerList } from '@/components/store/StorePickerList'
import { StorefrontUrlActions } from '@/components/store/StorefrontUrlActions'
import { env } from '@src/config/env'
import { useStore } from '@src/contexts/store-context'
import { shadows } from '@src/lib/shadows'
import { buildSubdomainUrl } from '@src/lib/storefront'
import type { StoreAccessRole } from '@src/types/store'

function RoleBadge({ role }: { role: StoreAccessRole }) {
  return (
    <View className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-1">
      <Caption className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
        {role === 'owner' ? 'Owner' : 'Staff'}
      </Caption>
    </View>
  )
}

export default function StorefrontScreen() {
  const { store, stores, role, subdomainUrl, refreshStores, switchStore } = useStore()
  const selectingRef = useRef(false)

  useFocusEffect(
    useCallback(() => {
      void refreshStores()
    }, [refreshStores])
  )

  const storefrontHost = store?.slug
    ? `${store.slug}.${env.storefrontBaseDomain}`
    : null
  const storefrontUrl =
    subdomainUrl ?? (store?.slug ? buildSubdomainUrl(store.slug) : null)

  const handleSelectStore = async (storeId: number) => {
    if (selectingRef.current) return
    selectingRef.current = true
    try {
      if (store?.id === storeId) {
        router.replace('/(store)/chats' as Href)
        return
      }
      const ok = await switchStore(storeId)
      if (ok) {
        router.replace('/(store)/chats' as Href)
      }
    } finally {
      selectingRef.current = false
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title="Storefront"
        subtitle="Your stores & live links"
        onBack={() => router.back()}
        showSettings={false}
      />
      <ScreenScrollBody>
        <Muted className="text-[14px] leading-5 mb-4">
          Select a store to manage in the app. Share each storefront link with
          customers on WhatsApp, Instagram, or anywhere you sell.
        </Muted>

        <Caption className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">
          Your stores
        </Caption>

        <StorePickerList
          stores={stores}
          selectedStoreId={store?.id}
          onSelect={(storeId) => void handleSelectStore(storeId)}
        />

        {store ? (
          <View
            className="rounded-[28px] border border-gray-200 bg-surface p-6 mt-5"
            style={shadows.card}
          >
            <View className="self-start rounded-full bg-gray-100 border border-gray-200 px-3 py-1.5 mb-4">
              <Caption className="text-[10px] uppercase tracking-widest text-gray-500">
                Currently selected store
              </Caption>
            </View>

            <View className="flex-row items-center gap-4 mb-4">
              <StoreAvatar store={store} />
              <View className="flex-1 min-w-0">
                <Caption className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  Store name
                </Caption>
                <Heading className="text-xl tracking-tight" numberOfLines={2}>
                  {store.name}
                </Heading>
                {role ? (
                  <View className="mt-2 self-start">
                    <RoleBadge role={role} />
                  </View>
                ) : null}
              </View>
            </View>

            <View className="pt-4 border-t border-gray-100">
              <Caption className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                Store URL
              </Caption>
              {storefrontHost && storefrontUrl ? (
                <StorefrontUrlActions url={storefrontUrl} displayHost={storefrontHost} />
              ) : (
                <Muted className="text-[15px]">No storefront URL yet</Muted>
              )}
            </View>

            <Pressable
              className="mt-5 self-start"
              onPress={() => router.push('/create-store' as Href)}
            >
              <Text className="text-[14px] font-semibold text-brand-green">
                Create another store
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScreenScrollBody>
    </Screen>
  )
}
