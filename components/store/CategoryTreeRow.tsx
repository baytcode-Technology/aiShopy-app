import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryActiveBadge } from '@/components/store/CategoryActiveBadge'
import { PressableScale } from '@/components/ui/PressableScale'
import { categoryHasImage } from '@src/lib/category-image'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

const INDENT = 20

type Props = {
  category: Category
  depth?: number
  hasChildren?: boolean
  childCount?: number
  expanded?: boolean
  onToggleExpand?: () => void
  breadcrumb?: string
  onPress?: () => void
  selected?: boolean
  selectionMode?: boolean
  onSelect?: () => void
}

export function CategoryTreeRow({
  category,
  depth = 0,
  hasChildren = false,
  childCount = 0,
  expanded = false,
  onToggleExpand,
  breadcrumb,
  onPress,
  selected = false,
  selectionMode = false,
  onSelect,
}: Props) {
  const count = category.product_count ?? 0
  const countLabel =
    hasChildren && count === 0
      ? `${childCount} subcategories`
      : count === 1
        ? '1 product'
        : `${count} products`

  const content = (
    <View
      className={`flex-row items-center gap-2 py-3.5 border-b border-gray-200 ${
        selected ? 'bg-gray-50' : ''
      }`}
      style={{ paddingLeft: depth * INDENT }}
    >
      {hasChildren ? (
        <Pressable
          onPress={onToggleExpand}
          hitSlop={10}
          className="w-7 h-7 items-center justify-center rounded-md"
        >
          <FontAwesome
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size={12}
            color={Colors.text.muted}
          />
        </Pressable>
      ) : (
        <View className="w-7" />
      )}

      <View className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
        {categoryHasImage(category.image_url) ? (
          <Image source={{ uri: category.image_url! }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <FontAwesome name="folder-open-o" size={16} color={Colors.text.muted} />
        )}
      </View>

      <PressableScale
        onPress={selectionMode ? onSelect : onPress}
        disabled={selectionMode ? !onSelect : !onPress}
        className="flex-1 min-w-0"
      >
        <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
          {category.name}
        </Text>
        <Text className="text-[13px] text-gray-500 mt-0.5" numberOfLines={1}>
          {breadcrumb ?? countLabel}
        </Text>
      </PressableScale>

      {selectionMode ? (
        selected ? (
          <FontAwesome name="check-circle" size={18} color={Colors.brand.primary} />
        ) : (
          <View className="w-[18px]" />
        )
      ) : (
        <CategoryActiveBadge isActive={category.is_active} />
      )}
    </View>
  )

  if (selectionMode && onSelect) {
    return <Pressable onPress={onSelect}>{content}</Pressable>
  }

  return content
}

const styles = StyleSheet.create({
  thumb: {
    width: 44,
    height: 44,
  },
})
