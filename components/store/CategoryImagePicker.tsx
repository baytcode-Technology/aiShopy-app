import { Image, Pressable, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Label, Muted } from '@/components/ui/Typography'
import { showError } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { PickedImage } from '@/components/store/ProductImagePicker'

type Props = {
  image: PickedImage | null
  onChange: (image: PickedImage | null) => void
  error?: string
}

function mimeFromUri(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

export function CategoryImagePicker({ image, onChange, error }: Props) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      showError('Permission to access photos is required')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.85,
    })

    if (result.canceled || !result.assets[0]) {
      return
    }

    const asset = result.assets[0]
    const uri = asset.uri
    onChange({
      id: `cat-${Date.now()}`,
      uri,
      name: asset.fileName ?? `category-${Date.now()}.jpg`,
      type: asset.mimeType ?? mimeFromUri(uri),
    })
  }

  return (
    <View className="gap-2">
      <Label>Category image *</Label>
      <Pressable onPress={pickImage}>
        <View
          className={`h-44 rounded-2xl border-2 border-dashed items-center justify-center overflow-hidden ${
            error ? 'border-gray-400 bg-gray-100' : 'border-gray-200 bg-gray-50'
          }`}
        >
          {image ? (
            <Image source={{ uri: image.uri }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center gap-2 px-4">
              <FontAwesome name="image" size={28} color={Colors.text.muted} />
              <Muted className="text-center">Tap to add category cover image</Muted>
            </View>
          )}
        </View>
      </Pressable>
      {image ? (
        <Pressable onPress={() => onChange(null)}>
          <Text className="text-xs font-semibold text-gray-600 underline">Remove image</Text>
        </Pressable>
      ) : null}
      {error ? (
        <Text className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
          {error}
        </Text>
      ) : null}
    </View>
  )
}
