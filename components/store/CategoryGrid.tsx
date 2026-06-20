import { View } from 'react-native'
import { CategoryCard } from '@/components/store/CategoryCard'
import type { Category } from '@src/types/category'

type Props = {
  categories: Category[]
  selectedCategoryId?: number | null
  onPressCategory: (category: Category) => void
  /** Larger tiles for the category index screen. */
  variant?: 'default' | 'hero'
}

export function CategoryGrid({ categories, selectedCategoryId, onPressCategory, variant = 'default' }: Props) {
  if (categories.length === 0) {
    return null
  }

  return (
    <View className="flex-row flex-wrap -mx-1.5">
      {categories.map((cat) => (
        <View key={cat.id} className="w-1/2 px-1.5 mb-5">
          <CategoryCard
            category={cat}
            variant={variant}
            selected={selectedCategoryId === cat.id}
            onPress={() => onPressCategory(cat)}
          />
        </View>
      ))}
    </View>
  )
}
