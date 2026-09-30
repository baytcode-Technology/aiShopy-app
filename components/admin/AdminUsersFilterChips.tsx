import { Pressable, ScrollView, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  getAdminUsersFilterChips,
  type AdminUsersFilterChip,
  type AdminUsersFilters,
} from '@src/lib/admin-users-filters'
import Colors from '@src/theme/colors'

type Props = {
  filters: AdminUsersFilters
  onRemove: (key: AdminUsersFilterChip['key']) => void
  onClearAll: () => void
}

export function AdminUsersFilterChips({ filters, onRemove, onClearAll }: Props) {
  const chips = getAdminUsersFilterChips(filters)
  if (chips.length === 0) return null

  return (
    <View className="px-5 pb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-2 items-center pr-1"
      >
        {chips.map((chip) => (
          <View
            key={chip.key}
            className="flex-row items-center rounded-full border border-gray-200 bg-gray-100 pl-3 pr-1.5 py-1.5 gap-1.5"
          >
            <Text className="text-[12px] font-semibold text-ink" numberOfLines={1}>
              {chip.label}
            </Text>
            <Pressable
              onPress={() => onRemove(chip.key)}
              hitSlop={8}
              accessibilityLabel={`Remove ${chip.label}`}
              className="w-5 h-5 rounded-full bg-gray-200 items-center justify-center active:opacity-80"
            >
              <FontAwesome name="times" size={10} color={Colors.text.secondary} />
            </Pressable>
          </View>
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
