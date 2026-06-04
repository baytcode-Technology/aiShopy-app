import { useEffect, useState, type ReactNode } from 'react'
import { Pressable, Switch, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CancelSaveRow } from '@/components/ui/CancelSaveRow'
import { Caption, SectionTitle } from '@/components/ui/Typography'
import { updateCategory } from '@src/api/categories'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

type Props = {
  category: Category
  productCount: number
  onUpdated: (category: Category) => void
  /** Notifies parent so FlatList header re-renders when edit mode toggles. */
  onEditingChange?: (editing: boolean) => void
}

export function CategoryInfoEditBlock({
  category,
  productCount,
  onUpdated,
  onEditingChange,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(category.name)
  const [isActive, setIsActive] = useState(category.is_active)
  const [description, setDescription] = useState(category.description ?? '')

  useEffect(() => {
    setEditing(false)
  }, [category.id])

  useEffect(() => {
    onEditingChange?.(editing)
  }, [editing, onEditingChange])

  useEffect(() => {
    if (!editing) {
      setName(category.name)
      setIsActive(category.is_active)
      setDescription(category.description ?? '')
    }
  }, [category, editing])

  const countLabel = productCount === 1 ? '1 product' : `${productCount} products`

  const cancel = () => {
    setName(category.name)
    setIsActive(category.is_active)
    setDescription(category.description ?? '')
    setEditing(false)
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
      setEditing(false)
      showSuccess('Category updated')
    } catch (e) {
      showError(e, 'Could not update category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className="mb-7 rounded-[20px] border border-gray-200 bg-surface p-4 relative">
      {!editing ? (
        <Pressable
          onPress={() => setEditing(true)}
          className="absolute top-3 right-3 z-10"
          hitSlop={8}
          accessibilityLabel="Edit category details"
        >
          <View className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 items-center justify-center">
            <FontAwesome name="pencil" size={14} color={Colors.brand.primary} />
          </View>
        </Pressable>
      ) : null}

      {editing ? (
        <View className="gap-4 pr-2">
          <Field label="Category name">
            <TextInput
              className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-lg font-bold text-ink"
              value={name}
              onChangeText={setName}
              selectionColor={Colors.brand.primary}
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
            />
          </Field>

          <CancelSaveRow onCancel={cancel} onSave={save} saving={saving} />
        </View>
      ) : (
        <View className="pr-10">
          <Text className="text-[20px] font-extrabold text-ink tracking-tighter leading-tight mb-1">
            {category.name}
          </Text>
          <Text className="text-[14px] text-gray-500 mb-4" numberOfLines={1}>
            /{category.slug}
          </Text>

          <View className="flex-row gap-3 mb-4">
            <InfoStat label="Products" value={countLabel} />
            <InfoStat
              label="Status"
              value={category.is_active ? 'Active' : 'Unlisted'}
            />
          </View>

          <SectionTitle className="mb-2">About</SectionTitle>
          {category.description?.trim() ? (
            <Text className="text-[15px] text-gray-600 leading-6">{category.description}</Text>
          ) : (
            <Text className="text-[15px] text-gray-400">No description</Text>
          )}
        </View>
      )}
    </View>
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

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-[16px] p-3 bg-gray-50 border border-gray-100">
      <Caption className="uppercase tracking-widest mb-1 text-gray-400 text-[10px]">
        {label}
      </Caption>
      <Text className="text-base font-extrabold text-ink" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
