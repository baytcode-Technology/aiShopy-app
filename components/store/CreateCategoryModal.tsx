import { useEffect, useRef, useState } from 'react'
import { LayoutChangeEvent, ScrollView, Switch, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label, Muted } from '@/components/ui/Typography'
import { FormModal } from '@/components/store/FormModal'
import { CategoryImagePicker } from '@/components/store/CategoryImagePicker'
import { CategoryParentPicker } from '@/components/store/CategoryParentPicker'
import type { PickedImage } from '@/components/store/ProductImagePicker'
import { createCategory } from '@src/api/categories'
import { uploadProductImages } from '@src/api/uploads'
import { showError, showSuccess } from '@src/lib/toast'
import type { Category } from '@src/types/category'

type Props = {
  visible: boolean
  storeId: number
  categories?: Category[]
  defaultParentId?: number | null
  onClose: () => void
  onCreated: (category: Category) => void
}

export function CreateCategoryModal({
  visible,
  storeId,
  categories = [],
  defaultParentId = null,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [image, setImage] = useState<PickedImage | null>(null)
  const [nameError, setNameError] = useState('')
  const [loading, setLoading] = useState(false)

  const scrollViewRef = useRef<ScrollView>(null)
  const fieldY = useRef<Record<string, number | undefined>>({})

  useEffect(() => {
    if (visible) {
      setParentId(defaultParentId)
    }
  }, [visible, defaultParentId])

  const registerFieldY = (key: string) => (e: LayoutChangeEvent) => {
    fieldY.current[key] = e.nativeEvent.layout.y
  }

  const scrollToField = (key: string) => {
    const y = fieldY.current[key]
    if (typeof y !== 'number') return
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true })
  }

  const reset = () => {
    setName('')
    setParentId(null)
    setIsActive(true)
    setImage(null)
    setNameError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      setNameError('This field is required')
      scrollToField('name')
      return
    }

    setLoading(true)
    try {
      let imageUrl: string | null = null
      if (image) {
        const [uploaded] = await uploadProductImages(storeId, [
          { uri: image.uri, name: image.name, type: image.type },
        ])
        imageUrl = uploaded ?? null
      }

      const res = await createCategory({
        store_id: storeId,
        name: trimmedName,
        ...(imageUrl ? { image_url: imageUrl } : {}),
        parent_id: parentId ?? undefined,
        is_active: isActive,
      })
      showSuccess(res.message)
      reset()
      onCreated(res.data)
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
      scrollViewRef={scrollViewRef}
      footer={<Button label="Create category" loading={loading} onPress={handleSubmit} />}
    >
      <View onLayout={registerFieldY('image')}>
        <CategoryImagePicker image={image} onChange={setImage} />
      </View>
      <Input
        label="Category name *"
        value={name}
        onChangeText={setName}
        placeholder="Linen shirt"
        error={nameError || undefined}
        containerOnLayout={registerFieldY('name')}
      />
      <CategoryParentPicker
        label="Parent category"
        emptyHint="No parent — this will be a top-level category."
        categories={categories}
        selectedId={parentId}
        onSelect={setParentId}
      />
      <Muted className="text-xs -mt-2">
        Example: Men → Shirt → Linen shirt (each level picks its parent).
      </Muted>
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
