import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Heading, Label, Muted } from '@/components/ui/Typography'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { env } from '@src/config/env'

export default function MoreScreen() {
  const { user, signOut } = useAuth()
  const { store, clearStore } = useStore()

  const handleSignOut = async () => {
    await clearStore()
    await signOut()
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="px-6 py-4.5 bg-surface border-b border-gray-200">
        <Heading>More</Heading>
      </View>

      <View className="m-4 p-6 rounded-2xl bg-brand-primary flex-row items-center gap-4 shadow-lg shadow-ink/15">
        <View className="w-[52px] h-[52px] rounded-full bg-gray-600 border-2 border-white/15" />
        <View className="flex-1">
          <Text className="text-brand-on-primary text-lg font-extrabold tracking-tight">
            {store?.name ?? 'Your store'}
          </Text>
          <Muted className="text-gray-400 mt-1">{user?.email ?? ''}</Muted>
        </View>
      </View>

      <View className="px-4 gap-2.5">
        <Label>Store</Label>
        <Card>
          <Text className="text-[15px] font-bold text-ink">Domain</Text>
          <Muted className="mt-1.5">
            {store?.slug}.{env.storefrontBaseDomain}
          </Muted>
        </Card>
      </View>

      <Button
        label="Sign out"
        variant="danger"
        className="w-auto self-center mt-9 px-7"
        onPress={handleSignOut}
      />
    </SafeAreaView>
  )
}
