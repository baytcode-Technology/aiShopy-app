import { useCallback, useEffect, useRef, useState } from 'react'
import { InteractionManager, Pressable, Text, TextInput, View } from 'react-native'
import { Audio } from 'expo-av'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { ChatAttachSheet } from '@/components/chat/ChatAttachSheet'
import { ChatMediaComposeBar } from '@/components/chat/ChatMediaComposeBar'
import { IconButton } from '@/components/ui/IconButton'
import { showError } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { ChatChannel } from '@src/types/chat'

const MAX_MEDIA_SELECTION = 10
const ATTACH_SHEET_CLOSE_MS = 350

export type OutboundMediaPayload = {
  type: 'image' | 'audio' | 'video'
  uri: string
  name: string
  mimeType: string
  voice?: boolean
  caption?: string
}

type Props = {
  draft: string
  onChangeDraft: (value: string) => void
  onSendText: () => void
  onSendMedia: (payload: OutboundMediaPayload | OutboundMediaPayload[]) => Promise<void>
  onOpenProductPicker?: () => void
  disabled?: boolean
  channel: ChatChannel
}

function formatRecordingTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function inferMimeType(uri: string, isVideo: boolean): string {
  const lower = uri.toLowerCase()
  if (isVideo) {
    if (lower.includes('.mov')) return 'video/quicktime'
    if (lower.includes('.3gp')) return 'video/3gpp'
    return 'video/mp4'
  }
  if (lower.includes('.png')) return 'image/png'
  if (lower.includes('.webp')) return 'image/webp'
  if (lower.includes('.heic') || lower.includes('.heif')) return 'image/heic'
  return 'image/jpeg'
}

function assetToPayload(
  asset: ImagePicker.ImagePickerAsset,
  index: number,
): OutboundMediaPayload {
  const isVideo = asset.type === 'video' || asset.mimeType?.startsWith('video/')
  const type = isVideo ? 'video' : 'image'
  const ext = isVideo ? 'mp4' : 'jpg'
  const mimeType = asset.mimeType?.trim() || inferMimeType(asset.uri, isVideo)
  return {
    type,
    uri: asset.uri,
    name: asset.fileName ?? `${type}-${Date.now()}-${index}.${ext}`,
    mimeType,
  }
}

function mergePendingMedia(
  current: OutboundMediaPayload[],
  incoming: OutboundMediaPayload[],
): OutboundMediaPayload[] {
  const merged = [...current, ...incoming]
  return merged.slice(0, MAX_MEDIA_SELECTION)
}

export function ChatComposer({
  draft,
  onChangeDraft,
  onSendText,
  onSendMedia,
  onOpenProductPicker,
  disabled = false,
  channel,
}: Props) {
  const recordingRef = useRef<Audio.Recording | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [busy, setBusy] = useState(false)
  const [attachOpen, setAttachOpen] = useState(false)
  const [pendingMedia, setPendingMedia] = useState<OutboundMediaPayload[]>([])
  const [mediaCaption, setMediaCaption] = useState('')

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      void recordingRef.current?.stopAndUnloadAsync()
    }
  }, [])

  const runAfterAttachSheetCloses = useCallback((action: () => void | Promise<void>) => {
    setAttachOpen(false)
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        void action()
      }, ATTACH_SHEET_CLOSE_MS)
    })
  }, [])

  const stageMedia = useCallback((payloads: OutboundMediaPayload[]) => {
    if (!payloads.length) return
    setPendingMedia((current) => mergePendingMedia(current, payloads))
  }, [])

  const clearPendingMedia = useCallback(() => {
    setPendingMedia([])
    setMediaCaption('')
  }, [])

  const pickMedia = useCallback(
    async (kind: 'image' | 'video') => {
      if (disabled || busy || channel !== 'whatsapp') return
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        showError('Permission required', 'Allow photo library access to send media')
        return
      }

      const remaining = MAX_MEDIA_SELECTION - pendingMedia.length
      if (remaining <= 0) {
        showError('Limit reached', `You can send up to ${MAX_MEDIA_SELECTION} items at a time`)
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: kind === 'image' ? ['images'] : ['videos'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.85,
        videoMaxDuration: 120,
      })

      if (result.canceled || !result.assets.length) return

      stageMedia(result.assets.map((asset, index) => assetToPayload(asset, index)))
    },
    [busy, channel, disabled, pendingMedia.length, stageMedia],
  )

  const captureFromCamera = useCallback(async () => {
    if (disabled || busy || channel !== 'whatsapp') return

    if (pendingMedia.length >= MAX_MEDIA_SELECTION) {
      showError('Limit reached', `You can send up to ${MAX_MEDIA_SELECTION} items at a time`)
      return
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      showError('Permission required', 'Allow camera access to take photos')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      exif: false,
    })

    if (result.canceled || !result.assets[0]) return

    stageMedia([assetToPayload(result.assets[0], 0)])
  }, [busy, channel, disabled, pendingMedia.length, stageMedia])

  const sendPendingMedia = useCallback(async () => {
    if (!pendingMedia.length || disabled || busy) return

    const caption = mediaCaption.trim()
    const payloads = pendingMedia.map((item, index) => ({
      ...item,
      caption:
        caption && index === pendingMedia.length - 1
          ? caption
          : undefined,
    }))

    clearPendingMedia()
    setBusy(true)
    try {
      await onSendMedia(payloads.length === 1 ? payloads[0] : payloads)
    } catch (e: unknown) {
      showError(e, 'Failed to send media')
      setPendingMedia(payloads)
      setMediaCaption(caption)
    } finally {
      setBusy(false)
    }
  }, [busy, clearPendingMedia, disabled, mediaCaption, onSendMedia, pendingMedia])

  const showAttachMenu = useCallback(() => {
    if (channel !== 'whatsapp' || disabled || busy) return
    setAttachOpen(true)
  }, [busy, channel, disabled])

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
      const recording = recordingRef.current
      const uri = recording.getURI()
      await recording.stopAndUnloadAsync()
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
        voice: false,
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

  if (pendingMedia.length > 0) {
    return (
      <>
        <ChatMediaComposeBar
          items={pendingMedia}
          caption={mediaCaption}
          onChangeCaption={setMediaCaption}
          onRemoveAt={(index) => {
            setPendingMedia((current) => current.filter((_, i) => i !== index))
          }}
          onCancel={clearPendingMedia}
          onSend={() => void sendPendingMedia()}
          onAddMore={showAttachMenu}
          disabled={disabled || busy}
        />

        <ChatAttachSheet
          visible={attachOpen}
          onClose={() => setAttachOpen(false)}
          onPickPhoto={() => runAfterAttachSheetCloses(() => pickMedia('image'))}
          onPickVideo={() => runAfterAttachSheetCloses(() => pickMedia('video'))}
          onOpenCamera={() => runAfterAttachSheetCloses(() => captureFromCamera())}
        />
      </>
    )
  }

  return (
    <>
      <View className="flex-row items-end gap-2 px-3 py-2.5">
        {channel === 'whatsapp' ? (
          <>
            <IconButton
              className="bg-gray-100 border border-gray-200 w-11 h-11"
              onPress={showAttachMenu}
              disabled={disabled || busy}
            >
              <FontAwesome name="paperclip" size={18} color={Colors.brand.primary} />
            </IconButton>
            {onOpenProductPicker ? (
              <IconButton
                className="bg-gray-100 border border-gray-200 w-11 h-11"
                onPress={onOpenProductPicker}
                disabled={disabled || busy}
              >
                <FontAwesome name="shopping-bag" size={17} color={Colors.brand.primary} />
              </IconButton>
            ) : null}
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

      <ChatAttachSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onPickPhoto={() => runAfterAttachSheetCloses(() => pickMedia('image'))}
        onPickVideo={() => runAfterAttachSheetCloses(() => pickMedia('video'))}
        onOpenCamera={() => runAfterAttachSheetCloses(() => captureFromCamera())}
      />
    </>
  )
}
