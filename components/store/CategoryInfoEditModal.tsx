import { useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, Switch, Text, TextInput, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { SleekModal } from '@/components/ui/Modal'
import { Caption } from '@/components/ui/Typography'
import { updateCategory } from '@src/api/categories'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

type Props = {
  visible: boolean
  category: Category
  onClose: () => void
  onUpdated: (category: Category) => void
}

export function CategoryInfoEditModal({
  visible,
  category,
  onClose,
  onUpdated,
}: Props) {
  const [name, setName] = useState(category.name)
  const [isActive, setIsActive] = useState(category.is_active)
  const [description, setDescription] = useState(category.description ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!visible) return
    setName(category.name)
    setIsActive(category.is_active)
    setDescription(category.description ?? '')
  }, [
    visible,
    category.id,
    category.name,
    category.is_active,
    category.description,
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
      const res = await updateCategory(category.id, {
        name: trimmedName,
        is_active: isActive,
        description: description.trim() || null,
      })
      onUpdated(res.data)
      showSuccess('Category updated')
      onClose()
    } catch (e) {
      showError(e, 'Could not update category')
    } finally {
      setSaving(false)
    }
  }

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
