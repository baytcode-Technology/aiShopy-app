import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SectionTitle } from '@/components/ui/Typography'
import { FormModal } from '@/components/store/FormModal'
import { CategoryPicker } from '@/components/store/CategoryPicker'
import { ProductStatusPicker } from '@/components/store/ProductStatusPicker'
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
import { getProductStatus } from '@src/lib/product-status'
import type { Product, ProductStatus, ProductVariant } from '@src/types/product'
import type { LayoutChangeEvent, ScrollView } from 'react-native'

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
  const [status, setStatus] = useState<ProductStatus>('active')
  const [existingVariants, setExistingVariants] = useState<EditableVariantRow[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [newVariants, setNewVariants] = useState<GeneratedVariant[]>([])
  const [loading, setLoading] = useState(false)

  const [nameError, setNameError] = useState('')
  const [priceError, setPriceError] = useState('')
  const [stockError, setStockError] = useState('')

  const scrollViewRef = useRef<ScrollView>(null)
  const fieldY = useRef<Record<string, number | undefined>>({})

  const registerFieldY = (key: string) => (e: LayoutChangeEvent) => {
    fieldY.current[key] = e.nativeEvent.layout.y
  }

  const scrollToField = (key: string) => {
    const y = fieldY.current[key]
    if (typeof y !== 'number') return
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true })
  }

  useEffect(() => {
    if (!product || !visible) return
    setName(product.name)
    setBasePrice(String(product.base_price))
    setStockQty(String(product.stock_qty))
    setDescription(product.description ?? '')
    setSku(product.sku ?? '')
    setCategoryId(product.category_id)
    setStatus(getProductStatus(product))
    setExistingVariants(variantsToEditable(initialVariants))
    setVariantOptions([])
    setNewVariants([])
    setNameError('')
    setPriceError('')
    setStockError('')
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
      setNameError('This field is required')
      setPriceError('')
      setStockError('')
      scrollToField('name')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      setPriceError(basePrice.trim() ? 'Not a valid number' : 'This field is required')
      setNameError('')
      setStockError('')
      scrollToField('basePrice')
      return
    }

    if (showProductStock && (!Number.isFinite(stock) || stock < 0)) {
      setStockError(stockQty.trim() ? 'Not a valid number' : 'This field is required')
      setNameError('')
      setPriceError('')
      scrollToField('stockQty')
      return
    }

    setNameError('')
    setPriceError('')
    setStockError('')

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
        status,
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
      scrollViewRef={scrollViewRef}
      footer={<Button label="Save changes" loading={loading} onPress={handleSubmit} />}
    >
      <Input
        label="Product name *"
        value={name}
        onChangeText={setName}
        error={nameError || undefined}
        containerOnLayout={registerFieldY('name')}
      />
      <Input
        label="Base price *"
        value={basePrice}
        onChangeText={setBasePrice}
        keyboardType="decimal-pad"
        error={priceError || undefined}
        containerOnLayout={registerFieldY('basePrice')}
      />
      {showProductStock ? (
        <Input
          label="Stock quantity"
          value={stockQty}
          onChangeText={setStockQty}
          keyboardType="number-pad"
          error={stockError || undefined}
          containerOnLayout={registerFieldY('stockQty')}
        />
      ) : null}
      <Input label="SKU" value={sku} onChangeText={setSku} autoCapitalize="none" />
      <CategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        inputClassName="min-h-20"
        style={{ textAlignVertical: 'top' }}
      />
      <ProductStatusPicker value={status} onChange={setStatus} />

      {product ? (
        <VariantListEditor
          productId={product.id}
          variants={existingVariants}
          onChange={setExistingVariants}
        />
      ) : null}

      <SectionTitle className="mt-1">Add new variants</SectionTitle>
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
