import { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Video, ResizeMode } from 'expo-av'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getWhatsAppMediaAuthHeaders } from '@src/lib/whatsapp-media'
import Colors from '@src/theme/colors'

type Props = {
  visible: boolean
  mode: 'image' | 'video' | null
  uri: string | null
  onClose: () => void
}

export function ChatMediaViewerModal({ visible, mode, uri, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const [source, setSource] = useState<{ uri: string; headers: Record<string, string> } | null>(
    null,
  )
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!visible || !uri) {
      setSource(null)
      setFailed(false)
      return
    }
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
  }, [visible, uri])

  if (!mode || !uri) return null

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
          ) : !source ? (
            <ActivityIndicator color={Colors.brand.onPrimary} size="large" />
          ) : mode === 'image' ? (
            <ScrollView
              maximumZoomScale={4}
              minimumZoomScale={1}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
              centerContent
            >
              <Image
                source={source}
                style={{ width: '100%', height: 420 }}
                contentFit="contain"
                onError={() => setFailed(true)}
              />
            </ScrollView>
          ) : (
            <Video
              source={source}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              style={{ width: '100%', height: '80%' }}
              shouldPlay
            />
          )}
        </View>
      </View>
    </Modal>
  )
}
