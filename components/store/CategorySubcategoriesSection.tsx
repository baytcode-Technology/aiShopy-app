import { Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryListRow } from '@/components/store/CategoryListRow'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Typography'
import type { Category } from '@src/types/category'

type Props = {
  children: Category[]
  onPressChild: (categoryId: number) => void
  onAddSubcategory: () => void
}

export function CategorySubcategoriesSection({
  children,
  onPressChild,
  onAddSubcategory,
}: Props) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <Label>Subcategories</Label>
        <Text className="text-[13px] text-gray-500">{children.length}</Text>
      </View>

      {children.length === 0 ? (
        <View className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 items-center">
          <FontAwesome name="sitemap" size={22} color="#9CA3AF" />
          <Text className="text-[14px] text-gray-500 mt-2 text-center">
            No subcategories yet. Add Shirt under Men, then Linen shirt under Shirt.
          </Text>
          <Button
            label="Add subcategory"
            variant="outline"
            className="mt-4"
            onPress={onAddSubcategory}
          />
        </View>
      ) : (
        <>
          <View className="rounded-xl border border-gray-200 overflow-hidden px-3">
            {children.map((child) => (
              <CategoryListRow
                key={child.id}
                category={child}
                onPress={() => onPressChild(child.id)}
              />
            ))}
          </View>
          <Button
            label="Add subcategory"
            variant="outline"
            className="mt-3"
            onPress={onAddSubcategory}
          />
        </>
      )}
    </View>
  )
}
