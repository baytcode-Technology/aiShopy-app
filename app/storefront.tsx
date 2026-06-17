import { useCallback } from 'react'
import { View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Caption, Heading, Muted } from '@/components/ui/Typography'
import { StoreAvatar } from '@/components/store/StoreAvatar'
import { StorefrontUrlActions } from '@/components/store/StorefrontUrlActions'
import { env } from '@src/config/env'
import { useStore } from '@src/contexts/store-context'
import { shadows } from '@src/lib/shadows'
import { buildSubdomainUrl } from '@src/lib/storefront'

export default function StorefrontScreen() {
  const { store, subdomainUrl, refreshStore } = useStore()

  useFocusEffect(
    useCallback(() => {
      void refreshStore()
    }, [refreshStore])
  )

  const storefrontHost = store?.slug
    ? `${store.slug}.${env.storefrontBaseDomain}`
    : null
  const storefrontUrl =
    subdomainUrl ?? (store?.slug ? buildSubdomainUrl(store.slug) : null)

  return (
    <Screen>
      <ScreenHeader
        title="Storefront"
        subtitle="Your live store link"
        onBack={() => router.back()}
        showSettings={false}
      />
      <ScreenScrollBody>
        <Muted className="text-[14px] leading-5 mb-4">
          This is the store your customers visit online. Share the link on
          WhatsApp, Instagram, or anywhere you sell.
        </Muted>

        <View
          className="rounded-[28px] border border-gray-200 bg-surface p-6"
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
                {store?.name ?? 'Your store'}
              </Heading>
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
        </View>
      </ScreenScrollBody>
    </Screen>
  )
}
