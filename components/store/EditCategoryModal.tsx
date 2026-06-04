import { useEffect, useState } from 'react'
import { Switch, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label, Muted } from '@/components/ui/Typography'
import { FormModal } from '@/components/store/FormModal'
import { updateCategory } from '@src/api/categories'
import { showError, showSuccess } from '@src/lib/toast'
import type { Category } from '@src/types/category'

type Props = {
  visible: boolean
  category: Category | null
  onClose: () => void
  onSaved: (category: Category) => void
}

export function EditCategoryModal({ visible, category, onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [nameError, setNameError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible || !category) return
    setName(category.name)
    setDescription(category.description ?? '')
    setIsActive(category.is_active)
    setNameError('')
  }, [visible, category?.id, category?.name, category?.description, category?.is_active])

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = async () => {
    if (!category) return
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('This field is required')
      return
    }
    setNameError('')
    setLoading(true)
    try {
      const res = await updateCategory(category.id, {
        name: trimmedName,
        is_active: isActive,
        description: description.trim() || null,
      })
      showSuccess('Category updated')
      onSaved(res.data)
      onClose()
    } catch (e) {
      showError(e, 'Could not update category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormModal
      visible={visible}
      title="Edit category"
      onClose={handleClose}
      footer={<Button label="Save changes" loading={loading} onPress={handleSubmit} />}
    >
      <Input
        label="Category name *"
        value={name}
        onChangeText={setName}
        error={nameError || undefined}
      />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        inputClassName="min-h-24"
        style={{ textAlignVertical: 'top' }}
        placeholder="Optional description for this collection"
      />
      <View className="flex-row items-center justify-between py-1">
        <View className="flex-1 pr-4">
          <Label>Status</Label>
          <Muted className="text-xs mt-0.5">
            {isActive ? 'Active — visible on storefront' : 'Unlisted — hidden from storefront'}
          </Muted>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ false: '#E4E4E7', true: '#3EB056' }}
          thumbColor="#FFFFFF"
        />
      </View>
      {category ? (
        <Muted className="text-xs">Slug: /{category.slug}</Muted>
      ) : null}
    </FormModal>
  )
}
