import { router } from 'expo-router'
import { View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Heading, Muted } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import { shadows } from '@src/lib/shadows'

export default function ChatBoatScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Chat Boat"
        subtitle="Smart assistant for your store"
        onBack={() => router.back()}
      />
      <ScreenScrollBody contentContainerClassName="pt-6">
        <View
          className="items-center rounded-[28px] border border-gray-200 bg-surface px-8 py-12"
          style={shadows.card}
        >
          <View className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 items-center justify-center mb-5">
            <FontAwesome name="magic" size={28} color={Colors.brand.primary} />
          </View>
          <Heading className="text-2xl text-center tracking-tight mb-3">Coming soon</Heading>
          <Muted className="text-center text-[15px] leading-6 max-w-[280px]">
            Connect a chat boat to help answer customer questions, recommend products, and
            automate replies across your channels.
          </Muted>
        </View>
      </ScreenScrollBody>
    </Screen>
  )
}
