import { useEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, Text } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryTreeRow } from '@/components/store/CategoryTreeRow'
import { SleekModal } from '@/components/ui/Modal'
import {
  buildCategoryTree,
  defaultExpandedIds,
  flattenCategoryTree,
  getDescendantIds,
} from '@src/lib/category-tree'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

type Props = {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  title?: string
  subtitle?: string
  showNoneOption?: boolean
  noneLabel?: string
  excludeCategoryId?: number
}

export function CategoryTreeModal({
  isOpen,
  onClose,
  categories,
  selectedId,
  onSelect,
  title = 'Select category',
  subtitle = 'Choose a category from your hierarchy',
  showNoneOption = false,
  noneLabel = 'None',
  excludeCategoryId,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const eligible = useMemo(() => {
    if (!excludeCategoryId) return categories
    const excluded = getDescendantIds(excludeCategoryId, categories)
    excluded.add(excludeCategoryId)
    return categories.filter((c) => !excluded.has(c.id))
  }, [categories, excludeCategoryId])

  const tree = useMemo(() => buildCategoryTree(eligible), [eligible])

  useEffect(() => {
    if (isOpen) setExpandedIds(defaultExpandedIds(tree))
  }, [isOpen, tree])

  const flatItems = useMemo(
    () => flattenCategoryTree(tree, expandedIds),
    [tree, expandedIds]
  )

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <SleekModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      minHeightRatio={0.7}
      maxHeightRatio={0.7}
      bodyScroll={false}
    >
      {showNoneOption ? (
        <Pressable
          onPress={() => {
            onSelect(null)
            onClose()
          }}
          className={`flex-row items-center justify-between px-1 py-3.5 border-b border-gray-200 ${
            !selectedId ? 'bg-gray-50' : ''
          }`}
        >
          <Text className="text-[15px] font-semibold text-ink">{noneLabel}</Text>
          {!selectedId ? (
            <FontAwesome name="check-circle" size={18} color={Colors.brand.primary} />
          ) : null}
        </Pressable>
      ) : null}

      <FlatList
        data={flatItems}
        keyExtractor={(item) => String(item.category.id)}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <CategoryTreeRow
            category={item.category}
            depth={item.depth}
            hasChildren={item.hasChildren}
            childCount={item.childCount}
            expanded={expandedIds.has(item.category.id)}
            onToggleExpand={() => toggleExpand(item.category.id)}
            selectionMode
            selected={selectedId === item.category.id}
            onSelect={() => {
              onSelect(item.category.id)
              onClose()
            }}
          />
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 py-8">No categories yet</Text>
        }
      />
    </SleekModal>
  )
}
