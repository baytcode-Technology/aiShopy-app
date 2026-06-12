import type { ComponentProps } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Heading, Muted } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import { shadows } from '@src/lib/shadows'

type FeatureId =
  | 'payment-methods'
  | 'razorpay'
  | 'cash-on-delivery'
  | 'upi'
  | 'notifications'
  | 'printer'
  | 'subscription'
  | 'staff-management'
  | 'website'

const FEATURES: Record<
  FeatureId,
  {
    title: string
    subtitle: string
    icon: ComponentProps<typeof FontAwesome>['name']
    description: string
    features?: string[]
  }
> = {
  'payment-methods': {
    title: 'Payment methods',
    subtitle: 'Checkout & payouts',
    icon: 'credit-card',
    description:
      'Connect Razorpay, COD, and other payment options for your store. This will be available soon.',
  },
  razorpay: {
    title: 'Razorpay',
    subtitle: 'Online payments',
    icon: 'credit-card',
    description:
      'Accept cards, wallets, and netbanking through Razorpay. Connect your account and start taking online payments soon.',
    features: [
      'Link your Razorpay merchant account',
      'Accept credit and debit cards',
      'Enable wallets and netbanking',
      'Automatic payment status on orders',
      'Secure checkout on your storefront',
    ],
  },
  'cash-on-delivery': {
    title: 'Cash on delivery',
    subtitle: 'Pay on delivery',
    icon: 'money',
    description:
      'Let customers pay when their order is delivered. Turn COD on or off and set rules from here soon.',
    features: [
      'Enable or disable COD per store',
      'Optional minimum order amount',
      'Mark orders as paid on delivery',
      'Works with your existing order flow',
    ],
  },
  upi: {
    title: 'UPI',
    subtitle: 'Instant UPI payments',
    icon: 'mobile',
    description:
      'Collect payments via UPI apps like PhonePe, Google Pay, and Paytm. Setup and QR options are coming soon.',
    features: [
      'Display UPI ID or QR at checkout',
      'Support popular UPI apps',
      'Confirm payment from the app',
      'Works alongside Razorpay and COD',
    ],
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
      'View your AiShopy plan, billing history, and upgrade options. This will be available soon.',
  },
  'staff-management': {
    title: 'Staff management',
    subtitle: 'Roles & team access',
    icon: 'users',
    description:
      'Invite staff, assign roles, and manage who can access your store inbox and orders. This will be available soon.',
  },
  website: {
    title: 'Website',
    subtitle: 'Storefront UI design',
    icon: 'paint-brush',
    description:
      'Design your store website visually — themes, layouts, and branding — without writing code. We are building this for you.',
    features: [
      'Pick themes and color palettes that match your brand',
      'Customize homepage sections, banners, and hero areas',
      'Arrange product grids and category layouts',
      'Set fonts, logo placement, and button styles',
      'Preview on mobile and desktop before you publish',
      'One-tap publish to your AiShopy storefront link',
    ],
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

          {feature.features && feature.features.length > 0 ? (
            <View className="w-full mt-8 pt-6 border-t border-gray-100">
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.18em] mb-4 text-center">
                Planned features
              </Text>
              <View className="gap-3">
                {feature.features.map((item) => (
                  <View key={item} className="flex-row items-start gap-3">
                    <View className="w-5 h-5 rounded-full bg-gray-100 items-center justify-center mt-0.5">
                      <FontAwesome name="check" size={10} color={Colors.brand.primary} />
                    </View>
                    <Text className="flex-1 text-[14px] text-gray-600 leading-5">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScreenBody>
    </Screen>
  )
}
