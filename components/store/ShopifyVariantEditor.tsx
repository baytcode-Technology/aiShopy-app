import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  generateVariantsFromOptions,
  type GeneratedVariant,
  type VariantOption,
} from '@src/lib/variant-options'
import { theme } from '@src/theme/colors'

type Props = {
  options: VariantOption[]
  variants: GeneratedVariant[]
  onChange: (options: VariantOption[], variants: GeneratedVariant[]) => void
}

export function ShopifyVariantEditor({ options, variants, onChange }: Props) {
  const [expanded, setExpanded] = useState(true)

  const addOption = () => {
    onChange(
      [...options, { id: `${Date.now()}`, name: '', values: [''] }],
      variants
    )
  }

  const updateOption = (id: string, patch: Partial<VariantOption>) => {
    const nextOptions = options.map((o) => (o.id === id ? { ...o, ...patch } : o))
    const nextVariants = generateVariantsFromOptions(nextOptions, variants)
    onChange(nextOptions, nextVariants)
  }

  const removeOption = (id: string) => {
    const nextOptions = options.filter((o) => o.id !== id)
    const nextVariants = generateVariantsFromOptions(nextOptions, variants)
    onChange(nextOptions, nextVariants)
  }

  const addValue = (optionId: string) => {
    const opt = options.find((o) => o.id === optionId)
    if (!opt) return
    updateOption(optionId, { values: [...opt.values, ''] })
  }

  const setValue = (optionId: string, index: number, value: string) => {
    const opt = options.find((o) => o.id === optionId)
    if (!opt) return
    const values = [...opt.values]
    values[index] = value
    updateOption(optionId, { values })
  }

  const removeValue = (optionId: string, index: number) => {
    const opt = options.find((o) => o.id === optionId)
    if (!opt || opt.values.length <= 1) return
    updateOption(optionId, { values: opt.values.filter((_, i) => i !== index) })
  }

  const updateVariant = (id: string, patch: Partial<GeneratedVariant>) => {
    onChange(
      options,
      variants.map((v) => (v.id === id ? { ...v, ...patch } : v))
    )
  }

  const comboCount = useMemo(() => variants.length, [variants.length])

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.titleRow} onPress={() => setExpanded((e) => !e)}>
        <Text style={styles.title}>Options & variants</Text>
        <View style={styles.titleRight}>
          {comboCount > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{comboCount} variants</Text>
            </View>
          ) : null}
          <FontAwesome name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={theme.black} />
        </View>
      </Pressable>

      {expanded ? (
        <>
          <Text style={styles.hint}>
            Like Shopify: add options (Size, Color), then set price and stock per combination.
          </Text>

          {options.map((opt, optIndex) => (
            <View key={opt.id} style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionLabel}>Option {optIndex + 1}</Text>
                <Pressable onPress={() => removeOption(opt.id)} hitSlop={8}>
                  <FontAwesome name="trash-o" size={14} color={theme.gray600} />
                </Pressable>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. Size"
                placeholderTextColor={theme.gray400}
                value={opt.name}
                onChangeText={(name) => updateOption(opt.id, { name })}
              />
              <Text style={styles.valuesLabel}>Values</Text>
              {opt.values.map((val, vi) => (
                <View key={vi} style={styles.valueRow}>
                  <TextInput
                    style={[styles.input, styles.valueInput]}
                    placeholder="e.g. Medium"
                    placeholderTextColor={theme.gray400}
                    value={val}
                    onChangeText={(v) => setValue(opt.id, vi, v)}
                  />
                  {opt.values.length > 1 ? (
                    <Pressable onPress={() => removeValue(opt.id, vi)} style={styles.valueRemove}>
                      <FontAwesome name="minus-circle" size={18} color={theme.gray400} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
              <Pressable onPress={() => addValue(opt.id)} style={styles.addValueBtn}>
                <FontAwesome name="plus" size={10} color={theme.black} />
                <Text style={styles.addValueText}>Add value</Text>
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.addOptionBtn} onPress={addOption}>
            <FontAwesome name="plus" size={12} color={theme.white} />
            <Text style={styles.addOptionText}>Add option</Text>
          </Pressable>

          {variants.length > 0 ? (
            <View style={styles.variantTable}>
              <Text style={styles.tableTitle}>Variant combinations</Text>
              {variants.map((v) => (
                <View key={v.id} style={styles.variantRow}>
                  <Text style={styles.variantName} numberOfLines={2}>
                    {v.name}
                  </Text>
                  <View style={styles.variantFields}>
                    <View style={styles.miniField}>
                      <Text style={styles.miniLabel}>+Price</Text>
                      <TextInput
                        style={styles.miniInput}
                        value={v.priceDelta}
                        onChangeText={(priceDelta) => updateVariant(v.id, { priceDelta })}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.miniField}>
                      <Text style={styles.miniLabel}>Stock</Text>
                      <TextInput
                        style={styles.miniInput}
                        value={v.stockQty}
                        onChangeText={(stockQty) => updateVariant(v.id, { stockQty })}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={[styles.miniField, styles.skuField]}>
                      <Text style={styles.miniLabel}>SKU</Text>
                      <TextInput
                        style={styles.miniInput}
                        value={v.sku}
                        onChangeText={(sku) => updateVariant(v.id, { sku })}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  titleRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge: {
    backgroundColor: theme.black,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: { fontSize: 11, fontWeight: '700', color: theme.white },
  hint: { fontSize: 12, color: theme.gray600, lineHeight: 18 },
  optionCard: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.white,
    gap: 8,
  },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  optionLabel: { fontSize: 12, fontWeight: '700', color: theme.black },
  valuesLabel: { fontSize: 11, color: theme.gray600, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.black,
    backgroundColor: theme.gray100,
  },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valueInput: { flex: 1 },
  valueRemove: { padding: 4 },
  addValueBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addValueText: { fontSize: 12, fontWeight: '600', color: theme.black },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.black,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addOptionText: { fontSize: 14, fontWeight: '700', color: theme.white },
  variantTable: { gap: 8, marginTop: 4 },
  tableTitle: { fontSize: 12, fontWeight: '700', color: theme.black },
  variantRow: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 10,
    padding: 10,
    backgroundColor: theme.white,
    gap: 8,
  },
  variantName: { fontSize: 14, fontWeight: '700', color: theme.black },
  variantFields: { flexDirection: 'row', gap: 8 },
  miniField: { flex: 1 },
  skuField: { flex: 1.2 },
  miniLabel: { fontSize: 10, color: theme.gray600, marginBottom: 4, fontWeight: '600' },
  miniInput: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: theme.black,
    backgroundColor: theme.gray100,
  },
})
