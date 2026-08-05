import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { Audio, Video, ResizeMode } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Caption } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
import { FormattedMessageText } from '@src/lib/parse-inline-markdown'
import { showError } from '@src/lib/toast'
import { getWhatsAppMediaAuthHeaders } from '@src/lib/whatsapp-media'
import type { ChatMessage } from '@src/types/chat'
import Colors from '@src/theme/colors'

type Props = {
  message: ChatMessage
  storeId?: number
}

function BubbleMeta({
  message,
  outgoing,
}: {
  message: ChatMessage
  outgoing: boolean
}) {
  return (
    <Caption className={cn('self-end', outgoing ? 'text-gray-400' : 'text-gray-400')}>
      {message.time}
      {outgoing && message.status ? ` · ${message.status}` : ''}
      {message.pending ? ' · sending…' : ''}
    </Caption>
  )
}

function AuthenticatedMediaImage({
  uri,
  className,
  contentFit = 'cover',
}: {
  uri: string
  className?: string
  contentFit?: 'cover' | 'contain'
}) {
  const [source, setSource] = useState<{ uri: string; headers: Record<string, string> } | null>(
    null
  )
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const headers = await getWhatsAppMediaAuthHeaders()
        if (!cancelled) setSource({ uri, headers })
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [uri])

  if (failed) {
    return (
      <View className="h-40 items-center justify-center bg-gray-100 rounded-xl">
        <Text className="text-gray-500 text-sm">Failed to load media</Text>
      </View>
    )
  }

  if (!source) {
    return (
      <View className="h-40 items-center justify-center bg-gray-100 rounded-xl">
        <ActivityIndicator color={Colors.brand.primary} />
      </View>
    )
  }

  return (
    <Image
      source={source}
      className={className}
      contentFit={contentFit}
      recyclingKey={uri}
      onError={() => setFailed(true)}
    />
  )
}

function WhatsAppVideoBubble({ uri }: { uri: string }) {
  const [playing, setPlaying] = useState(false)
  const [source, setSource] = useState<{ uri: string; headers: Record<string, string> } | null>(
    null
  )

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const headers = await getWhatsAppMediaAuthHeaders()
      if (!cancelled) setSource({ uri, headers })
    })()
    return () => {
      cancelled = true
    }
  }, [uri])

  if (!source) {
    return (
      <View className="w-56 h-40 items-center justify-center bg-gray-100 rounded-xl">
        <ActivityIndicator color={Colors.brand.primary} />
      </View>
    )
  }

  if (playing) {
    return (
      <Video
        source={source}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        className="w-56 h-40 rounded-xl bg-black"
        shouldPlay
      />
    )
  }

  return (
    <Pressable
      className="w-56 h-40 rounded-xl overflow-hidden bg-gray-900 items-center justify-center"
      onPress={() => setPlaying(true)}
    >
      <FontAwesome name="play-circle" size={48} color={Colors.brand.onPrimary} />
      <Text className="text-brand-on-primary text-xs mt-2">Tap to play</Text>
    </Pressable>
  )
}

function WhatsAppAudioBubble({ uri, label }: { uri: string; label: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const soundRef = useRef<Audio.Sound | null>(null)

  const togglePlay = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.stopAsync()
        await soundRef.current.unloadAsync()
        soundRef.current = null
        setIsPlaying(false)
        return
      }

      const headers = await getWhatsAppMediaAuthHeaders()
      const { sound } = await Audio.Sound.createAsync({ uri, headers })
      soundRef.current = sound
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return
        if (status.didJustFinish) {
          setIsPlaying(false)
          void sound.unloadAsync()
          soundRef.current = null
        }
      })
      await sound.playAsync()
      setIsPlaying(true)
    } catch (e: unknown) {
      showError('Failed to play audio', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [isPlaying, loading, uri])

  useEffect(() => {
    return () => {
      void soundRef.current?.unloadAsync()
    }
  }, [])

  return (
    <Pressable
      className="flex-row items-center gap-3 min-w-[180px]"
      onPress={() => void togglePlay()}
    >
      <View className="w-9 h-9 rounded-full bg-brand-primary/15 items-center justify-center">
        <FontAwesome
          name={isPlaying ? 'pause' : 'play'}
          size={14}
          color={Colors.brand.primary}
        />
      </View>
      <Text className="text-[15px] text-ink flex-1" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

function WhatsAppDocumentBubble({
  uri,
  label,
}: {
  uri: string
  label: string
}) {
  const openDocument = useCallback(async () => {
    try {
      const headers = await getWhatsAppMediaAuthHeaders()
      const ext = label.includes('.') ? label.split('.').pop() : 'bin'
      const fileUri = `${FileSystem.cacheDirectory}wa-doc-${Date.now()}.${ext}`
      const result = await FileSystem.downloadAsync(uri, fileUri, { headers })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri)
      } else {
        await Linking.openURL(result.uri)
      }
    } catch (e: unknown) {
      showError('Failed to open document', e instanceof Error ? e.message : 'Unknown error')
    }
  }, [label, uri])

  return (
    <Pressable className="flex-row items-center gap-3 min-w-[200px]" onPress={() => void openDocument()}>
      <View className="w-9 h-9 rounded-lg bg-brand-primary/15 items-center justify-center">
        <FontAwesome name="file-text-o" size={16} color={Colors.brand.primary} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-[15px] text-ink font-medium" numberOfLines={2}>
          {label}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">Tap to open</Text>
      </View>
    </Pressable>
  )
}

function TextBubbleContent({ message, outgoing }: { message: ChatMessage; outgoing: boolean }) {
  if (outgoing) {
    return (
      <Text className={cn('text-[15px] leading-[21px]', 'text-brand-on-primary')}>
        {message.text}
      </Text>
    )
  }

  return (
    <FormattedMessageText
      text={message.text}
      className="text-[15px] leading-[21px] text-ink"
    />
  )
}

export function MessageBubble({ message, storeId }: Props) {
  const outgoing = message.outgoing
  const type = message.type ?? 'text'
  const mediaUrl = message.mediaUrl

  if (type === 'reaction') {
    return (
      <View className="mb-3 self-center">
        <View className="rounded-full bg-surface border border-gray-200 px-4 py-2">
          <Text className="text-2xl text-center">{message.reactionEmoji ?? message.text}</Text>
          <BubbleMeta message={message} outgoing={outgoing} />
        </View>
      </View>
    )
  }

  const showMedia = Boolean(mediaUrl && storeId)

  return (
    <View
      className={cn('mb-3 max-w-[82%]', outgoing ? 'self-end' : 'self-start')}
    >
      <View
        className={cn(
          'rounded-2xl px-3.5 py-2.5 gap-1.5 overflow-hidden',
          outgoing ? 'bg-brand-primary' : 'bg-surface border border-gray-200'
        )}
      >
        {showMedia && (type === 'image' || type === 'sticker') ? (
          <>
            <AuthenticatedMediaImage
              uri={mediaUrl!}
              className={cn(
                'rounded-xl bg-gray-100',
                type === 'sticker' ? 'w-32 h-32' : 'w-56 h-56'
              )}
              contentFit={type === 'sticker' ? 'contain' : 'cover'}
            />
            {message.caption ? (
              outgoing ? (
                <Text className="text-[15px] leading-[21px] text-brand-on-primary">
                  {message.caption}
                </Text>
              ) : (
                <FormattedMessageText
                  text={message.caption}
                  className="text-[15px] leading-[21px] text-ink"
                />
              )
            ) : null}
          </>
        ) : showMedia && type === 'video' ? (
          <>
            <WhatsAppVideoBubble uri={mediaUrl!} />
            {message.caption ? (
              <FormattedMessageText
                text={message.caption}
                className={cn(
                  'text-[15px] leading-[21px]',
                  outgoing ? 'text-brand-on-primary' : 'text-ink'
                )}
              />
            ) : null}
          </>
        ) : showMedia && type === 'audio' ? (
          <WhatsAppAudioBubble uri={mediaUrl!} label={message.text} />
        ) : showMedia && type === 'document' ? (
          <WhatsAppDocumentBubble uri={mediaUrl!} label={message.caption || message.text} />
        ) : (
          <TextBubbleContent message={message} outgoing={outgoing} />
        )}

        {type !== 'reaction' ? <BubbleMeta message={message} outgoing={outgoing} /> : null}
      </View>
    </View>
  )
}
