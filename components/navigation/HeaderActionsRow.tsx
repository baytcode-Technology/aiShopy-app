import type { ReactNode } from 'react'
import { View } from 'react-native'
import { SettingsHeaderButton } from '@/components/navigation/SettingsHeaderButton'

type Props = {
  children?: ReactNode
  showSettings?: boolean
  settingsTone?: 'default' | 'onPrimary'
}

export function HeaderActionsRow({
  children,
  showSettings = true,
  settingsTone = 'default',
}: Props) {
  if (!children && !showSettings) return null

  return (
    <View className="flex-row items-center gap-2 shrink-0">
      {children}
      {showSettings ? <SettingsHeaderButton tone={settingsTone} /> : null}
    </View>
  )
}
