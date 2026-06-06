import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { CategoryPicker } from '@/components/store/CategoryPicker'
import { DetailSection } from '@/components/store/detail/DetailSection'
import { SleekModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { updateProduct } from '@src/api/products'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'
import type { Product } from '@src/types/product'

type Props = {
  product: Product
  categories: Category[]
  onUpdated: (product: Product) => void
}

export function ProductCategoryRow({ product, categories, onUpdated }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(product.category_id)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSelectedId(product.category_id)
  }, [product.category_id])

  const categoryName =
    categories.find((c) => c.id === product.category_id)?.name ?? 'Uncategorized'

  const save = async () => {
    if (selectedId === product.category_id) {
      setOpen(false)
      return
    }
    setSaving(true)
    try {
      const res = await updateProduct(product.id, { category_id: selectedId })
      onUpdated(res.data)
      showSuccess('Category updated')
      setOpen(false)
    } catch (e) {
      showError(e, 'Could not update category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DetailSection className="px-3.5 py-2.5 flex-row items-center justify-between">
        <View className="flex-1 min-w-0 pr-3">
          <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
            Category
          </Text>
          <Text className="text-[14px] font-semibold text-ink mt-0.5" numberOfLines={1}>
            {categoryName}
          </Text>
        </View>
        <Pressable
          onPress={() => setOpen(true)}
          className="px-3 py-1.5 rounded-full bg-gray-100 border border-gray-300 active:opacity-80"
        >
          <Text className="text-[12px] font-bold text-ink">Edit</Text>
        </Pressable>
      </DetailSection>

      <SleekModal
        isOpen={open}
        onClose={() => !saving && setOpen(false)}
        title="Category"
        subtitle="Assign this product to a category"
        scrollClassName="max-h-[40%]"
        footer={
          saving ? (
            <View className="py-3 items-center">
              <ActivityIndicator color={Colors.brand.primary} />
            </View>
          ) : (
            <Button label="Save category" onPress={save} />
          )
        }
      >
        <CategoryPicker
          categories={categories}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </SleekModal>
    </>
  )
}
