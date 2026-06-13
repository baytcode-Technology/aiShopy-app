import { useCallback, useState } from 'react'
import { Pressable, Switch, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from 'expo-router'
import { NotificationSoundPicker } from '@/components/notifications/NotificationSoundPicker'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Label, Muted } from '@/components/ui/Typography'
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '@src/api/notification-preferences'
import { getNotificationSound } from '@src/lib/notification-sounds'
import {
  ensureNotificationPermissions,
  setupAndroidNotificationChannels,
} from '@src/lib/push-notifications'
import { shadows } from '@src/lib/shadows'
import { showError, showSuccess } from '@src/lib/toast'
import { useStoreNotifications } from '@src/contexts/store-notifications-context'
import type { NotificationPreferences, NotificationSoundId } from '@src/types/notification-preferences'
import Colors from '@src/theme/colors'
import { router } from 'expo-router'

const DEFAULT_PREFS: NotificationPreferences = {
  chats: true,
  online_orders: true,
  pos_orders: true,
  sound_id: 'default',
}

export default function NotificationsScreen() {
  const { refreshPreferences: refreshProviderPrefs } = useStoreNotifications()
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS)
  const [soundExpanded, setSoundExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchNotificationPreferences()
      setPrefs(res.data.notification_preferences)
    } catch (e) {
      showError(e, 'Could not load notification settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
      void ensureNotificationPermissions()
      void setupAndroidNotificationChannels()
    }, [load])
  )

  const save = async (next: NotificationPreferences) => {
    setSaving(true)
    try {
      const res = await updateNotificationPreferences(next)
      setPrefs(res.data.notification_preferences)
      await refreshProviderPrefs()
      showSuccess('Notification settings saved')
    } catch (e) {
      showError(e, 'Could not save notification settings')
      await load()
    } finally {
      setSaving(false)
    }
  }

  const patchPref = <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    void save(next)
  }

  const selectedSound = getNotificationSound(prefs.sound_id)

  return (
    <Screen>
      <ScreenHeader
        title="Notifications"
        subtitle="Alerts & preferences"
        onBack={() => router.back()}
      />
      <ScreenBody className="px-5 pt-2">
        <Muted className="text-[14px] leading-5 mb-4">
          Choose which store events play a sound and show alerts on this device.
        </Muted>

        <View
          className="w-full rounded-[28px] border border-gray-200 bg-surface px-4 py-5 gap-4 mb-4"
          style={shadows.card}
        >
          <Label className="text-base">Alerts</Label>

          <ToggleRow
            label="Chats"
            hint="WhatsApp and Instagram messages"
            value={prefs.chats}
            disabled={loading || saving}
            onValueChange={(v) => patchPref('chats', v)}
          />
          <ToggleRow
            label="Online orders"
            hint="New orders from your storefront"
            value={prefs.online_orders}
            disabled={loading || saving}
            onValueChange={(v) => patchPref('online_orders', v)}
          />
          <ToggleRow
            label="POS orders"
            hint="Walk-in orders created in the app"
            value={prefs.pos_orders}
            disabled={loading || saving}
            onValueChange={(v) => patchPref('pos_orders', v)}
          />
        </View>

        <View
          className="w-full rounded-[28px] border border-gray-200 bg-surface overflow-hidden"
          style={shadows.card}
        >
          <Pressable
            onPress={() => setSoundExpanded((v) => !v)}
            className="flex-row items-center justify-between gap-3 px-4 py-5"
          >
            <View className="flex-1">
              <Label className="text-base">Notification sound</Label>
              <Muted className="mt-1 text-[13px]">{selectedSound.label}</Muted>
            </View>
            <FontAwesome
              name={soundExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.text.muted}
            />
          </Pressable>

          {soundExpanded ? (
            <View className="px-4 pb-5 border-t border-gray-100 pt-2">
              <NotificationSoundPicker
                value={prefs.sound_id}
                onChange={(id: NotificationSoundId) => patchPref('sound_id', id)}
              />
            </View>
          ) : null}
        </View>
      </ScreenBody>
    </Screen>
  )
}

function ToggleRow({
  label,
  hint,
  value,
  disabled,
  onValueChange,
}: {
  label: string
  hint: string
  value: boolean
  disabled?: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-1">
      <View className="flex-1 pr-2">
        <Text className="text-[15px] font-semibold text-ink">{label}</Text>
        <Muted className="text-[13px] mt-0.5">{hint}</Muted>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: '#e4e4e7', true: Colors.brand.primary }}
      />
    </View>
  )
}
