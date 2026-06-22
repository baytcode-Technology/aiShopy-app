import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { ProductInventoryFlagsEditor } from '@/components/store/ProductInventoryFlagsEditor'
import { DetailSection } from '@/components/store/detail/DetailSection'
import { updateProduct } from '@src/api/products'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Product } from '@src/types/product'

type Props = {
  product: Product
  onUpdated: (product: Product) => void
}

export function ProductInventoryFlagsBlock({ product, onUpdated }: Props) {
  const [markAsSold, setMarkAsSold] = useState(product.mark_as_sold ?? false)
  const [markAsNonInventory, setMarkAsNonInventory] = useState(
    product.mark_as_non_inventory ?? false
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (saving) return
    setMarkAsSold(product.mark_as_sold ?? false)
    setMarkAsNonInventory(product.mark_as_non_inventory ?? false)
  }, [product.id, product.mark_as_sold, product.mark_as_non_inventory, saving])

  const persist = async (sold: boolean, nonInventory: boolean) => {
    setSaving(true)
    try {
      const res = await updateProduct(product.id, {
        mark_as_sold: sold,
        mark_as_non_inventory: nonInventory,
      })
      onUpdated(res.data)
      showSuccess('Inventory settings updated')
    } catch (e) {
      setMarkAsSold(product.mark_as_sold ?? false)
      setMarkAsNonInventory(product.mark_as_non_inventory ?? false)
      showError(e, 'Could not update inventory settings')
    } finally {
      setSaving(false)
    }
  }

  const onMarkAsSoldChange = (value: boolean) => {
    const nextNonInventory = value ? false : markAsNonInventory
    setMarkAsSold(value)
    setMarkAsNonInventory(nextNonInventory)
    void persist(value, nextNonInventory)
  }

  const onMarkAsNonInventoryChange = (value: boolean) => {
    const nextSold = value ? false : markAsSold
    setMarkAsSold(nextSold)
    setMarkAsNonInventory(value)
    void persist(nextSold, value)
  }

  return (
    <DetailSection className="p-3.5 relative overflow-hidden">
      {saving ? (
        <View
          className="absolute inset-0 z-10 rounded-2xl"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)' }}
          pointerEvents="auto"
        />
      ) : null}

      <View
        style={saving ? { opacity: 0.55 } : undefined}
        pointerEvents={saving ? 'none' : 'auto'}
      >
        <View className="flex-row items-center justify-between mb-2.5">
          <Text className="text-[13px] font-bold text-ink">Inventory options</Text>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.brand.green} />
          ) : null}
        </View>
        <ProductInventoryFlagsEditor
          markAsSold={markAsSold}
          markAsNonInventory={markAsNonInventory}
          onMarkAsSoldChange={onMarkAsSoldChange}
          onMarkAsNonInventoryChange={onMarkAsNonInventoryChange}
          disabled={saving}
        />
      </View>
    </DetailSection>
  )
}
