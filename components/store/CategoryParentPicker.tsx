import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryTreeModal } from '@/components/store/CategoryTreeModal'
import { Label, Muted } from '@/components/ui/Typography'
import { getCategoryBreadcrumb } from '@src/lib/category-tree'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

type Props = {
  categories: Category[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  label?: string
  emptyHint?: string
  excludeCategoryId?: number
}

export function CategoryParentPicker({
  categories,
  selectedId,
  onSelect,
  label = 'Parent category',
  emptyHint = 'No parent — this will be a top-level category.',
  excludeCategoryId,
}: Props) {
  const [open, setOpen] = useState(false)

  const selectedLabel = selectedId
    ? getCategoryBreadcrumb(selectedId, categories)
    : 'None (top level)'

  return (
    <View className="gap-2">
      <Label>{label}</Label>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-surface px-4 py-3.5"
      >
        <Text className="flex-1 text-[15px] font-medium text-ink pr-3" numberOfLines={2}>
          {selectedLabel}
        </Text>
        <FontAwesome name="chevron-down" size={12} color={Colors.text.muted} />
      </Pressable>
      {categories.length === 0 ? (
        <Muted className="text-xs pl-1">{emptyHint}</Muted>
      ) : (
        <Muted className="text-xs pl-1">
          Pick where this category lives — e.g. Men → Shirt → Linen shirt.
        </Muted>
      )}

      <CategoryTreeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        categories={categories}
        selectedId={selectedId}
        onSelect={onSelect}
        title="Parent category"
        subtitle="Choose a parent or keep as top level"
        showNoneOption
        noneLabel="None (top level)"
        excludeCategoryId={excludeCategoryId}
      />
    </View>
  )
}
