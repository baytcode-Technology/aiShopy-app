import { useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, Pressable, Switch, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryImagePicker } from '@/components/store/CategoryImagePicker'
import type { PickedImage } from '@/components/store/ProductImagePicker'
import { Button } from '@/components/ui/Button'
import { SleekModal } from '@/components/ui/Modal'
import { Caption } from '@/components/ui/Typography'
import { updateCategory } from '@src/api/categories'
import { uploadProductImages } from '@src/api/uploads'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

function isRemoteUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://')
}

function toPickedImage(imageUrl: string): PickedImage {
  return {
    id: 'existing',
    uri: imageUrl,
    name: 'cover.jpg',
    type: 'image/jpeg',
  }
}

type Props = {
  visible: boolean
  category: Category
  storeId: number
  productCount: number
  onClose: () => void
  onUpdated: (category: Category) => void
  onManageProducts: () => void
}

export function EditCategoryModal({
  visible,
  category,
  storeId,
  productCount,
  onClose,
  onUpdated,
  onManageProducts,
}: Props) {
  const [name, setName] = useState(category.name)
  const [isActive, setIsActive] = useState(category.is_active)
  const [description, setDescription] = useState(category.description ?? '')
  const [image, setImage] = useState<PickedImage | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!visible) return
    setName(category.name)
    setIsActive(category.is_active)
    setDescription(category.description ?? '')
    setImage(
      category.image_url?.trim() ? toPickedImage(category.image_url) : null
    )
  }, [
    visible,
    category.id,
    category.name,
    category.is_active,
    category.description,
    category.image_url,
  ])

  const handleClose = () => {
    if (!saving) onClose()
  }

  const save = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      showError('Category name is required')
      return
    }

    setSaving(true)
    try {
      const payload: Parameters<typeof updateCategory>[1] = {
        name: trimmedName,
        is_active: isActive,
        description: description.trim() || null,
      }

      if (image && !isRemoteUri(image.uri)) {
        const [imageUrl] = await uploadProductImages(storeId, [
          { uri: image.uri, name: image.name, type: image.type },
        ])
        payload.image_url = imageUrl
      }

      const res = await updateCategory(category.id, payload)
      onUpdated(res.data)
      showSuccess('Category updated')
      onClose()
    } catch (e) {
      showError(e, 'Could not update category')
    } finally {
      setSaving(false)
    }
  }

  const countLabel = productCount === 1 ? '1 product' : `${productCount} products`

  return (
    <SleekModal
      isOpen={visible}
      onClose={handleClose}
      title="Edit category"
      subtitle={category.name}
      footer={
        saving ? (
          <View className="py-4 items-center">
            <ActivityIndicator color={Colors.brand.primary} />
          </View>
        ) : (
          <Button label="Save" onPress={save} />
        )
      }
    >
      <CategoryImagePicker
        image={image}
        onChange={setImage}
        allowRemove={false}
        label="Cover image"
      />

      <Field label="Category name">
        <TextInput
          className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-lg font-bold text-ink"
          value={name}
          onChangeText={setName}
          selectionColor={Colors.brand.primary}
          editable={!saving}
        />
      </Field>

      <View className="flex-row items-center justify-between py-1 border border-gray-200 rounded-xl bg-gray-50 px-3">
        <View className="flex-1 pr-3">
          <Text className="text-[13px] font-bold text-ink">Status</Text>
          <Caption className="mt-0.5">
            {isActive ? 'Active on storefront' : 'Unlisted (hidden)'}
          </Caption>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ false: '#E4E4E7', true: '#3EB056' }}
          thumbColor="#FFFFFF"
          disabled={saving}
        />
      </View>

      <Field label="Description">
        <TextInput
          className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-[15px] text-ink min-h-[88px]"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          placeholder="Optional description…"
          placeholderTextColor={Colors.text.muted}
          selectionColor={Colors.brand.primary}
          editable={!saving}
        />
      </Field>

      <Pressable
        onPress={() => {
          onClose()
          onManageProducts()
        }}
        disabled={saving}
        className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 active:bg-gray-100"
      >
        <View className="flex-1 pr-3">
          <Text className="text-[13px] font-bold text-ink">Products</Text>
          <Caption className="mt-0.5">{countLabel} in this category</Caption>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-[12px] font-bold text-ink">Add / remove</Text>
          <FontAwesome name="chevron-right" size={12} color={Colors.brand.primary} />
        </View>
      </Pressable>

    </SleekModal>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text className="text-[12px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </Text>
      {children}
    </View>
  )
}
