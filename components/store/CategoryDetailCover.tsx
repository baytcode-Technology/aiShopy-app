import { useState } from 'react'
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryImagePreviewModal } from '@/components/store/CategoryImagePreviewModal'
import { IconButton } from '@/components/ui/IconButton'
import { updateCategory } from '@src/api/categories'
import { uploadProductImages } from '@src/api/uploads'
import { categoryHasImage } from '@src/lib/category-image'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

function mimeFromUri(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

type Props = {
  category: Category
  storeId: number
  onUpdated: (category: Category) => void
}

export function CategoryDetailCover({ category, storeId, onUpdated }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [replacing, setReplacing] = useState(false)

  const replaceImage = async () => {
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
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    setReplacing(true)
    try {
      const [imageUrl] = await uploadProductImages(storeId, [
        {
          uri: asset.uri,
          name: asset.fileName ?? `category-${Date.now()}.jpg`,
          type: asset.mimeType ?? mimeFromUri(asset.uri),
        },
      ])
      const res = await updateCategory(category.id, { image_url: imageUrl })
      onUpdated(res.data)
      showSuccess('Cover image updated')
    } catch (e) {
      showError(e, 'Could not update cover image')
    } finally {
      setReplacing(false)
    }
  }

  return (
    <>
      <View className="relative mb-6 border border-gray-200 rounded-[20px] bg-surface overflow-hidden">
        {replacing ? (
          <View
            className="absolute inset-0 z-20 items-center justify-center rounded-[20px]"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.62)' }}
          >
            <ActivityIndicator size="small" color={Colors.brand.primary} />
          </View>
        ) : null}

        <View className="px-4 pt-4 pb-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[15px] font-semibold text-ink">Cover image</Text>
            <IconButton
              size="sm"
              onPress={replaceImage}
              disabled={replacing}
              accessibilityLabel="Replace cover image"
            >
              <FontAwesome name="refresh" size={14} color={Colors.brand.primary} />
            </IconButton>
          </View>

          <Pressable
            onPress={() => categoryHasImage(category.image_url) && setPreviewOpen(true)}
            disabled={!categoryHasImage(category.image_url)}
          >
            <View className="rounded-2xl overflow-hidden h-[180px] bg-gray-100 border border-gray-200">
              {categoryHasImage(category.image_url) ? (
                <Image
                  source={{ uri: category.image_url! }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center gap-2">
                  <FontAwesome name="folder-open-o" size={36} color={Colors.text.muted} />
                  <Text className="text-[13px] font-medium text-gray-400">No cover image</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      </View>

      <CategoryImagePreviewModal
        visible={previewOpen}
        imageUri={category.image_url}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  )
}
