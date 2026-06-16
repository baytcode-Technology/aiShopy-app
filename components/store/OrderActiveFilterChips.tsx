import { Pressable, ScrollView, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  getOrderFilterChips,
  type OrderFilterChip,
  type OrderFilters,
  type OrderStatusField,
} from '@src/lib/order-status'
import Colors from '@src/theme/colors'

type Props = {
  filters: OrderFilters
  onRemove: (field: OrderStatusField, value: string) => void
  onClearAll: () => void
}

function FilterChip({
  chip,
  onRemove,
}: {
  chip: OrderFilterChip
  onRemove: () => void
}) {
  return (
    <View className="flex-row items-center rounded-full border border-gray-200 bg-gray-100 pl-3 pr-1.5 py-1.5 gap-1.5">
      <Text className="text-[12px] font-semibold text-ink" numberOfLines={1}>
        {chip.label}
      </Text>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        accessibilityLabel={`Remove ${chip.label}`}
        className="w-5 h-5 rounded-full bg-gray-200 items-center justify-center active:opacity-80"
      >
        <FontAwesome name="times" size={10} color={Colors.text.secondary} />
      </Pressable>
    </View>
  )
}

export function OrderActiveFilterChips({ filters, onRemove, onClearAll }: Props) {
  const chips = getOrderFilterChips(filters)
  if (chips.length === 0) return null

  return (
    <View className="px-4 pb-2 gap-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row flex-wrap gap-2 items-center pr-1"
      >
        {chips.map((chip) => (
          <FilterChip
            key={`${chip.field}:${chip.value}`}
            chip={chip}
            onRemove={() => onRemove(chip.field, chip.value)}
          />
        ))}
        <Pressable
          onPress={onClearAll}
          className="rounded-full border border-gray-200 bg-surface px-3 py-1.5 active:opacity-80"
        >
          <Text className="text-[12px] font-semibold text-gray-500">Clear all</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}
