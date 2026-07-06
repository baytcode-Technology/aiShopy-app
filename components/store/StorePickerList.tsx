import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { StoreAvatar } from '@/components/store/StoreAvatar'
import { Caption, Muted } from '@/components/ui/Typography'
import { env } from '@src/config/env'
import { shadows } from '@src/lib/shadows'
import Colors from '@src/theme/colors'
import type { StoreAccessRole, StoreListItem } from '@src/types/store'

function RoleBadge({ role }: { role: StoreAccessRole }) {
  return (
    <View className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-1">
      <Caption className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
        {role === 'owner' ? 'Owner' : 'Staff'}
      </Caption>
    </View>
  )
}

type Props = {
  stores: StoreListItem[]
  selectedStoreId?: number | null
  lastSessionStoreId?: number | null
  isLoading?: boolean
  onSelect: (storeId: number, storeName: string) => void
}

export function StorePickerList({
  stores,
  selectedStoreId,
  lastSessionStoreId,
  isLoading = false,
  onSelect,
}: Props) {
  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator color={Colors.brand.green} />
      </View>
    )
  }

  if (stores.length === 0) {
    return (
      <View className="py-8 px-4">
        <Muted className="text-center text-[15px]">No stores found for this account.</Muted>
      </View>
    )
  }

  return (
    <View
      className="rounded-[28px] border border-gray-200 bg-surface overflow-hidden"
      style={shadows.card}
    >
      {stores.map((item, index) => {
        const host = `${item.store.slug}.${env.storefrontBaseDomain}`
        const selected = selectedStoreId === item.store.id
        const wasLastUsed =
          !selected && lastSessionStoreId != null && lastSessionStoreId === item.store.id

        return (
          <Pressable
            key={item.store.id}
            onPress={() => onSelect(item.store.id, item.store.name)}
            className={`px-5 py-4 flex-row items-center gap-3 ${
              index < stores.length - 1 ? 'border-b border-gray-100' : ''
            } ${selected || wasLastUsed ? 'bg-gray-50' : ''}`}
          >
            <StoreAvatar store={item.store} size="sm" />
            <View className="flex-1 min-w-0">
              <Text className="text-[16px] font-semibold text-ink" numberOfLines={1}>
                {item.store.name}
              </Text>
              <Muted className="text-[13px] mt-0.5" numberOfLines={1}>
                {host}
              </Muted>
              {wasLastUsed ? (
                <Caption className="text-[11px] text-gray-400 mt-1">Last opened</Caption>
              ) : null}
            </View>
            <RoleBadge role={item.role} />
            {selected ? (
              <FontAwesome name="check-circle" size={18} color={Colors.brand.green} />
            ) : (
              <FontAwesome name="chevron-right" size={12} color={Colors.text.muted} />
            )}
          </Pressable>
        )
      })}
    </View>
  )
}
