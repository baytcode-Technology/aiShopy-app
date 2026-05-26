import { View } from 'react-native'
import { CategoryCard } from '@/components/store/CategoryCard'
import type { Category } from '@src/types/category'

type Props = {
  categories: Category[]
  selectedCategoryId?: string | null
  onPressCategory: (category: Category) => void
}

export function CategoryGrid({ categories, selectedCategoryId, onPressCategory }: Props) {
  if (categories.length === 0) {
    return null
  }

  return (
    <View className="flex-row flex-wrap -mx-1.5">
      {categories.map((cat) => (
        <View key={cat.id} className="w-1/2 px-1.5 mb-4">
          <CategoryCard
            category={cat}
            selected={selectedCategoryId === cat.id}
            onPress={() => onPressCategory(cat)}
          />
        </View>
      ))}
    </View>
  )
}
