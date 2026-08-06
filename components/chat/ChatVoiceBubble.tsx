import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { cn } from '@src/lib/cn'
import { showError } from '@src/lib/toast'
import { getWhatsAppMediaAuthHeaders } from '@src/lib/whatsapp-media'
import Colors from '@src/theme/colors'

const BAR_COUNT = 28
const BAR_HEIGHTS = [6, 10, 14, 8, 16, 12, 18, 10, 14, 8, 16, 12, 20, 10, 14, 8, 12, 16, 10, 18, 8, 14, 12, 16, 10, 14, 8, 12]

function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function extFromUri(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.includes('.ogg')) return 'ogg'
  if (lower.includes('.mp3')) return 'mp3'
  if (lower.includes('.aac')) return 'aac'
  return 'm4a'
}

type Props = {
  uri: string
  outgoing: boolean
}

export function ChatVoiceBubble({ uri, outgoing }: Props) {
  const soundRef = useRef<Audio.Sound | null>(null)
  const cachedUriRef = useRef<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [positionMs, setPositionMs] = useState(0)
  const [durationMs, setDurationMs] = useState(0)

  const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0
  const activeBars = useMemo(
    () => Math.max(1, Math.round(progress * BAR_COUNT)),
    [progress],
  )

  const unload = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync()
      soundRef.current = null
    }
  }, [])

  useEffect(() => {
    cachedUriRef.current = null
    void unload()
    setIsPlaying(false)
    setPositionMs(0)
    setDurationMs(0)
  }, [uri, unload])

  useEffect(() => {
    return () => {
      void unload()
    }
  }, [unload])

  const resolvePlayableUri = useCallback(async (): Promise<string> => {
    if (cachedUriRef.current) return cachedUriRef.current
    if (uri.startsWith('file://')) {
      cachedUriRef.current = uri
      return uri
    }
    const headers = await getWhatsAppMediaAuthHeaders()
    const cachePath = `${FileSystem.cacheDirectory}wa-voice-${Date.now()}.${extFromUri(uri)}`
    const result = await FileSystem.downloadAsync(uri, cachePath, { headers })
    cachedUriRef.current = result.uri
    return result.uri
  }, [uri])

  const togglePlay = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync()
        setIsPlaying(false)
        return
      }

      if (soundRef.current) {
        await soundRef.current.playAsync()
        setIsPlaying(true)
        return
      }

      const playableUri = await resolvePlayableUri()
      const { sound } = await Audio.Sound.createAsync({ uri: playableUri })
      soundRef.current = sound
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return
        setDurationMs(status.durationMillis ?? 0)
        setPositionMs(status.positionMillis ?? 0)
        if (status.didJustFinish) {
          setIsPlaying(false)
          setPositionMs(0)
          void unload()
        }
      })
      await sound.playAsync()
      setIsPlaying(true)
    } catch (e: unknown) {
      showError('Failed to play voice message', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [isPlaying, loading, resolvePlayableUri, unload])

  const seekToRatio = useCallback(
    async (ratio: number) => {
      if (!soundRef.current || durationMs <= 0) return
      const next = Math.max(0, Math.min(durationMs, ratio * durationMs))
      await soundRef.current.setPositionAsync(next)
      setPositionMs(next)
    },
    [durationMs],
  )

  return (
    <View className="flex-row items-center gap-2.5 min-w-[240px] py-1">
      <Pressable
        onPress={() => void togglePlay()}
        className={cn(
          'w-10 h-10 rounded-full items-center justify-center',
          outgoing ? 'bg-brand-on-primary/20' : 'bg-brand-primary/15',
        )}
      >
        {loading ? (
          <ActivityIndicator size="small" color={outgoing ? Colors.brand.onPrimary : Colors.brand.primary} />
        ) : (
          <FontAwesome
            name={isPlaying ? 'pause' : 'play'}
            size={16}
            color={outgoing ? Colors.brand.onPrimary : Colors.brand.primary}
            style={{ marginLeft: isPlaying ? 0 : 2 }}
          />
        )}
      </Pressable>

      <Pressable
        className="flex-1 flex-row items-end gap-[2px] h-7"
        onPress={(e) => {
          const ratio = e.nativeEvent.locationX / 180
          void seekToRatio(ratio)
        }}
      >
        {BAR_HEIGHTS.map((h, i) => (
          <View
            key={i}
            style={{ height: h, width: 3, borderRadius: 2 }}
            className={cn(
              i < activeBars
                ? outgoing
                  ? 'bg-brand-on-primary'
                  : 'bg-brand-primary'
                : outgoing
                  ? 'bg-brand-on-primary/35'
                  : 'bg-gray-300',
            )}
          />
        ))}
      </Pressable>

      <View className="flex-row items-center gap-1">
        <FontAwesome
          name="microphone"
          size={12}
          color={outgoing ? Colors.brand.onPrimary : Colors.text.muted}
        />
        <Text
          className={cn(
            'text-xs tabular-nums min-w-[36px]',
            outgoing ? 'text-brand-on-primary/90' : 'text-gray-500',
          )}
        >
          {durationMs > 0 ? formatMs(isPlaying ? positionMs : durationMs) : '0:00'}
        </Text>
      </View>
    </View>
  )
}
