import { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, useWindowDimensions, View } from 'react-native'
import { Image } from 'expo-image'
import { Video, ResizeMode } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getWhatsAppMediaAuthHeaders } from '@src/lib/whatsapp-media'
import Colors from '@src/theme/colors'

type Props = {
  visible: boolean
  mode: 'image' | 'video' | null
  uri: string | null
  onClose: () => void
}

function extForMode(mode: 'image' | 'video'): string {
  return mode === 'image' ? 'jpg' : 'mp4'
}

export function ChatMediaViewerModal({ visible, mode, uri, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const [localUri, setLocalUri] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!visible || !uri || !mode) {
      setLocalUri(null)
      setFailed(false)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const headers = await getWhatsAppMediaAuthHeaders()
        const cachePath = `${FileSystem.cacheDirectory}wa-viewer-${Date.now()}.${extForMode(mode)}`
        const result = await FileSystem.downloadAsync(uri, cachePath, { headers })
        if (!cancelled) setLocalUri(result.uri)
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [visible, uri, mode])

  if (!mode || !uri) return null

  const mediaHeight = height - insets.top - insets.bottom - 80

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
        <Pressable
          onPress={onClose}
          className="self-start mx-4 my-3 px-3 py-2 rounded-full bg-white/10"
        >
          <Text className="text-white font-semibold">Close</Text>
        </Pressable>

        <View className="flex-1 items-center justify-center px-2">
          {failed ? (
            <Text className="text-white/80 text-center px-6">Failed to load media</Text>
          ) : !localUri ? (
            <ActivityIndicator color={Colors.brand.onPrimary} size="large" />
          ) : mode === 'image' ? (
            <Image
              source={{ uri: localUri }}
              style={{ width: width - 16, height: mediaHeight }}
              contentFit="contain"
              onError={() => setFailed(true)}
            />
          ) : (
            <Video
              source={{ uri: localUri }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              style={{ width: width - 16, height: mediaHeight }}
              shouldPlay
            />
          )}
        </View>
      </View>
    </Modal>
  )
}
