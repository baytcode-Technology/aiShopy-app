import { useCallback, useEffect, useState } from 'react'
import { Switch, Text, View } from 'react-native'
import * as Notifications from 'expo-notifications'
import {
  registerThisDeviceAsAdminPush,
  unregisterThisDeviceAdminPush,
} from '@src/api/platform-admin-push'
import { getErrorMessage } from '@src/lib/api-error'
import { getAdminAlertsEnabled, setAdminAlertsEnabledFlag } from '@src/lib/push-alert-prefs'
import {
  ensureNotificationPermissions,
  setPushAlertsEnabled,
} from '@src/lib/push-notifications'
import { shadows } from '@src/lib/shadows'
import Colors from '@src/theme/colors'

type Props = {
  variant?: 'card' | 'row'
}

export function AdminAlertsToggle({ variant = 'card' }: Props) {
  const [subscribed, setSubscribed] = useState(false)
  const [denied, setDenied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const pref = await getAdminAlertsEnabled()
    const permission = await Notifications.getPermissionsAsync()
    setDenied(permission.status === Notifications.PermissionStatus.DENIED)
    setSubscribed(pref && permission.granted)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleToggle = async (next: boolean) => {
    setBusy(true)
    setError(null)
    try {
      if (!next) {
        await unregisterThisDeviceAdminPush()
        await setAdminAlertsEnabledFlag(false)
        setSubscribed(false)
        return
      }

      const granted = await ensureNotificationPermissions()
      if (!granted) {
        setDenied(true)
        setSubscribed(false)
        setError('Allow notifications in iPhone Settings to receive admin alerts.')
        return
      }

      setPushAlertsEnabled(true)
      const ok = await registerThisDeviceAsAdminPush()
      if (!ok) {
        setError('Could not get a push token on this device.')
        return
      }
      await setAdminAlertsEnabledFlag(true)
      setDenied(false)
      setSubscribed(true)
    } catch (e) {
      setError(getErrorMessage(e, 'Could not update admin alerts'))
    } finally {
      setBusy(false)
    }
  }

  const hint = denied
    ? 'Blocked in iPhone Settings'
    : error

  const body = (
    <View className="flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="text-[15px] font-semibold text-ink">Admin alerts</Text>
        {hint ? <Text className="mt-0.5 text-[12px] leading-4 text-gray-500">{hint}</Text> : (
          <Text className="mt-0.5 text-[12px] leading-4 text-gray-500">
            Tickets, new users, and support messages
          </Text>
        )}
      </View>
      <Switch
        value={subscribed}
        disabled={busy}
        onValueChange={(v) => void handleToggle(v)}
        trackColor={{ false: '#e4e4e7', true: Colors.brand.primary }}
      />
    </View>
  )

  if (variant === 'row') {
    return <View className="px-1 py-1">{body}</View>
  }

  return (
    <View
      className="rounded-[22px] border border-gray-200 bg-surface px-5 py-4"
      style={shadows.card}
    >
      {body}
    </View>
  )
}
