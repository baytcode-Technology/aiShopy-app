import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { showError } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import { palette } from '@src/theme/palette'

function mimeFromUri(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

export type PickedVariantImage = {
  uri: string
  name: string
  type: string
}

export async function pickVariantImageFromGallery(): Promise<PickedVariantImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) {
    showError('Permission to access photos is required')
    return null
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    quality: 0.85,
  })

  if (result.canceled || !result.assets[0]) return null

  const asset = result.assets[0]
  const uri = asset.uri
  return {
    uri,
    name: asset.fileName ?? `variant-${Date.now()}.jpg`,
    type: asset.mimeType ?? mimeFromUri(uri),
  }
}

type Props = {
  imageUri?: string | null
  size?: number
  loading?: boolean
  disabled?: boolean
  onPick: (file: PickedVariantImage) => void
  onRemove?: () => void
  /** When set, tapping an existing image triggers this instead of opening the gallery. */
  onImagePress?: () => void
}

export function VariantImageTile({
  imageUri,
  size = 44,
  loading,
  disabled,
  onPick,
  onRemove,
  onImagePress,
}: Props) {
  const pickImage = async () => {
    if (disabled || loading) return
    const file = await pickVariantImageFromGallery()
    if (file) onPick(file)
  }

  const handlePress = () => {
    if (disabled || loading) return
    if (imageUri && onImagePress) {
      onImagePress()
      return
    }
    pickImage()
  }

  return (
    <View style={{ width: size, height: size }}>
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={[styles.tile, { width: size, height: size, borderRadius: size * 0.27 }]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View className="items-center justify-center flex-1 bg-gray-50">
            <FontAwesome name="plus" size={size * 0.4} color={Colors.text.muted} />
          </View>
        )}
        {loading ? (
          <View style={[styles.overlay, { borderRadius: size * 0.27 }]}>
            <ActivityIndicator size="small" color={Colors.brand.primary} />
          </View>
        ) : null}
      </Pressable>

      {imageUri && onRemove && !onImagePress && !loading ? (
        <Pressable
          onPress={onRemove}
          disabled={disabled}
          hitSlop={6}
          style={[styles.removeBtn, { top: -4, right: -4 }]}
        >
          <Text className="text-[10px] font-bold text-gray-500">✕</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  tile: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.gray200,
    backgroundColor: palette.gray50,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.gray100,
    borderWidth: 1,
    borderColor: palette.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
