import { useMemo, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Caption, Label, Muted, SectionTitle } from '@/components/ui/Typography'
import {
  generateVariantsFromOptions,
  type GeneratedVariant,
  type VariantOption,
} from '@src/lib/variant-options'
import Colors from '@src/theme/colors'

type Props = {
  options: VariantOption[]
  variants: GeneratedVariant[]
  onChange: (options: VariantOption[], variants: GeneratedVariant[]) => void
}

const inputClass =
  'border border-gray-200 rounded-lg px-3 py-2.5 text-[15px] text-ink bg-gray-100'
const miniInputClass =
  'border border-gray-200 rounded-md px-2 py-1.5 text-[13px] text-ink bg-gray-100'

export function ShopifyVariantEditor({ options, variants, onChange }: Props) {
  const [expanded, setExpanded] = useState(true)

  const addOption = () => {
    onChange([...options, { id: `${Date.now()}`, name: '', values: [''] }], variants)
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
    <View className="gap-2.5">
      <Pressable className="flex-row items-center justify-between" onPress={() => setExpanded((e) => !e)}>
        <SectionTitle>Options & variants</SectionTitle>
        <View className="flex-row items-center gap-2">
          {comboCount > 0 ? <Badge label={`${comboCount} variants`} tone="active" /> : null}
          <FontAwesome
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={Colors.brand.primary}
          />
        </View>
      </Pressable>

      {expanded ? (
        <>
          <Muted className="text-xs leading-[18px]">
            Like Shopify: add options (Size, Color), then set price and stock per combination.
          </Muted>

          {options.map((opt, optIndex) => (
            <Card key={opt.id} className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-xs font-bold text-ink">Option {optIndex + 1}</Text>
                <IconButton size="sm" onPress={() => removeOption(opt.id)}>
                  <FontAwesome name="trash-o" size={14} color={Colors.text.secondary} />
                </IconButton>
              </View>
              <TextInput
                className={inputClass}
                placeholder="e.g. Size"
                placeholderTextColor={Colors.text.muted}
                value={opt.name}
                onChangeText={(name) => updateOption(opt.id, { name })}
              />
              <Caption>Values</Caption>
              {opt.values.map((val, vi) => (
                <View key={vi} className="flex-row items-center gap-2">
                  <TextInput
                    className={`${inputClass} flex-1`}
                    placeholder="e.g. Medium"
                    placeholderTextColor={Colors.text.muted}
                    value={val}
                    onChangeText={(v) => setValue(opt.id, vi, v)}
                  />
                  {opt.values.length > 1 ? (
                    <Pressable onPress={() => removeValue(opt.id, vi)} className="p-1">
                      <FontAwesome name="minus-circle" size={18} color={Colors.text.muted} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
              <Pressable onPress={() => addValue(opt.id)} className="flex-row items-center gap-1.5">
                <FontAwesome name="plus" size={10} color={Colors.brand.primary} />
                <Text className="text-xs font-semibold text-ink">Add value</Text>
              </Pressable>
            </Card>
          ))}

          <Button
            label="Add option"
            variant="primary"
            className="py-3 min-h-0"
            onPress={addOption}
          />

          {variants.length > 0 ? (
            <View className="gap-2 mt-1">
              <Text className="text-xs font-bold text-ink">Variant combinations</Text>
              {variants.map((v) => (
                <Card key={v.id} className="gap-2">
                  <Text className="text-sm font-bold text-ink" numberOfLines={2}>
                    {v.name}
                  </Text>
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Label className="mb-1 normal-case tracking-normal text-[10px]">+Price</Label>
                      <TextInput
                        className={miniInputClass}
                        value={v.priceDelta}
                        onChangeText={(priceDelta) => updateVariant(v.id, { priceDelta })}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View className="flex-1">
                      <Label className="mb-1 normal-case tracking-normal text-[10px]">Stock</Label>
                      <TextInput
                        className={miniInputClass}
                        value={v.stockQty}
                        onChangeText={(stockQty) => updateVariant(v.id, { stockQty })}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View className="flex-[1.2]">
                      <Label className="mb-1 normal-case tracking-normal text-[10px]">SKU</Label>
                      <TextInput
                        className={miniInputClass}
                        value={v.sku}
                        onChangeText={(sku) => updateVariant(v.id, { sku })}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  )
}
