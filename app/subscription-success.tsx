import { Button } from '@/components/ui/Button'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { Caption, Heading, Muted } from '@/components/ui/Typography'
import { useStore } from '@src/contexts/store-context'
import {
  formatSubscriptionExpiry,
  getPlanLabel,
  getStorePlan,
} from '@src/lib/subscription'
import { shadows } from '@src/lib/shadows'
import Colors from '@src/theme/colors'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, type Href } from 'expo-router'
import { useCallback } from 'react'
import { BackHandler, Platform, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

const SUBSCRIPTION_ROUTE = '/subscription' as Href

export default function SubscriptionSuccessScreen() {
  const { store } = useStore()
  const currentPlan = getStorePlan(store)
  const expiryLabel = formatSubscriptionExpiry(store?.subscription_expires_at)

  const goToSubscription = useCallback(() => {
    router.replace(SUBSCRIPTION_ROUTE)
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goToSubscription()
        return true
      })

      return () => subscription.remove()
    }, [goToSubscription])
  )

  return (
    <Screen variant="canvas">
      <ScreenBody className="flex-1 px-6 pb-8">
        <View className="flex-1 items-center justify-center">
          <View
            className="w-24 h-24 rounded-full bg-[#E8F8EC] items-center justify-center mb-6"
            style={shadows.card}
          >
            <FontAwesome name="check" size={40} color={Colors.brand.green} />
          </View>

          <Caption className="text-[10px] uppercase tracking-widest text-brand-green font-bold mb-2">
            Payment successful
          </Caption>
          <Heading className="text-[28px] text-center tracking-tight text-ink">
            You're on {getPlanLabel(currentPlan)}
          </Heading>
          <Muted className="mt-3 text-[15px] leading-6 text-center max-w-[300px]">
            Your subscription is active. Premium features are unlocked for your store.
          </Muted>

          <View
            className="w-full mt-8 rounded-[28px] border-2 border-brand-green bg-[#E8F8EC] px-6 py-5"
            style={shadows.card}
          >
            <Caption className="text-[10px] uppercase tracking-widest text-brand-green font-bold mb-2">
              Active plan
            </Caption>
            <Text className="text-2xl font-extrabold text-ink">{getPlanLabel(currentPlan)}</Text>
            {expiryLabel ? (
              <View className="flex-row items-center gap-2 mt-3">
                <FontAwesome name="calendar" size={14} color="#EF4444" />
                <Text className="text-[15px] font-semibold text-[#EF4444]">
                  Valid until {expiryLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Button label="View subscription" onPress={goToSubscription} className="w-full" size="lg" />
      </ScreenBody>
    </Screen>
  )
}
