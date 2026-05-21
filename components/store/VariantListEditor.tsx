import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { deleteProductVariant } from '@src/api/products'
import { showError, showSuccess } from '@src/lib/toast'
import type { ProductVariant } from '@src/types/product'
import { theme } from '@src/theme/colors'

export type EditableVariantRow = {
  id: string
  name: string
  priceDelta: string
  stockQty: string
  sku: string
}

export function variantsToEditable(rows: ProductVariant[]): EditableVariantRow[] {
  return rows.map((v) => ({
    id: v.id,
    name: v.name,
    priceDelta: String(v.price_delta),
    stockQty: String(v.stock_qty),
    sku: v.sku ?? '',
  }))
}

type Props = {
  productId: string
  variants: EditableVariantRow[]
  onChange: (variants: EditableVariantRow[]) => void
}

export function VariantListEditor({ productId, variants, onChange }: Props) {
  const update = (id: string, patch: Partial<EditableVariantRow>) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete variant', `Remove "${name}" from this product?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProductVariant(productId, id)
            onChange(variants.filter((v) => v.id !== id))
            showSuccess('Variant deleted')
          } catch (e) {
            showError(e)
          }
        },
      },
    ])
  }

  if (variants.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No variants yet. Add options below.</Text>
      </View>
    )
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Existing variants</Text>
      {variants.map((v) => (
        <View key={v.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {v.name || 'Unnamed variant'}
            </Text>
            <Pressable onPress={() => confirmDelete(v.id, v.name)} hitSlop={8}>
              <FontAwesome name="trash-o" size={18} color={theme.gray600} />
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={v.name}
            onChangeText={(name) => update(v.id, { name })}
            placeholder="Variant name"
            placeholderTextColor={theme.gray400}
          />
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Price +/−</Text>
              <TextInput
                style={styles.input}
                value={v.priceDelta}
                onChangeText={(priceDelta) => update(v.id, { priceDelta })}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Stock</Text>
              <TextInput
                style={styles.input}
                value={v.stockQty}
                onChangeText={(stockQty) => update(v.id, { stockQty })}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <View>
            <Text style={styles.fieldLabel}>SKU</Text>
            <TextInput
              style={styles.input}
              value={v.sku}
              onChangeText={(sku) => update(v.id, { sku })}
              autoCapitalize="none"
            />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.black,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  empty: {
    padding: 14,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 10,
    backgroundColor: theme.gray100,
  },
  emptyText: { fontSize: 13, color: theme.gray600 },
  card: {
    borderWidth: 1,
    borderColor: theme.black,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    backgroundColor: theme.white,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: theme.black, flex: 1, marginRight: 8 },
  row: { flexDirection: 'row', gap: 8 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 10, fontWeight: '600', color: theme.gray600, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.black,
    backgroundColor: theme.gray100,
  },
})
