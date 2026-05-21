import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Category } from '@src/types/category'
import { theme } from '@src/theme/colors'

type Props = {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function CategoryPicker({ categories, selectedId, onSelect }: Props) {
  if (categories.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>Category</Text>
        <Text style={styles.empty}>No categories yet — create one first (optional).</Text>
      </View>
    )
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Pressable
          style={[styles.chip, !selectedId && styles.chipActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.chipText, !selectedId && styles.chipTextActive]}>None</Text>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.chip, selectedId === cat.id && styles.chipActive]}
            onPress={() => onSelect(cat.id)}
          >
            <Text style={[styles.chipText, selectedId === cat.id && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.gray600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  empty: { fontSize: 12, color: theme.gray600, paddingLeft: 4 },
  chip: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: theme.white,
  },
  chipActive: { backgroundColor: theme.black, borderColor: theme.black },
  chipText: { fontSize: 13, fontWeight: '700', color: theme.gray600 },
  chipTextActive: { color: theme.white },
})
