import { useState } from 'react'
import { Switch, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label, Muted } from '@/components/ui/Typography'
import { FormModal } from '@/components/store/FormModal'
import { CategoryImagePicker } from '@/components/store/CategoryImagePicker'
import { CategoryPicker } from '@/components/store/CategoryPicker'
import type { PickedImage } from '@/components/store/ProductImagePicker'
import { createCategory } from '@src/api/categories'
import { uploadProductImages } from '@src/api/uploads'
import { showError, showSuccess } from '@src/lib/toast'
import type { Category } from '@src/types/category'

type Props = {
  visible: boolean
  storeId: string
  categories?: Category[]
  onClose: () => void
  onCreated: () => void
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export function CreateCategoryModal({
  visible,
  storeId,
  categories = [],
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [parentId, setParentId] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [image, setImage] = useState<PickedImage | null>(null)
  const [imageError, setImageError] = useState('')
  const [loading, setLoading] = useState(false)

  const onNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  const reset = () => {
    setName('')
    setSlug('')
    setSlugTouched(false)
    setParentId(null)
    setIsActive(true)
    setImage(null)
    setImageError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    const trimmedName = name.trim()
    const trimmedSlug = slug.trim().toLowerCase()

    if (!trimmedName) {
      showError('Category name is required')
      return
    }
    if (!trimmedSlug) {
      showError('Category slug is required')
      return
    }
    if (!image) {
      setImageError('Category image is required')
      return
    }
    setLoading(true)
    try {
      const [imageUrl] = await uploadProductImages(storeId, [
        { uri: image.uri, name: image.name, type: image.type },
      ])

      const res = await createCategory({
        store_id: storeId,
        name: trimmedName,
        slug: trimmedSlug,
        image_url: imageUrl,
        parent_id: parentId ?? undefined,
        is_active: isActive,
      })
      showSuccess(res.message)
      reset()
      onCreated()
      onClose()
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormModal
      visible={visible}
      title="New category"
      onClose={handleClose}
      footer={<Button label="Create category" loading={loading} onPress={handleSubmit} />}
    >
      <CategoryImagePicker
        image={image}
        onChange={(next) => {
          setImage(next)
          if (next) setImageError('')
        }}
        error={imageError}
      />
      <Input
        label="Category name *"
        value={name}
        onChangeText={onNameChange}
        placeholder="Electronics"
      />
      <Input
        label="Slug *"
        value={slug}
        onChangeText={(v) => {
          setSlugTouched(true)
          setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))
        }}
        placeholder="electronics"
        autoCapitalize="none"
      />
      <CategoryPicker
        label="Parent category"
        emptyHint="No parent — this will be a top-level category."
        categories={categories}
        selectedId={parentId}
        onSelect={setParentId}
      />
      <Muted className="text-xs -mt-2">Parent category is optional (nested categories).</Muted>
      <View className="flex-row items-center justify-between py-1">
        <View className="flex-1 pr-4">
          <Label>Active</Label>
          <Muted className="text-xs mt-0.5">Show this category on your storefront</Muted>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ false: '#E4E4E7', true: '#0A0A0B' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </FormModal>
  )
}
