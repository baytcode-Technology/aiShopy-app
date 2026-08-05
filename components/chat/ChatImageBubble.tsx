import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { getWhatsAppMediaAuthHeaders } from '@src/lib/whatsapp-media'
import Colors from '@src/theme/colors'

const imageStyle = StyleSheet.create({
  image: { width: 224, height: 224, borderRadius: 12, backgroundColor: '#f3f4f6' },
  sticker: { width: 128, height: 128, borderRadius: 12, backgroundColor: '#f3f4f6' },
})

type Props = {
  uri: string
  variant: 'image' | 'sticker'
  onPress?: () => void
}

export function ChatImageBubble({ uri, variant, onPress }: Props) {
  const [source, setSource] = useState<{ uri: string; headers: Record<string, string> } | null>(
    null,
  )
  const [failed, setFailed] = useState(false)
  const style = variant === 'sticker' ? imageStyle.sticker : imageStyle.image

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
      <View style={style} className="items-center justify-center">
        <Text className="text-gray-500 text-sm px-3 text-center">Failed to load media</Text>
      </View>
    )
  }

  if (!source) {
    return (
      <View style={style} className="items-center justify-center">
        <ActivityIndicator color={Colors.brand.primary} />
      </View>
    )
  }

  const content = (
    <Image
      source={source}
      style={style}
      contentFit={variant === 'sticker' ? 'contain' : 'cover'}
      recyclingKey={uri}
      onError={() => setFailed(true)}
    />
  )

  if (variant === 'sticker' || !onPress) return content

  return <Pressable onPress={onPress}>{content}</Pressable>
}
