import { Alert, ScrollView, Text, View } from 'react-native'
import { router, type Href } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { MenuRow } from '@/components/ui/MenuRow'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Caption, Heading, Muted } from '@/components/ui/Typography'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { env } from '@src/config/env'
import { shadows } from '@src/lib/shadows'

export default function SettingsScreen() {
  const { user, signOut } = useAuth()
  const { store, clearStore } = useStore()

  const handleSignOut = async () => {
    await clearStore()
    await signOut()
    router.replace('/(auth)/login' as Href)
  }

  const handleComingSoon = (feature: string) => {
    Alert.alert('Coming soon', `${feature} will be available soon.`)
  }

  return (
    <Screen>
      <ScreenHeader
        showLogo
        variant="tab"
        title="Settings"
        subtitle="Store & profile"
        onBack={() => router.back()}
        showSettings={false}
      />
      <ScreenBody className="flex-1">
        <View className="px-5 pt-2 pb-4">
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
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-32 gap-3"
        >
          <View className="gap-3">
            <MenuRow
              label="Storefront"
              value={`${store?.slug}.${env.storefrontBaseDomain}`}
              icon="globe"
            />
            <MenuRow label="Currency" value={store?.currency ?? 'INR'} icon="money" />
            <MenuRow
              label="Payment methods"
              value="COD, cards & more"
              icon="credit-card"
              showChevron
              onPress={() =>
                router.push({ pathname: '/account-coming-soon', params: { id: 'payment-methods' } })
              }
            />
            <MenuRow
              label="Notifications"
              value="Orders, chats & alerts"
              icon="bell"
              showChevron
              onPress={() =>
                router.push({ pathname: '/account-coming-soon', params: { id: 'notifications' } })
              }
            />
            <MenuRow
              label="Printer"
              value="Receipts & labels"
              icon="print"
              showChevron
              onPress={() =>
                router.push({ pathname: '/account-coming-soon', params: { id: 'printer' } })
              }
            />
            <MenuRow
              label="Subscription"
              value="Plan & billing"
              icon="calendar"
              showChevron
              onPress={() =>
                router.push({ pathname: '/account-coming-soon', params: { id: 'subscription' } })
              }
            />
            <MenuRow
              label="Admin Dashboard"
              value="WhatsApp · Instagram · Chat Boat · Domain"
              icon="cog"
              showChevron
              onPress={() => router.push('/admin-dashboard' as Href)}
            />

            <View className="mt-2 gap-3">
              <Caption className="text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                Support
              </Caption>

              <MenuRow
                label="Send feedback"
                value=""
                icon="comment-o"
                showChevron
                onPress={() => handleComingSoon('Send feedback')}
              />
              <MenuRow
                label="Help center"
                value=""
                icon="question-circle-o"
                showChevron
                onPress={() => handleComingSoon('Help center')}
              />
              <MenuRow
                label="Privacy policy"
                value=""
                icon="lock"
                showChevron
                onPress={() => handleComingSoon('Privacy policy')}
              />
              <MenuRow
                label="Terms"
                value=""
                icon="file-text-o"
                showChevron
                onPress={() => handleComingSoon('Terms')}
              />
            </View>
          </View>

          <View className="pt-2">
            <Button
              label="Sign out"
              variant="primary"
              onPress={handleSignOut}
              className="bg-[#E11D48] border-[#E11D48]"
              labelClassName="text-white"
            />
          </View>
        </ScrollView>
      </ScreenBody>
    </Screen>
  )
}
