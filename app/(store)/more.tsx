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

      <ScreenHeader title="Account" subtitle="Store & profile" />

      <ScreenBody className="px-4 pt-4 gap-4">

        <View className="bg-brand-primary rounded-3xl p-6 border-2 border-ink">

          <View className="w-14 h-14 rounded-2xl bg-charcoal border border-gray-700 items-center justify-center mb-4">

            <Text className="text-xl font-extrabold text-brand-on-primary">

              {store?.name?.slice(0, 1).toUpperCase() ?? 'S'}

            </Text>

          </View>

          <Heading className="text-brand-on-primary text-xl tracking-tight">

            {store?.name ?? 'Your store'}

          </Heading>

          <Muted className="text-gray-400 mt-1.5">{user?.email ?? ''}</Muted>

        </View>



        <MenuRow

          label="Storefront"

          value={`${store?.slug}.${env.storefrontBaseDomain}`}

          icon="globe"

        />



        <MenuRow label="Currency" value={store?.currency ?? 'INR'} icon="money" />



        <View className="pt-4">

          <Button label="Sign out" variant="outline" onPress={handleSignOut} />

        </View>

      </ScreenBody>

    </Screen>

  )

}

