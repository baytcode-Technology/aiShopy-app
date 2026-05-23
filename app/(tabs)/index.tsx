import { Pressable, Text, View } from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { Heading, Muted } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'

export default function TabOneScreen() {
  const { user, signOut } = useAuth()
  const { store } = useStore()

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <Heading className="mb-2">Katlogue</Heading>
      <Text className="text-lg font-bold text-ink mb-1">{store?.name ?? 'Your store'}</Text>
      <Muted className="mb-8">{user?.email}</Muted>

      <Pressable
        className="border-2 border-ink rounded-2xl py-4 px-5 mb-4"
        onPress={() => router.push('/(store)/products')}
      >
        <Text className="text-[15px] font-bold text-ink">Open merchant app →</Text>
      </Pressable>

      <Muted className="mb-6">
        Products, orders, and chats live under the store tabs after onboarding.
      </Muted>

      <Button label="Sign out" variant="outline" onPress={() => signOut()} />

      <Link href="/modal" className="mt-8">
        <Text className="text-sm font-bold text-ink underline">Open modal</Text>
      </Link>
    </View>
  )
}
