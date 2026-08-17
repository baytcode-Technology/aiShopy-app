import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Body, Caption, Heading } from '@/components/ui/Typography'
import { router } from 'expo-router'

type LegalSectionProps = {
  title: string
  children: ReactNode
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <View className="gap-2">
      <Heading className="text-base">{title}</Heading>
      <Body className="text-gray-600 leading-6">{children}</Body>
    </View>
  )
}

type LegalScreenProps = {
  title: string
  subtitle: string
  lastUpdated: string
  children: ReactNode
}

export function LegalScreen({ title, subtitle, lastUpdated, children }: LegalScreenProps) {
  return (
    <Screen>
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        onBack={() => router.back()}
        showSettings={false}
      />
      <ScreenScrollBody contentContainerClassName="px-5 pt-2 pb-12 gap-6">
        <Caption>Last updated {lastUpdated}</Caption>
        {children}
      </ScreenScrollBody>
    </Screen>
  )
}
