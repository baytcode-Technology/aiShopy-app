import { useEffect, useRef, useState, type ReactNode } from 'react'
import { View, type LayoutChangeEvent, type ScrollView } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SectionTitle } from '@/components/ui/Typography'
import { FormModal } from '@/components/store/FormModal'
import { CategoryPicker } from '@/components/store/CategoryPicker'
import { ProductMediaEditor } from '@/components/store/ProductMediaEditor'
import { ProductInventoryFlagsEditor } from '@/components/store/ProductInventoryFlagsEditor'
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
import { uploadProductImages } from '@src/api/uploads'
import { useStore } from '@src/contexts/store-context'
import {
  productToMediaItems,
  resolveProductMediaForSave,
  resolveThumbnailId,
  type ProductMediaItem,
} from '@src/lib/product-media'
import { parseOptionalPrice } from '@src/lib/parse-optional-price'
import {
  toCreateVariantPayload,
  uploadLocalVariantImages,
  uploadVariantImagesForCreate,
} from '@src/lib/variant-options'
import type { GeneratedVariant, VariantOption } from '@src/lib/variant-options'
import { showError, showSuccess } from '@src/lib/toast'
import type { Category } from '@src/types/category'
import { getProductStatus } from '@src/lib/product-status'
import type { Product, ProductStatus, ProductVariant } from '@src/types/product'

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
  const { store } = useStore()
  const [name, setName] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [stockQty, setStockQty] = useState('0')
  const [description, setDescription] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [status, setStatus] = useState<ProductStatus>('active')
  const [mediaItems, setMediaItems] = useState<ProductMediaItem[]>([])
  const [thumbnailId, setThumbnailId] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [existingVariants, setExistingVariants] = useState<EditableVariantRow[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [newVariants, setNewVariants] = useState<GeneratedVariant[]>([])
  const [markAsSold, setMarkAsSold] = useState(false)
  const [markAsNonInventory, setMarkAsNonInventory] = useState(false)
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
    setCompareAtPrice(
      product.compare_at_price != null ? String(product.compare_at_price) : ''
    )
    setStockQty(String(product.stock_qty))
    setDescription(product.description ?? '')
    setSku(product.sku ?? '')
    setCategoryId(product.category_id)
    setStatus(getProductStatus(product))
    const items = productToMediaItems(product)
    setMediaItems(items)
    setThumbnailId(resolveThumbnailId(items, product.thumbnail_url))
    setImageError('')
    setExistingVariants(variantsToEditable(initialVariants))
    setVariantOptions([])
    setNewVariants([])
    setNameError('')
    setPriceError('')
    setStockError('')
    setMarkAsSold(product.mark_as_sold ?? false)
    setMarkAsNonInventory(product.mark_as_non_inventory ?? false)
  }, [product, visible, initialVariants])

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = async () => {
    if (!product || !store?.id) return
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
    const compareNum = parseOptionalPrice(compareAtPrice)
    if (compareNum === undefined) {
      setPriceError('Compare at price is not valid')
      scrollToField('compareAtPrice')
      return
    }

    if (showProductStock && (!Number.isFinite(stock) || stock < 0)) {
      setStockError(stockQty.trim() ? 'Not a valid number' : 'This field is required')
      setNameError('')
      setPriceError('')
      scrollToField('stockQty')
      return
    }

    if (mediaItems.length === 0) {
      setImageError('At least one product image is required')
      scrollToField('images')
      return
    }
    if (!thumbnailId) {
      setImageError('Select a thumbnail image')
      scrollToField('images')
      return
    }

    setNameError('')
    setPriceError('')
    setStockError('')
    setImageError('')

    for (const v of existingVariants) {
      if (!v.name.trim()) {
        showError('Each variant needs a name')
        return
      }
      if (parseOptionalPrice(v.compareAtPrice) === undefined) {
        showError('Each variant needs a valid compare at price')
        return
      }
    }

    setLoading(true)
    try {
      const hasNewVariants = newVariants.length > 0
      const hasExisting = existingVariants.length > 0 || hasNewVariants

      const { images, thumbnail_url } = await resolveProductMediaForSave(
        store.id,
        mediaItems,
        thumbnailId,
        uploadProductImages
      )

      await updateProduct(product.id, {
        name: trimmedName,
        base_price: price,
        compare_at_price: compareNum,
        stock_qty: hasExisting ? 0 : Number.isFinite(stock) ? stock : 0,
        track_inventory: hasExisting || stock > 0,
        description: description.trim() || null,
        sku: sku.trim() || null,
        category_id: categoryId,
        status,
        images,
        thumbnail_url,
        mark_as_sold: markAsSold,
        mark_as_non_inventory: markAsNonInventory,
      })

      const existingVariantImageUrls = await uploadLocalVariantImages(
        store.id,
        existingVariants,
        uploadProductImages
      )

      for (const v of existingVariants) {
        const original = initialVariants.find((o) => o.id === v.id)
        const variantCompareNum = parseOptionalPrice(v.compareAtPrice)!

        let image_url: string | null | undefined
        if (v.imageRemoved) {
          image_url = null
        } else if (v.imageUri) {
          image_url = existingVariantImageUrls.get(v.id) ?? null
        }

        const payload = {
          name: v.name.trim(),
          price_delta: Number(v.priceDelta) || 0,
          compare_at_price: variantCompareNum,
          stock_qty: Number(v.stockQty) || 0,
          sku: v.sku.trim() || null,
          is_active: v.isActive,
          ...(image_url !== undefined ? { image_url } : {}),
        }
        const changed =
          !original ||
          original.name !== payload.name ||
          Number(original.price_delta) !== payload.price_delta ||
          (original.compare_at_price ?? null) !== payload.compare_at_price ||
          original.stock_qty !== payload.stock_qty ||
          (original.sku ?? '') !== (payload.sku ?? '') ||
          original.is_active !== payload.is_active ||
          image_url !== undefined

        if (changed) {
          await updateProductVariant(product.id, v.id, payload)
        }
      }

      const variantImageUrls = await uploadVariantImagesForCreate(
        store.id,
        newVariants,
        uploadProductImages
      )

      for (let i = 0; i < newVariants.length; i++) {
        const v = newVariants[i]
        await createProductVariant(product.id, {
          ...toCreateVariantPayload(v, variantImageUrls.get(v.id)),
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
      <FormImageSection onLayout={registerFieldY('images')}>
        <ProductMediaEditor
          items={mediaItems}
          thumbnailId={thumbnailId}
          onChange={(nextItems, nextThumb) => {
            setMediaItems(nextItems)
            setThumbnailId(nextThumb)
            if (nextItems.length > 0 && nextThumb) setImageError('')
          }}
          error={imageError}
        />
      </FormImageSection>

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
      <Input
        label="Compare at price"
        value={compareAtPrice}
        onChangeText={setCompareAtPrice}
        placeholder="Optional original price"
        keyboardType="decimal-pad"
        containerOnLayout={registerFieldY('compareAtPrice')}
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
      <ProductInventoryFlagsEditor
        markAsSold={markAsSold}
        markAsNonInventory={markAsNonInventory}
        onMarkAsSoldChange={setMarkAsSold}
        onMarkAsNonInventoryChange={setMarkAsNonInventory}
        disabled={loading}
      />

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

function FormImageSection({
  onLayout,
  children,
}: {
  onLayout: (e: LayoutChangeEvent) => void
  children: ReactNode
}) {
  return <View onLayout={onLayout}>{children}</View>
}
