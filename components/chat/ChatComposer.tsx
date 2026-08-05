import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { Audio } from 'expo-av'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { IconButton } from '@/components/ui/IconButton'
import { showError } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { ChatChannel } from '@src/types/chat'

export type OutboundMediaPayload = {
  type: 'image' | 'audio' | 'video'
  uri: string
  name: string
  mimeType: string
  voice?: boolean
}

type Props = {
  draft: string
  onChangeDraft: (value: string) => void
  onSendText: () => void
  onSendMedia: (payload: OutboundMediaPayload) => Promise<void>
  disabled?: boolean
  channel: ChatChannel
}

function formatRecordingTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ChatComposer({
  draft,
  onChangeDraft,
  onSendText,
  onSendMedia,
  disabled = false,
  channel,
}: Props) {
  const recordingRef = useRef<Audio.Recording | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      void recordingRef.current?.stopAndUnloadAsync()
    }
  }, [])

  const pickMedia = useCallback(
    async (kind: 'image' | 'video') => {
      if (disabled || busy || channel !== 'whatsapp') return
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        showError('Permission required', 'Allow photo library access to send media')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: kind === 'image' ? ['images'] : ['videos'],
        quality: 0.85,
        videoMaxDuration: 120,
      })

      if (result.canceled || !result.assets[0]) return
      const asset = result.assets[0]
      setBusy(true)
      try {
        await onSendMedia({
          type: kind,
          uri: asset.uri,
          name: asset.fileName ?? `${kind}-${Date.now()}.${kind === 'image' ? 'jpg' : 'mp4'}`,
          mimeType: asset.mimeType ?? (kind === 'image' ? 'image/jpeg' : 'video/mp4'),
        })
      } finally {
        setBusy(false)
      }
    },
    [busy, channel, disabled, onSendMedia],
  )

  const showAttachMenu = useCallback(() => {
    if (channel !== 'whatsapp') return
    Alert.alert('Send media', undefined, [
      { text: 'Photo', onPress: () => void pickMedia('image') },
      { text: 'Video', onPress: () => void pickMedia('video') },
      { text: 'Cancel', style: 'cancel' },
    ])
  }, [channel, pickMedia])

  const startRecording = useCallback(async () => {
    if (disabled || busy || channel !== 'whatsapp') return
    try {
      const permission = await Audio.requestPermissionsAsync()
      if (!permission.granted) {
        showError('Permission required', 'Allow microphone access to send voice messages')
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      await recording.startAsync()
      recordingRef.current = recording
      setRecordSeconds(0)
      setIsRecording(true)
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    } catch (e: unknown) {
      showError('Could not start recording', e instanceof Error ? e.message : 'Unknown error')
    }
  }, [busy, channel, disabled])

  const cancelRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
    setRecordSeconds(0)
    try {
      await recordingRef.current?.stopAndUnloadAsync()
    } catch {
      // ignore
    }
    recordingRef.current = null
  }, [])

  const finishRecording = useCallback(async () => {
    if (!recordingRef.current) return
    setBusy(true)
    try {
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()
      recordingRef.current = null
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsRecording(false)
      setRecordSeconds(0)

      if (!uri) throw new Error('Recording file missing')

      await onSendMedia({
        type: 'audio',
        uri,
        name: `voice-${Date.now()}.m4a`,
        mimeType: 'audio/mp4',
        voice: true,
      })
    } catch (e: unknown) {
      showError('Failed to send voice message', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }, [onSendMedia])

  if (isRecording) {
    return (
      <View className="px-3 py-2.5 bg-surface border-t border-gray-200 gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <Text className="text-red-600 font-semibold tabular-nums">
              {formatRecordingTime(recordSeconds)}
            </Text>
          </View>
          <Text className="text-gray-500 text-sm">Recording voice message</Text>
        </View>
        <View className="flex-row items-center justify-end gap-3">
          <Pressable onPress={() => void cancelRecording()} className="px-3 py-2">
            <Text className="text-gray-600 font-semibold">Cancel</Text>
          </Pressable>
          <IconButton
            className="bg-brand-primary border-0 w-11 h-11"
            onPress={() => void finishRecording()}
          >
            <FontAwesome name="send" size={16} color={Colors.brand.onPrimary} />
          </IconButton>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-row items-end gap-2 px-3 py-2.5 bg-surface border-t border-gray-200">
      {channel === 'whatsapp' ? (
        <>
          <IconButton
            className="bg-gray-100 border border-gray-200 w-11 h-11"
            onPress={showAttachMenu}
            disabled={disabled || busy}
          >
            <FontAwesome name="paperclip" size={18} color={Colors.brand.primary} />
          </IconButton>
          <IconButton
            className="bg-gray-100 border border-gray-200 w-11 h-11"
            onPress={() => void startRecording()}
            disabled={disabled || busy}
          >
            <FontAwesome name="microphone" size={18} color={Colors.brand.primary} />
          </IconButton>
        </>
      ) : null}

      <TextInput
        className="flex-1 min-h-11 max-h-[100px] rounded-full border border-gray-200 bg-gray-100 px-4 py-2.5 text-[15px] text-ink"
        placeholder="Type a message"
        placeholderTextColor={Colors.text.muted}
        value={draft}
        onChangeText={onChangeDraft}
        multiline
        maxLength={2000}
        editable={!disabled && !busy}
      />

      <IconButton
        className="bg-brand-primary border-0 w-11 h-11"
        onPress={onSendText}
        disabled={disabled || busy}
      >
        <FontAwesome name="send" size={16} color={Colors.brand.onPrimary} />
      </IconButton>
    </View>
  )
}
