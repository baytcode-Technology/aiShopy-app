import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { IconButton } from '@/components/ui/IconButton'
import { Caption, Label, Muted } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
import { showError } from '@src/lib/toast'
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
    <View className="gap-2">
      <Label>Product images *</Label>
      <Muted className="text-xs">Add at least one image. Tap an image to set it as thumbnail.</Muted>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0">
        <Pressable
          className="w-[88px] h-[88px] rounded-xl border border-dashed border-ink items-center justify-center mr-2.5 gap-1"
          onPress={pickImages}
        >
          <FontAwesome name="plus" size={24} color={Colors.brand.primary} />
          <Text className="text-xs font-semibold text-ink">Add</Text>
        </Pressable>
        {images.map((img) => {
          const isThumb = thumbnailId === img.id
          return (
            <Pressable
              key={img.id}
              className={cn(
                'w-[88px] h-[88px] mr-2.5 rounded-xl overflow-hidden border-2',
                isThumb ? 'border-ink' : 'border-transparent'
              )}
              onPress={() => setThumbnail(img.id)}
            >
              <Image source={{ uri: img.uri }} className="w-full h-full" />
              {isThumb ? (
                <View className="absolute bottom-0 left-0 right-0 bg-brand-primary py-0.5">
                  <Text className="text-brand-on-primary text-[9px] font-bold text-center uppercase">
                    Thumbnail
                  </Text>
                </View>
              ) : null}
              <IconButton
                size="sm"
                className="absolute top-1 right-1 w-7 h-7 border-0 bg-surface"
                onPress={() => removeImage(img.id)}
              >
                <FontAwesome name="times-circle" size={18} color={Colors.brand.primary} />
              </IconButton>
            </Pressable>
          )
        })}
      </ScrollView>
      {error ? <Caption className="text-danger mt-0.5">{error}</Caption> : null}
    </View>
  )
}
