import { FlatList, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AppPressable } from '@/components/ui/AppPressable'
import { SleekModal } from '@/components/ui/Modal'
import { CategoryCard } from '@/components/store/CategoryCard'
import { EmptyState } from '@/components/ui/EmptyState'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

type Props = {
  visible: boolean
  categories: Category[]
  selectedCategoryId: number | null
  onSelect: (categoryId: number | null) => void
  onClose: () => void
  onAddCategory: () => void
}

export function CategoriesModal({
  visible,
  categories,
  selectedCategoryId,
  onSelect,
  onClose,
  onAddCategory,
}: Props) {
  return (
    <SleekModal
      isOpen={visible}
      onClose={onClose}
      title="Categories"
      subtitle="Browse and filter your catalog"
      scrollClassName="max-h-[70%]"
    >
      <View className="flex-row items-center justify-between mb-2">
        <AppPressable
          containerClassName={`px-4 py-2.5 rounded-full border ${
            !selectedCategoryId ? 'bg-brand-primary border-brand-primary' : 'bg-surface border-gray-200'
          }`}
          onPress={() => {
            onSelect(null)
            onClose()
          }}
        >
          <Text
            className={`text-xs font-bold ${
              !selectedCategoryId ? 'text-brand-on-primary' : 'text-ink'
            }`}
          >
            All products
          </Text>
        </AppPressable>
        <AppPressable
          containerClassName="flex-row items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50"
          onPress={() => {
            onClose()
            onAddCategory()
          }}
        >
          <FontAwesome name="plus" size={12} color={Colors.brand.primary} />
          <Text className="text-xs font-bold text-ink">New</Text>
        </AppPressable>
      </View>

      {categories.length === 0 ? (
        <EmptyState
          icon="folder-open-o"
          title="No categories"
          description="Create a category with a cover image to organize products."
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperClassName="justify-between"
          renderItem={({ item }) => (
            <View className="w-[48%]">
              <CategoryCard
                category={item}
                onPress={() => {
                  onSelect(item.id)
                  onClose()
                }}
              />
            </View>
          )}
        />
      )}
    </SleekModal>
  )
}
