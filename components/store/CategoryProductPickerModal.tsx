import { useEffect, useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Button } from '@/components/ui/Button'
import { Caption, Muted } from '@/components/ui/Typography'
import { FormModal } from '@/components/store/FormModal'
import { syncCategoryProducts } from '@src/api/categories'
import { cn } from '@src/lib/cn'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Product } from '@src/types/product'

type Mode = 'assign' | 'edit'

type Props = {
  visible: boolean
  mode: Mode
  storeId: number
  categoryId: number
  categoryName: string
  allProducts: Product[]
  onClose: () => void
  onSaved: () => void
}

export function CategoryProductPickerModal({
  visible,
  mode,
  storeId,
  categoryId,
  categoryName,
  allProducts,
  onClose,
  onSaved,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const inCategoryIds = useMemo(
    () => new Set(allProducts.filter((p) => p.category_id === categoryId).map((p) => p.id)),
    [allProducts, categoryId]
  )

  useEffect(() => {
    if (!visible) return
    setSelected(new Set(inCategoryIds))
    setSearch('')
  }, [visible, mode, categoryId, inCategoryIds])

  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  )

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await syncCategoryProducts(storeId, categoryId, [...selected])
      showSuccess(
        mode === 'edit'
          ? 'Category products updated'
          : `${selected.size} product(s) added to ${categoryName}`
      )
      onSaved()
      onClose()
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'edit' ? `Add / remove · ${categoryName}` : `Add to ${categoryName}`
  const submitLabel =
    mode === 'edit' ? `Save (${selected.size} in category)` : `Add selected (${selected.size})`

  return (
    <FormModal
      visible={visible}
      title={title}
      onClose={onClose}
      footer={<Button label={submitLabel} loading={loading} onPress={handleSubmit} />}
    >
      <Muted className="text-[13px] leading-[18px]">
        {mode === 'edit'
          ? 'Uncheck products to remove them from this category.'
          : 'Select existing products to include in this category.'}
      </Muted>

      <View className="flex-row items-center gap-2.5 border border-gray-200 rounded-[10px] px-3 bg-gray-100">
        <FontAwesome name="search" size={14} color={Colors.text.muted} />
        <TextInput
          className="flex-1 py-2.5 text-[15px] text-ink"
          placeholder="Search your catalog..."
          placeholderTextColor={Colors.text.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView className="max-h-[360px]" nestedScrollEnabled>
        {filtered.map((product) => {
          const isSelected = selected.has(product.id)
          const wasInCategory = inCategoryIds.has(product.id)
          return (
            <Pressable
              key={product.id}
              className={cn(
                'flex-row items-center p-3 border rounded-xl mb-2 bg-surface gap-3 active:opacity-90',
                isSelected ? 'border-ink border-2' : 'border-gray-200'
              )}
              onPress={() => toggle(product.id)}
            >
              <View className="w-[52px] h-[52px] rounded-lg bg-gray-100 overflow-hidden items-center justify-center">
                {product.thumbnail_url ? (
                  <Image source={{ uri: product.thumbnail_url }} className="w-full h-full" />
                ) : (
                  <Text className="text-xl font-bold text-gray-400">
                    {product.name[0]?.toUpperCase()}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-ink" numberOfLines={1}>
                  {product.name}
                </Text>
                <Caption className="mt-1">
                  ₹{product.base_price} · Stock {product.stock_qty}
                  {wasInCategory && !isSelected ? ' · was in category' : ''}
                </Caption>
              </View>
              <View
                className={cn(
                  'w-7 h-7 rounded-full border-2 items-center justify-center',
                  isSelected ? 'bg-brand-primary border-ink' : 'border-gray-200'
                )}
              >
                {isSelected ? (
                  <FontAwesome name="check" size={14} color={Colors.brand.onPrimary} />
                ) : null}
              </View>
            </Pressable>
          )
        })}
        {filtered.length === 0 ? (
          <Muted className="text-center py-6">No products match your search.</Muted>
        ) : null}
      </ScrollView>
    </FormModal>
  )
}
