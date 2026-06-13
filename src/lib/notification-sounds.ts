import type { NotificationSoundId } from '@src/types/notification-preferences'

export type NotificationSoundOption = {
  id: NotificationSoundId
  label: string
  asset: number
}

export const NOTIFICATION_SOUNDS: NotificationSoundOption[] = [
  { id: 'default', label: 'Default', asset: require('../../assets/sounds/default.wav') },
  { id: 'chime', label: 'Chime', asset: require('../../assets/sounds/chime.wav') },
  { id: 'bell', label: 'Bell', asset: require('../../assets/sounds/bell.wav') },
  { id: 'ping', label: 'Ping', asset: require('../../assets/sounds/ping.wav') },
  { id: 'alert', label: 'Alert', asset: require('../../assets/sounds/alert.wav') },
  { id: 'soft', label: 'Soft', asset: require('../../assets/sounds/soft.wav') },
  { id: 'bright', label: 'Bright', asset: require('../../assets/sounds/bright.wav') },
  { id: 'pulse', label: 'Pulse', asset: require('../../assets/sounds/pulse.wav') },
]

export function getNotificationSound(id: NotificationSoundId): NotificationSoundOption {
  return NOTIFICATION_SOUNDS.find((s) => s.id === id) ?? NOTIFICATION_SOUNDS[0]
}

export function androidChannelIdForSound(id: NotificationSoundId): string {
  return `aishopy-${id}`
}

export function soundFileNameForId(id: NotificationSoundId): string {
  return id === 'default' ? 'default.wav' : `${id}.wav`
}
