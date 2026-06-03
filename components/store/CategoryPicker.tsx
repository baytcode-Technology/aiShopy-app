import { Pressable, ScrollView, Text, View } from 'react-native'
import { Label, Muted } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
import type { Category } from '@src/types/category'

type Props = {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  label?: string
  emptyHint?: string
}

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
  label = 'Category',
  emptyHint = 'No categories yet — create one first (optional).',
}: Props) {
  if (categories.length === 0) {
    return (
      <View className="gap-2">
        <Label>{label}</Label>
        <Muted className="text-xs pl-1">{emptyHint}</Muted>
      </View>
    )
  }

  return (
    <View className="gap-2">
      <Label>{label}</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Pressable
          className={cn(
            'border rounded-full px-3.5 py-2 mr-2',
            !selectedId ? 'bg-brand-primary border-ink' : 'bg-surface border-gray-200'
          )}
          onPress={() => onSelect(null)}
        >
          <Text
            className={cn(
              'text-[13px] font-bold',
              !selectedId ? 'text-brand-on-primary' : 'text-gray-600'
            )}
          >
            None
          </Text>
        </Pressable>
        {categories.map((cat) => {
          const active = selectedId === cat.id
          return (
            <Pressable
              key={cat.id}
              className={cn(
                'border rounded-full px-3.5 py-2 mr-2',
                active ? 'bg-brand-primary border-ink' : 'bg-surface border-gray-200'
              )}
              onPress={() => onSelect(cat.id)}
            >
              <Text
                className={cn(
                  'text-[13px] font-bold',
                  active ? 'text-brand-on-primary' : 'text-gray-600'
                )}
              >
                {cat.name}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
