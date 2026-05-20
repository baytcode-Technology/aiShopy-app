import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { theme } from '@src/theme/colors'
import { showError } from '@src/lib/toast'

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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      showError('Permission to access photos is required')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 10,
    })

    if (result.canceled || !result.assets.length) {
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

    const merged = [...images, ...next].slice(0, 10)
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
    <View style={styles.wrap}>
      <Text style={styles.label}>Product images *</Text>
      <Text style={styles.hint}>Add at least one image. Tap an image to set it as thumbnail.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <Pressable style={styles.addBtn} onPress={pickImages}>
          <FontAwesome name="plus" size={24} color={theme.black} />
          <Text style={styles.addText}>Add</Text>
        </Pressable>
        {images.map((img) => {
          const isThumb = thumbnailId === img.id
          return (
            <Pressable
              key={img.id}
              style={[styles.thumbWrap, isThumb && styles.thumbWrapActive]}
              onPress={() => setThumbnail(img.id)}
            >
              <Image source={{ uri: img.uri }} style={styles.thumb} />
              {isThumb ? (
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbBadgeText}>Thumbnail</Text>
                </View>
              ) : null}
              <Pressable style={styles.removeBtn} onPress={() => removeImage(img.id)} hitSlop={8}>
                <FontAwesome name="times-circle" size={20} color={theme.black} />
              </Pressable>
            </Pressable>
          )
        })}
      </ScrollView>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  hint: { fontSize: 12, color: theme.gray600 },
  scroll: { flexGrow: 0 },
  addBtn: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.black,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    gap: 4,
  },
  addText: { fontSize: 12, fontWeight: '600', color: theme.black },
  thumbWrap: {
    width: 88,
    height: 88,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbWrapActive: {
    borderColor: theme.black,
  },
  thumb: { width: '100%', height: '100%' },
  thumbBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.black,
    paddingVertical: 2,
  },
  thumbBadgeText: {
    color: theme.white,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.white,
    borderRadius: 10,
  },
  error: { fontSize: 13, color: theme.gray600 },
})
