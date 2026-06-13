import { useEffect, useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Audio } from 'expo-av'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  getNotificationSound,
  NOTIFICATION_SOUNDS,
} from '@src/lib/notification-sounds'
import type { NotificationSoundId } from '@src/types/notification-preferences'
import Colors from '@src/theme/colors'

type Props = {
  value: NotificationSoundId
  onChange: (id: NotificationSoundId) => void
}

export function NotificationSoundPicker({ value, onChange }: Props) {
  const soundRef = useRef<Audio.Sound | null>(null)

  useEffect(() => {
    return () => {
      void soundRef.current?.unloadAsync()
    }
  }, [])

  const preview = async (id: NotificationSoundId) => {
    onChange(id)

    try {
      await soundRef.current?.unloadAsync()
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
      const option = getNotificationSound(id)
      const { sound } = await Audio.Sound.createAsync(option.asset, { shouldPlay: true })
      soundRef.current = sound
    } catch {
      // Preview is best-effort on simulators.
    }
  }

  return (
    <View className="gap-1">
      {NOTIFICATION_SOUNDS.map((option) => {
        const selected = value === option.id
        return (
          <Pressable
            key={option.id}
            onPress={() => void preview(option.id)}
            className="flex-row items-center gap-3 py-3 px-1"
          >
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                selected ? 'border-ink' : 'border-gray-300'
              }`}
            >
              {selected ? <View className="w-2.5 h-2.5 rounded-full bg-ink" /> : null}
            </View>
            <Text className={`flex-1 text-[15px] ${selected ? 'font-bold text-ink' : 'text-gray-700'}`}>
              {option.label}
            </Text>
            <FontAwesome name="volume-up" size={14} color={Colors.text.muted} />
          </Pressable>
        )
      })}

      <View className="flex-row items-center gap-3 py-3 px-1 opacity-50">
        <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
        <Text className="flex-1 text-[15px] text-gray-500">Custom sound — coming soon</Text>
      </View>
    </View>
  )
}
