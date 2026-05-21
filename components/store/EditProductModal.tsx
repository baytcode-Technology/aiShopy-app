import { useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { FormModal } from '@/components/store/FormModal'
import { CategoryPicker } from '@/components/store/CategoryPicker'
import { ShopifyVariantEditor } from '@/components/store/ShopifyVariantEditor'
import {
  VariantListEditor,
  variantsToEditable,
  type EditableVariantRow,
} from '@/components/store/VariantListEditor'
import {
  createProductVariant,
  updateProduct,
  updateProductVariant,
} from '@src/api/products'
import { toCreateVariantPayload } from '@src/lib/variant-options'
import type { GeneratedVariant, VariantOption } from '@src/lib/variant-options'
import { showError, showSuccess } from '@src/lib/toast'
import type { Category } from '@src/types/category'
import type { Product, ProductVariant } from '@src/types/product'
import { theme } from '@src/theme/colors'

function isNewVariantId(id: string): boolean {
  return id.startsWith('gen-')
}

type Props = {
  visible: boolean
  product: Product | null
  variants: ProductVariant[]
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export function EditProductModal({
  visible,
  product,
  variants: initialVariants,
  categories,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [stockQty, setStockQty] = useState('0')
  const [description, setDescription] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [existingVariants, setExistingVariants] = useState<EditableVariantRow[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [newVariants, setNewVariants] = useState<GeneratedVariant[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!product || !visible) return
    setName(product.name)
    setBasePrice(String(product.base_price))
    setStockQty(String(product.stock_qty))
    setDescription(product.description ?? '')
    setSku(product.sku ?? '')
    setCategoryId(product.category_id)
    setIsActive(product.is_active)
    setExistingVariants(variantsToEditable(initialVariants))
    setVariantOptions([])
    setNewVariants([])
  }, [product, visible, initialVariants])

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = async () => {
    if (!product) return
    const trimmedName = name.trim()
    const price = Number(basePrice)
    const stock = Number(stockQty)

    if (!trimmedName) {
      showError('Product name is required')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      showError('Enter a valid price')
      return
    }

    for (const v of existingVariants) {
      if (!v.name.trim()) {
        showError('Each variant needs a name')
        return
      }
    }

    setLoading(true)
    try {
      const hasNewVariants = newVariants.length > 0
      const hasExisting = existingVariants.length > 0 || hasNewVariants

      await updateProduct(product.id, {
        name: trimmedName,
        base_price: price,
        stock_qty: hasExisting ? 0 : Number.isFinite(stock) ? stock : 0,
        track_inventory: hasExisting || stock > 0,
        description: description.trim() || null,
        sku: sku.trim() || null,
        category_id: categoryId,
        is_active: isActive,
      })

      for (const v of existingVariants) {
        const original = initialVariants.find((o) => o.id === v.id)
        const payload = {
          name: v.name.trim(),
          price_delta: Number(v.priceDelta) || 0,
          stock_qty: Number(v.stockQty) || 0,
          sku: v.sku.trim() || null,
        }
        const changed =
          !original ||
          original.name !== payload.name ||
          Number(original.price_delta) !== payload.price_delta ||
          original.stock_qty !== payload.stock_qty ||
          (original.sku ?? '') !== (payload.sku ?? '')

        if (changed) {
          await updateProductVariant(product.id, v.id, payload)
        }
      }

      for (let i = 0; i < newVariants.length; i++) {
        const v = newVariants[i]
        await createProductVariant(product.id, {
          ...toCreateVariantPayload(v),
          sort_order: existingVariants.length + i,
        })
      }

      showSuccess('Product updated')
      onSaved()
      onClose()
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  const showProductStock = existingVariants.length === 0 && newVariants.length === 0

  return (
    <FormModal
      visible={visible}
      title="Edit product"
      onClose={handleClose}
      footer={<AuthButton label="Save changes" loading={loading} onPress={handleSubmit} />}
    >
      <AuthInput label="Product name *" value={name} onChangeText={setName} />
      <AuthInput
        label="Base price *"
        value={basePrice}
        onChangeText={setBasePrice}
        keyboardType="decimal-pad"
      />
      {showProductStock ? (
        <AuthInput
          label="Stock quantity"
          value={stockQty}
          onChangeText={setStockQty}
          keyboardType="number-pad"
        />
      ) : null}
      <AuthInput label="SKU" value={sku} onChangeText={setSku} autoCapitalize="none" />
      <CategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
      <AuthInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.multiline}
      />
      <AuthButton
        label={isActive ? 'Status: Active (tap to deactivate)' : 'Status: Inactive (tap to activate)'}
        variant="outline"
        onPress={() => setIsActive((a) => !a)}
      />

      {product ? (
        <VariantListEditor
          productId={product.id}
          variants={existingVariants}
          onChange={setExistingVariants}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Add new variants</Text>
      <ShopifyVariantEditor
        options={variantOptions}
        variants={newVariants.filter((v) => isNewVariantId(v.id))}
        onChange={(options, generated) => {
          setVariantOptions(options)
          setNewVariants(generated)
        }}
      />
    </FormModal>
  )
}

const styles = StyleSheet.create({
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.black,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
})
