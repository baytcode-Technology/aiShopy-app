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
}

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
  label = 'Category',
  emptyHint = 'No categories yet — create one first (optional).',
}: Props) {
  const [open, setOpen] = useState(false)

  if (categories.length === 0) {
    return (
      <View className="gap-2">
        <Label>{label}</Label>
        <Muted className="text-xs pl-1">{emptyHint}</Muted>
      </View>
    )
  }

  const selectedLabel = selectedId
    ? getCategoryBreadcrumb(selectedId, categories)
    : 'Uncategorized'

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

      <CategoryTreeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        categories={categories}
        selectedId={selectedId}
        onSelect={onSelect}
        title="Select category"
        subtitle="Choose from your category tree"
        showNoneOption
        noneLabel="Uncategorized"
      />
    </View>
  )
}
