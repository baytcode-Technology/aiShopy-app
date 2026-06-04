import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Caption, Label, Muted } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
import { mediaId, mimeFromUri, type ProductMediaItem } from '@src/lib/product-media'
import { showError } from '@src/lib/toast'
import Colors from '@src/theme/colors'

type Props = {
  items: ProductMediaItem[]
  thumbnailId: string | null
  onChange: (items: ProductMediaItem[], thumbnailId: string | null) => void
  error?: string
}

export function ProductMediaEditor({ items, thumbnailId, onChange, error }: Props) {
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
      selectionLimit: Math.max(1, 10 - items.length),
    })

    if (result.canceled || !result.assets.length) return

    const added: ProductMediaItem[] = result.assets.map((asset, index) => ({
      id: mediaId(),
      uri: asset.uri,
      pending: {
        name: asset.fileName ?? `product-${Date.now()}-${index}.jpg`,
        type: asset.mimeType ?? mimeFromUri(asset.uri),
      },
    }))

    const merged = [...items, ...added].slice(0, 10)
    const thumb = thumbnailId ?? merged[0]?.id ?? null
    onChange(merged, thumb)
  }

  const removeImage = (id: string) => {
    const merged = items.filter((img) => img.id !== id)
    let thumb = thumbnailId
    if (thumb === id) {
      thumb = merged[0]?.id ?? null
    }
    onChange(merged, thumb)
  }

  const setThumbnail = (id: string) => {
    onChange(items, id)
  }

  return (
    <View className="gap-2">
      <Label>Product images</Label>
      <Muted className="text-xs">
        Add or remove images. Tap an image to set it as thumbnail.
      </Muted>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0">
        <Pressable
          className="w-[88px] h-[88px] rounded-xl border border-dashed border-ink items-center justify-center mr-2.5 gap-1"
          onPress={pickImages}
        >
          <FontAwesome name="plus" size={24} color={Colors.brand.primary} />
          <Text className="text-xs font-semibold text-ink">Add</Text>
        </Pressable>
        {items.map((img) => {
          const isThumb = thumbnailId === img.id
          return (
            <View key={img.id} style={styles.tileWrap}>
              <Pressable
                style={[
                  styles.tile,
                  isThumb ? styles.tileThumb : styles.tileDefault,
                ]}
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
    backgroundColor: '#3EB056',
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
