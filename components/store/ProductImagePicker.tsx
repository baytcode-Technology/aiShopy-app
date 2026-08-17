import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Caption, Label, Muted } from '@/components/ui/Typography'
import {
  MAX_PRODUCT_IMAGES,
  productImageLimitMessage,
  remainingProductImageSlots,
} from '@src/lib/product-media'
import { showError, showWarning } from '@src/lib/toast'
import Colors from '@src/theme/colors'

export type PickedImage = {
  id: string
  uri: string
  name: string
  type: string
}

type Props = {
  images: PickedImage[]
  thumbnailId: string | null
  onChange: (images: PickedImage[], thumbnailId: string | null) => void
  error?: string
}

function mimeFromUri(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

export function ProductImagePicker({ images, thumbnailId, onChange, error }: Props) {
  const pickImages = async () => {
    const fullMessage = productImageLimitMessage(images.length, 0)
    if (fullMessage) {
      showWarning('Image limit reached', fullMessage)
      return
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      showError('Permission to access photos is required')
      return
    }

    const remaining = remainingProductImageSlots(images.length)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: remaining,
    })

    if (result.canceled || !result.assets.length) {
      return
    }

    const limitMessage = productImageLimitMessage(images.length, result.assets.length)
    if (limitMessage) {
      showWarning('Image limit reached', limitMessage)
      return
    }

    const next: PickedImage[] = result.assets.map((asset, index) => {
      const uri = asset.uri
      const name = asset.fileName ?? `product-${Date.now()}-${index}.jpg`
      return {
        id: `${Date.now()}-${index}`,
        uri,
        name,
        type: asset.mimeType ?? mimeFromUri(uri),
      }
    })

    const merged = [...images, ...next]
    const thumb = thumbnailId ?? merged[0]?.id ?? null
    onChange(merged, thumb)
  }

  const removeImage = (id: string) => {
    const merged = images.filter((img) => img.id !== id)
    let thumb = thumbnailId
    if (thumb === id) {
      thumb = merged[0]?.id ?? null
    }
    onChange(merged, thumb)
  }

  const setThumbnail = (id: string) => {
    onChange(images, id)
  }

  return (
    <View className="gap-2">
      <Label>Product images *</Label>
      <Muted className="text-xs">
        Add up to {MAX_PRODUCT_IMAGES} images. Tap an image to set it as thumbnail.
      </Muted>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0">
        {images.length < MAX_PRODUCT_IMAGES ? (
          <Pressable
            className="w-[88px] h-[88px] rounded-xl border border-dashed border-ink items-center justify-center mr-2.5 gap-1"
            onPress={pickImages}
          >
            <FontAwesome name="plus" size={24} color={Colors.brand.primary} />
            <Text className="text-xs font-semibold text-ink">Add</Text>
          </Pressable>
        ) : null}
        {images.map((img) => {
          const isThumb = thumbnailId === img.id
          return (
            <View key={img.id} style={styles.tileWrap}>
              <Pressable
                style={[styles.tile, isThumb ? styles.tileThumb : styles.tileDefault]}
                onPress={() => setThumbnail(img.id)}
              >
                <Image source={{ uri: img.uri }} style={styles.tileImage} />
                {isThumb ? (
                  <View style={styles.thumbBar}>
                    <Text style={styles.thumbBarText}>Thumbnail</Text>
                  </View>
                ) : null}
              </Pressable>
              <Pressable
                style={styles.removeBtn}
                onPress={() => removeImage(img.id)}
                hitSlop={8}
                accessibilityLabel="Remove image"
              >
                <FontAwesome name="times-circle" size={22} color="#EF4444" />
              </Pressable>
            </View>
          )
        })}
      </ScrollView>
      {error ? <Caption className="text-danger mt-0.5">{error}</Caption> : null}
    </View>
  )
}

const TILE = 88

const styles = StyleSheet.create({
  tileWrap: {
    width: TILE,
    height: TILE,
    marginRight: 10,
    position: 'relative',
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
  },
  tileDefault: {
    borderColor: 'transparent',
  },
  tileThumb: {
    borderColor: '#0A0A0B',
  },
  tileImage: {
    width: TILE,
    height: TILE,
  },
  thumbBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0A0B',
    paddingVertical: 2,
  },
  thumbBarText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
    elevation: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
})
