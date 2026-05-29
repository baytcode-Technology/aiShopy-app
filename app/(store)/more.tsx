import { Text, View } from 'react-native'
import { router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { MenuRow } from '@/components/ui/MenuRow'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Heading, Muted } from '@/components/ui/Typography'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { env } from '@src/config/env'
import { shadows } from '@src/lib/shadows'
import type { Href } from 'expo-router'

export default function MoreScreen() {
  const { user, signOut } = useAuth()
  const { store, clearStore } = useStore()

  const handleSignOut = async () => {
    await clearStore()
    await signOut()
    router.replace('/(auth)/login')
  }

  return (
    <Screen>
      <ScreenHeader showLogo title="Account" subtitle="Store & profile" />
      <ScreenBody className="px-5 pt-2 gap-5">
        <View
          className="rounded-[28px] border border-gray-200 bg-surface p-6"
          style={shadows.card}
        >
          <View className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 items-center justify-center mb-5">
            <Text className="text-xl font-extrabold text-ink">
              {store?.name?.slice(0, 1).toUpperCase() ?? 'S'}
            </Text>
          </View>
          <Heading className="text-2xl tracking-tight">{store?.name ?? 'Your store'}</Heading>
          <Muted className="mt-2 text-[15px]">{user?.email ?? ''}</Muted>
        </View>

        <View className="gap-3">
          <MenuRow
            label="Storefront"
            value={`${store?.slug}.${env.storefrontBaseDomain}`}
            icon="globe"
          />
          <MenuRow label="Currency" value={store?.currency ?? 'INR'} icon="money" />
          <MenuRow
            label="WhatsApp"
            value="Connect phone + inbox"
            icon="whatsapp"
            showChevron
            onPress={() => router.push('/(store)/connect-whatsapp' as Href)}
          />
        </View>

        <View className="pt-2">
          <Button label="Sign out" variant="outline" onPress={handleSignOut} />
        </View>
      </ScreenBody>
    </Screen>
  )
}
