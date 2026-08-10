import { VariantImageTile } from '@/components/store/VariantImageTile'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Caption, Label, Muted, SectionTitle } from '@/components/ui/Typography'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  generateVariantsFromOptions,
  isPersistedVariantId,
  type GeneratedVariant,
  type VariantOption,
} from '@src/lib/variant-options'
import Colors from '@src/theme/colors'
import type { ProductVariant } from '@src/types/product'
import { useMemo, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

type Props = {
  existingVariants: ProductVariant[]
  options: VariantOption[]
  generatedVariants: GeneratedVariant[]
  onChange: (options: VariantOption[], generated: GeneratedVariant[]) => void
  showTitle?: boolean
}

const inputClass =
  'border border-gray-200 rounded-lg px-3 py-2.5 text-[15px] text-ink bg-gray-100'
const miniInputClass =
  'border border-gray-200 rounded-md px-2 py-1.5 text-[13px] text-ink bg-gray-100'

export function ProductVariantOptionsManager({
  existingVariants,
  options,
  generatedVariants,
  onChange,
  showTitle = true,
}: Props) {
  const [expanded, setExpanded] = useState(true)

  const existingKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const v of existingVariants) {
      const opts = Object.fromEntries(
        Object.entries(v.options ?? {}).map(([k, val]) => [k, String(val)])
      )
      keys.add(JSON.stringify(opts))
    }
    return keys
  }, [existingVariants])

  const regenerate = (nextOptions: VariantOption[], previous: GeneratedVariant[]) => {
    const nextVariants = generateVariantsFromOptions(nextOptions, previous)
    onChange(nextOptions, nextVariants)
  }

  const addOption = () => {
    regenerate(
      [...options, { id: `${Date.now()}`, name: '', values: [''] }],
      generatedVariants
    )
  }

  const updateOption = (id: string, patch: Partial<VariantOption>) => {
    const nextOptions = options.map((o) => (o.id === id ? { ...o, ...patch } : o))
    regenerate(nextOptions, generatedVariants)
  }

  const removeOption = (id: string) => {
    regenerate(
      options.filter((o) => o.id !== id),
      generatedVariants
    )
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
    updateOption(optionId, {
      values: opt.values.filter((_, i) => i !== index),
    })
  }

  const updateVariant = (id: string, patch: Partial<GeneratedVariant>) => {
    onChange(
      options,
      generatedVariants.map((v) => (v.id === id ? { ...v, ...patch } : v))
    )
  }

  const isExistingCombo = (v: GeneratedVariant) =>
    isPersistedVariantId(v.id) || existingKeys.has(JSON.stringify(v.options))

  const newCount = generatedVariants.filter((v) => !isExistingCombo(v)).length

  return (
    <View className="gap-2.5">
      {showTitle ? (
        <Pressable
          className="flex-row items-center justify-between"
          onPress={() => setExpanded((e) => !e)}
        >
          <SectionTitle>Options & variants</SectionTitle>
          <View className="flex-row items-center gap-2">
            {generatedVariants.length > 0 ? (
              <Badge label={`${generatedVariants.length} variants`} tone="emphasis" />
            ) : null}
            {newCount > 0 ? (
              <Badge label={`${newCount} new`} tone="default" />
            ) : null}
            <FontAwesome
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.brand.primary}
            />
          </View>
        </Pressable>
      ) : null}

      {expanded || !showTitle ? (
        <>
          <Muted className="text-xs leading-[18px]">
            Add values to existing options (e.g. L, XL for Size) or add a new option. New
            combinations are created automatically.
          </Muted>

          {options.map((opt, optIndex) => (
            <Card key={opt.id} className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs font-bold text-ink">
                  {opt.name.trim() || `Option ${optIndex + 1}`}
                </Text>
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
                    placeholder="e.g. XL"
                    placeholderTextColor={Colors.text.muted}
                    value={val}
                    onChangeText={(v) => setValue(opt.id, vi, v)}
                  />
                  {opt.values.length > 1 ? (
                    <Pressable onPress={() => removeValue(opt.id, vi)} className="p-1">
                      <FontAwesome
                        name="minus-circle"
                        size={18}
                        color={Colors.text.muted}
                      />
                    </Pressable>
                  ) : null}
                </View>
              ))}
              <Pressable
                onPress={() => addValue(opt.id)}
                className="flex-row items-center gap-1.5"
              >
                <FontAwesome name="plus" size={10} color={Colors.brand.primary} />
                <Text className="text-xs font-semibold text-ink">Add value</Text>
              </Pressable>
            </Card>
          ))}

          <Button
            label="Add new option"
            variant="outline"
            className="py-3 min-h-0"
            onPress={addOption}
          />

          {generatedVariants.length > 0 ? (
            <View className="gap-2 mt-1">
              <Text className="text-xs font-bold text-ink">Variant combinations</Text>
              {generatedVariants.map((v) => {
                const saved = isExistingCombo(v)
                return (
                  <Card key={v.id} className="gap-2">
                    <View className="flex-row items-start gap-2.5">
                      <VariantImageTile
                        imageUri={
                          v.imageUri?.startsWith('http') ? v.imageUri : v.imageUri ?? null
                        }
                        size={40}
                        onPick={(file) =>
                          updateVariant(v.id, {
                            imageUri: file.uri,
                            imageName: file.name,
                            imageType: file.type,
                          })
                        }
                        onRemove={
                          v.imageUri
                            ? () =>
                                updateVariant(v.id, {
                                  imageUri: null,
                                  imageName: undefined,
                                  imageType: undefined,
                                })
                            : undefined
                        }
                      />
                      <View className="flex-1 gap-1">
                        <Text className="text-sm font-bold text-ink" numberOfLines={2}>
                          {v.name}
                        </Text>
                        <Badge
                          label={saved ? 'In store' : 'New'}
                          tone={saved ? 'default' : 'emphasis'}
                        />
                      </View>
                    </View>
                    <View className="flex-row gap-2 flex-wrap">
                      <View className="flex-1 min-w-[30%]">
                        <Label className="mb-1 normal-case tracking-normal text-[10px]">
                          +Price
                        </Label>
                        <TextInput
                          className={miniInputClass}
                          value={v.priceDelta}
                          onChangeText={(priceDelta) => updateVariant(v.id, { priceDelta })}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View className="flex-1 min-w-[30%]">
                        <Label className="mb-1 normal-case tracking-normal text-[10px]">
                          Compare at
                        </Label>
                        <TextInput
                          className={miniInputClass}
                          value={v.compareAtPrice}
                          onChangeText={(compareAtPrice) =>
                            updateVariant(v.id, { compareAtPrice })
                          }
                          keyboardType="decimal-pad"
                          placeholder="Optional"
                          placeholderTextColor={Colors.text.muted}
                        />
                      </View>
                      <View className="flex-1 min-w-[30%]">
                        <Label className="mb-1 normal-case tracking-normal text-[10px]">
                          Stock
                        </Label>
                        <TextInput
                          className={miniInputClass}
                          value={v.stockQty}
                          onChangeText={(stockQty) => updateVariant(v.id, { stockQty })}
                          keyboardType="number-pad"
                        />
                      </View>
                      <View className="flex-1 min-w-[30%]">
                        <Label className="mb-1 normal-case tracking-normal text-[10px]">
                          SKU
                        </Label>
                        <TextInput
                          className={miniInputClass}
                          value={v.sku}
                          onChangeText={(sku) => updateVariant(v.id, { sku })}
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </Card>
                )
              })}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  )
}
