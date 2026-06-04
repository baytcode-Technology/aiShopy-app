import { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cropImageToSquare, mimeFromUri, type ProductMediaItem } from '@src/lib/product-media'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
type Props = {
  visible: boolean
  item: ProductMediaItem | null
  onClose: () => void
  onUpdate: (item: ProductMediaItem) => void
  onDelete: () => void
  onSetCover?: () => void
}

export function ProductImagePreviewModal({
  visible,
  item,
  onClose,
  onUpdate,
  onDelete,
  onSetCover,
}: Props) {
  const insets = useSafeAreaInsets()
  const [cropping, setCropping] = useState(false)

  if (!item) return null

  const cropCenter = async () => {
    setCropping(true)
    try {
      const uri = await cropImageToSquare(item.uri)
      onUpdate({
        ...item,
        uri,
        pending: item.pending ?? {
          name: `crop-${Date.now()}.jpg`,
          type: mimeFromUri(uri),
        },
        remoteUrl: undefined,
      })
      showSuccess('Image cropped')
    } catch (e) {
      showError(e, 'Could not crop image')
    } finally {
      setCropping(false)
    }
  }

  const cropWithPicker = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      showError('Permission to access photos is required')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    onUpdate({
      ...item,
      uri: asset.uri,
      pending: {
        name: asset.fileName ?? `crop-${Date.now()}.jpg`,
        type: asset.mimeType ?? mimeFromUri(asset.uri),
      },
      remoteUrl: undefined,
    })
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-ink">
        <View
          className="flex-row items-center justify-between px-4 pb-3"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable onPress={onClose} hitSlop={12}>
            <View className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
              <FontAwesome name="times" size={20} color={Colors.brand.onPrimary} />
            </View>
          </Pressable>
          <Text className="text-brand-on-primary text-base font-bold">Preview</Text>
          <View className="w-10" />
        </View>

        <View className="flex-1 justify-center px-4">
          <Image source={{ uri: item.uri }} style={styles.preview} resizeMode="contain" />
          {cropping ? (
            <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-ink/50">
              <ActivityIndicator color={Colors.brand.onPrimary} size="large" />
            </View>
          ) : null}
        </View>

        <View
          className="flex-row items-center justify-center gap-3 px-4 pt-3 border-t border-white/10"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <PreviewAction icon="crop" label="Crop" onPress={cropWithPicker} disabled={cropping} />
          <PreviewAction
            icon="scissors"
            label="Square"
            onPress={cropCenter}
            disabled={cropping}
          />
          {onSetCover ? (
            <PreviewAction icon="star" label="Cover" onPress={onSetCover} disabled={cropping} />
          ) : null}
          <PreviewAction icon="trash" label="Delete" onPress={onDelete} danger disabled={cropping} />
        </View>
      </View>
    </Modal>
  )
}

function PreviewAction({
  icon,
  label,
  onPress,
  danger,
  disabled,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name']
  label: string
  onPress: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="items-center min-w-[72px]"
      style={disabled ? { opacity: 0.5 } : undefined}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-1.5"
        style={{ backgroundColor: danger ? '#FEE2E2' : 'rgba(255,255,255,0.15)' }}
      >
        <FontAwesome
          name={icon}
          size={18}
          color={danger ? '#EF4444' : Colors.brand.onPrimary}
        />
      </View>
      <Text
        className="text-xs font-semibold"
        style={{ color: danger ? '#FCA5A5' : Colors.brand.onPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    height: '100%',
    maxHeight: 520,
  },
})
