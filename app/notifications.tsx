import { useCallback, useState } from 'react'
import { Pressable, Switch, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { NotificationSettingsSkeleton } from '@/components/ui/Skeleton'
import { Label, Muted } from '@/components/ui/Typography'
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '@src/api/notification-preferences'
import {
  ensureNotificationPermissions,
  setupAndroidNotificationChannels,
} from '@src/lib/push-notifications'
import { shadows } from '@src/lib/shadows'
import { showError, showSuccess } from '@src/lib/toast'
import { useStoreNotifications } from '@src/contexts/store-notifications-context'
import { useStore } from '@src/contexts/store-context'
import type { NotificationPreferences } from '@src/types/notification-preferences'
import Colors from '@src/theme/colors'
import { router } from 'expo-router'

function notificationSettingsErrorMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('notification_preferences')) {
    return 'Database update required: run migration 021_notification_preferences.sql on Supabase, then try again.'
  }
  return fallback
}

export default function NotificationsScreen() {
  const { store } = useStore()
  const { refreshPreferences: refreshProviderPrefs } = useStoreNotifications()
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const res = await fetchNotificationPreferences(store.id)
      setPrefs(res.data.notification_preferences)
    } catch (e) {
      setPrefs(null)
      showError(e, notificationSettingsErrorMessage(e, 'Could not load notification settings'))
    } finally {
      setLoading(false)
    }
  }, [store?.id])

  useFocusEffect(
    useCallback(() => {
      void load()
      void ensureNotificationPermissions()
      void setupAndroidNotificationChannels()
    }, [load])
  )

  const save = async (next: NotificationPreferences) => {
    if (!store?.id) return
    setSaving(true)
    try {
      const res = await updateNotificationPreferences(store.id, {
        ...next,
        sound_id: 'default',
      })
      setPrefs(res.data.notification_preferences)
      await refreshProviderPrefs()
      showSuccess('Notification settings saved')
    } catch (e) {
      showError(e, notificationSettingsErrorMessage(e, 'Could not save notification settings'))
      await load()
    } finally {
      setSaving(false)
    }
  }

  const patchPref = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    if (!prefs) return
    const next = { ...prefs, [key]: value, sound_id: 'default' as const }
    setPrefs(next)
    void save(next)
  }

  return (
    <Screen>
      <ScreenHeader
        title="Notifications"
        subtitle="Alerts & preferences"
        onBack={() => router.back()}
      />
      <ScreenScrollBody contentContainerClassName="gap-4">
        {loading ? (
          <NotificationSettingsSkeleton />
        ) : !prefs ? (
          <Pressable
            onPress={() => void load()}
            className="rounded-2xl border border-gray-200 bg-surface px-4 py-4 active:opacity-85"
            style={shadows.card}
          >
            <Text className="text-[15px] font-semibold text-ink text-center">
              Could not load settings
            </Text>
            <Muted className="text-[13px] text-center mt-1">Tap to try again</Muted>
          </Pressable>
        ) : (
          <>
            <Muted className="text-[14px] leading-5">
              Choose which events show alerts. Uses your phone&apos;s default notification sound.
              When the app is fully closed, Firebase push setup is required on Android.
            </Muted>

            <View
              className="w-full rounded-[28px] border border-gray-200 bg-surface px-4 py-5 gap-4"
              style={shadows.card}
            >
              <Label className="text-base">Alerts</Label>

              <ToggleRow
                label="Chats"
                hint="WhatsApp and Instagram messages"
                value={prefs.chats}
                disabled={saving}
                onValueChange={(v) => patchPref('chats', v)}
              />
              <ToggleRow
                label="Online orders"
                hint="New orders from your storefront"
                value={prefs.online_orders}
                disabled={saving}
                onValueChange={(v) => patchPref('online_orders', v)}
              />
              <ToggleRow
                label="POS orders"
                hint="Walk-in orders created in the app"
                value={prefs.pos_orders}
                disabled={saving}
                onValueChange={(v) => patchPref('pos_orders', v)}
              />
            </View>

            <View
              className="w-full rounded-[28px] border border-gray-200 bg-surface px-4 py-5 gap-2"
              style={shadows.card}
            >
              <Label className="text-base">Notification sound</Label>
              <Muted className="text-[13px] leading-5">
                Custom sounds and previews are coming soon. Alerts currently use your phone&apos;s
                default notification tone.
              </Muted>
              <View className="mt-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
                <Text className="text-[13px] font-bold text-ink mb-1">Coming soon</Text>
                <Muted className="text-[13px] leading-5">
                  Pick different ringtones per alert type and upload your own sound.
                </Muted>
              </View>
            </View>
          </>
        )}
      </ScreenScrollBody>
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
