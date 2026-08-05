import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { getWhatsAppMediaAuthHeaders } from '@src/lib/whatsapp-media'
import Colors from '@src/theme/colors'

const videoStyle = StyleSheet.create({
  video: { width: 224, height: 160, borderRadius: 12, backgroundColor: '#111827' },
})

type Props = {
  uri: string
  onPress: () => void
}

export function ChatVideoBubble({ uri, onPress }: Props) {
  const [source, setSource] = useState<{ uri: string; headers: Record<string, string> } | null>(
    null,
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
      <View style={videoStyle.video} className="items-center justify-center">
        <ActivityIndicator color={Colors.brand.primary} />
      </View>
    )
  }

  return (
    <Pressable style={videoStyle.video} onPress={onPress} className="overflow-hidden">
      <Video
        source={source}
        style={videoStyle.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isMuted
      />
      <View className="absolute inset-0 items-center justify-center bg-black/30">
        <FontAwesome name="play-circle" size={48} color={Colors.brand.onPrimary} />
      </View>
      <View className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/50">
        <Text className="text-white text-[10px]">Video</Text>
      </View>
    </Pressable>
  )
}
