import { Image, Pressable, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Label, Muted } from '@/components/ui/Typography'
import { showError } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { PickedImage } from '@/components/store/ProductImagePicker'

type Props = {
  image: PickedImage | null
  remoteUrl?: string | null
  storeName?: string
  onChange: (image: PickedImage | null) => void
  error?: string
  label?: string
  variant?: 'square' | 'round'
}

function mimeFromUri(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

function initials(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || 'S'
}

export function StoreLogoPicker({
  image,
  remoteUrl,
  storeName = '',
  onChange,
  error,
  label = 'Store logo',
  variant = 'square',
}: Props) {
  const previewUri = image?.uri ?? remoteUrl ?? null
  const rounded = variant === 'round' ? 'rounded-full' : 'rounded-2xl'

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
    onChange({
      id: `logo-${Date.now()}`,
      uri: asset.uri,
      name: asset.fileName ?? `store-logo-${Date.now()}.jpg`,
      type: asset.mimeType ?? mimeFromUri(asset.uri),
    })
  }

  return (
    <View className="gap-2">
      {label ? <Label>{label}</Label> : null}
      <Pressable onPress={pickImage}>
        <View
          className={`w-24 h-24 ${rounded} border-2 border-dashed items-center justify-center overflow-hidden self-center ${
            error ? 'border-gray-400 bg-gray-100' : 'border-gray-200 bg-gray-50'
          }`}
        >
          {previewUri ? (
            <Image source={{ uri: previewUri }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-2xl font-extrabold text-gray-400">{initials(storeName)}</Text>
          )}
        </View>
      </Pressable>
      <Muted className="text-xs text-center">Tap to choose a logo image</Muted>
      {image && remoteUrl ? (
        <Pressable onPress={() => onChange(null)} className="self-center">
          <Text className="text-xs font-semibold text-gray-600 underline">Use current logo</Text>
        </Pressable>
      ) : null}
      {error ? (
        <Text className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide text-center">
          {error}
        </Text>
      ) : null}
    </View>
  )
}

export function StoreLogoEditLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-1.5 mt-2">
      <FontAwesome name="pencil" size={12} color={Colors.brand.primary} />
      <Text className="text-xs font-bold text-ink">Edit logo</Text>
    </Pressable>
  )
}
