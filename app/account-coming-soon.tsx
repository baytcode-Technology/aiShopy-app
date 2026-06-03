import type { ComponentProps } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Heading, Muted } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import { shadows } from '@src/lib/shadows'

type FeatureId = 'payment-methods' | 'notifications' | 'printer' | 'subscription'

const FEATURES: Record<
  FeatureId,
  {
    title: string
    subtitle: string
    icon: ComponentProps<typeof FontAwesome>['name']
    description: string
  }
> = {
  'payment-methods': {
    title: 'Payment methods',
    subtitle: 'Checkout & payouts',
    icon: 'credit-card',
    description:
      'Connect Razorpay, COD, and other payment options for your store. This will be available soon.',
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Alerts & preferences',
    icon: 'bell',
    description:
      'Manage order alerts, chat notifications, and marketing updates. This will be available soon.',
  },
  printer: {
    title: 'Printer',
    subtitle: 'Receipts & labels',
    icon: 'print',
    description:
      'Pair a thermal printer for order receipts and packing slips. This will be available soon.',
  },
  subscription: {
    title: 'Subscription',
    subtitle: 'Plan & billing',
    icon: 'calendar',
    description:
      'View your AISHOPY plan, billing history, and upgrade options. This will be available soon.',
  },
}

export default function AccountComingSoonScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const feature = FEATURES[(id as FeatureId) ?? 'payment-methods'] ?? FEATURES['payment-methods']

  return (
    <Screen>
      <ScreenHeader
        title={feature.title}
        subtitle={feature.subtitle}
        onBack={() => router.back()}
      />
      <ScreenBody className="px-5 pt-6">
        <View
          className="items-center rounded-[28px] border border-gray-200 bg-surface px-8 py-12"
          style={shadows.card}
        >
          <View className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 items-center justify-center mb-5">
            <FontAwesome name={feature.icon} size={26} color={Colors.brand.primary} />
          </View>
          <Heading className="text-2xl text-center tracking-tight mb-3">Coming soon</Heading>
          <Muted className="text-center text-[15px] leading-6 max-w-[300px]">
            {feature.description}
          </Muted>
        </View>
      </ScreenBody>
    </Screen>
  )
}
