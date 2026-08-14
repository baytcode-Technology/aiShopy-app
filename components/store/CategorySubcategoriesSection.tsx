import { Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryListRow } from '@/components/store/CategoryListRow'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Label } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'

type Props = {
  children: Category[]
  onPressChild: (categoryId: number) => void
  onAddSubcategory: () => void
  onAddExisting: () => void
  onRemoveChild: (categoryId: number) => void
  removingChildId?: number | null
}

export function CategorySubcategoriesSection({
  children,
  onPressChild,
  onAddSubcategory,
  onAddExisting,
  onRemoveChild,
  removingChildId = null,
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
            No subcategories yet. Create Shirt under Men, or add an existing category here.
          </Text>
          <View className="mt-4 w-full gap-2">
            <Button label="Add subcategory" variant="outline" onPress={onAddSubcategory} />
            <Button label="Add existing" variant="outline" onPress={onAddExisting} />
          </View>
        </View>
      ) : (
        <>
          <View className="rounded-xl border border-gray-200 overflow-hidden px-3">
            {children.map((child) => (
              <View key={child.id} className="flex-row items-center">
                <View className="flex-1 min-w-0">
                  <CategoryListRow
                    category={child}
                    onPress={() => onPressChild(child.id)}
                  />
                </View>
                <IconButton
                  variant="ghost"
                  onPress={() => onRemoveChild(child.id)}
                  disabled={removingChildId === child.id}
                  accessibilityLabel={`Remove ${child.name} from parent`}
                >
                  <FontAwesome name="unlink" size={14} color={Colors.text.muted} />
                </IconButton>
              </View>
            ))}
          </View>
          <View className="mt-3 gap-2">
            <Button label="Add subcategory" variant="outline" onPress={onAddSubcategory} />
            <Button label="Add existing" variant="outline" onPress={onAddExisting} />
          </View>
        </>
      )}
    </View>
  )
}
