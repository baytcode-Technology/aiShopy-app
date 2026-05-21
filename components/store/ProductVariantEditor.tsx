import { Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AuthInput } from '@/components/auth/AuthInput'
import { theme } from '@src/theme/colors'

export type VariantDraft = {
  id: string
  name: string
  priceDelta: string
  stockQty: string
  sku: string
}

type Props = {
  variants: VariantDraft[]
  onChange: (variants: VariantDraft[]) => void
}

export function ProductVariantEditor({ variants, onChange }: Props) {
  const addVariant = () => {
    onChange([
      ...variants,
      {
        id: `${Date.now()}`,
        name: '',
        priceDelta: '0',
        stockQty: '0',
        sku: '',
      },
    ])
  }

  const update = (id: string, patch: Partial<VariantDraft>) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  const remove = (id: string) => {
    onChange(variants.filter((v) => v.id !== id))
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>Variants (optional)</Text>
        <Pressable onPress={addVariant} style={styles.addBtn}>
          <FontAwesome name="plus" size={12} color={theme.black} />
          <Text style={styles.addText}>Add variant</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>Use variants for size, color, etc. Each has its own stock.</Text>
      {variants.map((v, index) => (
        <View key={v.id} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.rowTitle}>Variant {index + 1}</Text>
            <Pressable onPress={() => remove(v.id)} hitSlop={8}>
              <FontAwesome name="trash-o" size={16} color={theme.gray600} />
            </Pressable>
          </View>
          <AuthInput
            label="Name *"
            value={v.name}
            onChangeText={(name) => update(v.id, { name })}
            placeholder="Large / Red"
          />
          <View style={styles.inline}>
            <View style={styles.half}>
              <AuthInput
                label="Price +/−"
                value={v.priceDelta}
                onChangeText={(priceDelta) => update(v.id, { priceDelta })}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.half}>
              <AuthInput
                label="Stock"
                value={v.stockQty}
                onChangeText={(stockQty) => update(v.id, { stockQty })}
                placeholder="0"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <AuthInput
            label="SKU"
            value={v.sku}
            onChangeText={(sku) => update(v.id, { sku })}
            placeholder="VAR-001"
            autoCapitalize="none"
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  hint: { fontSize: 12, color: theme.gray600 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.black,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addText: { fontSize: 12, fontWeight: '600', color: theme.black },
  row: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 10,
    padding: 10,
    gap: 4,
    backgroundColor: theme.gray100,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontSize: 13, fontWeight: '700', color: theme.black },
  inline: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
})
