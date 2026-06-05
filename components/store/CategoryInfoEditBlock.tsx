import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryInfoEditModal } from '@/components/store/CategoryInfoEditModal'
import { Caption, SectionTitle } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

type Props = {
  category: Category
  productCount: number
  onUpdated: (category: Category) => void
}

export function CategoryInfoEditBlock({
  category,
  productCount,
  onUpdated,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)

  const countLabel = productCount === 1 ? '1 product' : `${productCount} products`

  return (
    <>
      <View className="mb-7 rounded-[20px] border border-gray-200 bg-surface p-4 relative">
        <Pressable
          onPress={() => setEditOpen(true)}
          className="absolute top-3 right-3 z-10"
          hitSlop={8}
          accessibilityLabel="Edit category details"
        >
          <View className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 items-center justify-center">
            <FontAwesome name="pencil" size={14} color={Colors.brand.primary} />
          </View>
        </Pressable>

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
      </View>

      <CategoryInfoEditModal
        visible={editOpen}
        category={category}
        onClose={() => setEditOpen(false)}
        onUpdated={onUpdated}
      />
    </>
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
