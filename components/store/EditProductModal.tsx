import { useEffect, useRef, useState, type ReactNode } from 'react'
import { View, type LayoutChangeEvent, type ScrollView } from 'react-native'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { FormModal } from '@/components/store/FormModal'
import { CategoryPicker } from '@/components/store/CategoryPicker'
import { ProductMediaEditor } from '@/components/store/ProductMediaEditor'
import { ProductInventoryFlagsEditor } from '@/components/store/ProductInventoryFlagsEditor'
import { ProductStatusPicker } from '@/components/store/ProductStatusPicker'
import { ProductVariantOptionsManager } from '@/components/store/ProductVariantOptionsManager'
import { ShopifyVariantEditor } from '@/components/store/ShopifyVariantEditor'
import { createProductVariant, updateProduct } from '@src/api/products'
import { uploadProductImages } from '@src/api/uploads'
import { useStore } from '@src/contexts/store-context'
import {
  productToMediaItems,
  resolveProductMediaForSave,
  resolveThumbnailId,
  type ProductMediaItem,
} from '@src/lib/product-media'
import { parseOptionalPrice } from '@src/lib/parse-optional-price'
import { persistVariantChanges } from '@src/lib/variant-persist'
import {
  diffVariants,
  hydrateVariantEditorState,
  toCreateVariantPayload,
  uploadVariantImagesForCreate,
  type GeneratedVariant,
  type VariantOption,
} from '@src/lib/variant-options'
import { showError, showSuccess } from '@src/lib/toast'
import type { Category } from '@src/types/category'
import { getProductStatus } from '@src/lib/product-status'
import type { Product, ProductStatus, ProductVariant } from '@src/types/product'

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
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [status, setStatus] = useState<ProductStatus>('active')
  const [mediaItems, setMediaItems] = useState<ProductMediaItem[]>([])
  const [thumbnailId, setThumbnailId] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([])
  const [markAsSold, setMarkAsSold] = useState(false)
  const [markAsNonInventory, setMarkAsNonInventory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const hasExistingVariants = initialVariants.length > 0

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

    if (initialVariants.length > 0) {
      const hydrated = hydrateVariantEditorState(initialVariants)
      setVariantOptions(hydrated.options)
      setGeneratedVariants(hydrated.generated)
    } else {
      setVariantOptions([])
      setGeneratedVariants([])
    }

    setNameError('')
    setPriceError('')
    setStockError('')
    setMarkAsSold(product.mark_as_sold ?? false)
    setMarkAsNonInventory(product.mark_as_non_inventory ?? false)
  }, [product, visible, initialVariants])

  const validateVariants = (): boolean => {
    for (const v of generatedVariants) {
      if (!v.name.trim()) {
        showError('Each variant needs a name')
        return false
      }
      if (parseOptionalPrice(v.compareAtPrice) === undefined) {
        showError(`Invalid compare at price for ${v.name}`)
        return false
      }
    }
    return true
  }

  const submit = async () => {
    if (!product || !store?.id) return

    setLoading(true)
    try {
      const hasVariants = generatedVariants.length > 0

      const { images, thumbnail_url } = await resolveProductMediaForSave(
        store.id,
        mediaItems,
        thumbnailId,
        uploadProductImages
      )

      await updateProduct(product.id, {
        name: name.trim(),
        base_price: Number(basePrice),
        compare_at_price: parseOptionalPrice(compareAtPrice) ?? null,
        stock_qty: hasVariants ? 0 : Number(stockQty) || 0,
        track_inventory: hasVariants || Number(stockQty) > 0,
        description: description.trim() || null,
        sku: sku.trim() || null,
        category_id: categoryId,
        status,
        images,
        thumbnail_url,
        mark_as_sold: hasVariants ? false : markAsSold,
        mark_as_non_inventory: hasVariants ? false : markAsNonInventory,
      })

      if (hasExistingVariants) {
        await persistVariantChanges({
          productId: product.id,
          storeId: store.id,
          generated: generatedVariants,
          initialVariants,
          uploadImages: uploadProductImages,
        })
      } else if (generatedVariants.length > 0) {
        const variantImageUrls = await uploadVariantImagesForCreate(
          store.id,
          generatedVariants,
          uploadProductImages
        )
        for (let i = 0; i < generatedVariants.length; i++) {
          const v = generatedVariants[i]
          await createProductVariant(product.id, {
            ...toCreateVariantPayload(v, variantImageUrls.get(v.id)),
            sort_order: i,
          })
        }
      }

      showSuccess('Product updated')
      onSaved()
      onClose()
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
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

    if (!validateVariants()) return

    setNameError('')
    setPriceError('')
    setStockError('')
    setImageError('')

    if (hasExistingVariants) {
      const { toDelete } = diffVariants(generatedVariants, initialVariants)
      if (toDelete.length > 0) {
        setConfirmDelete(true)
        return
      }
    }

    await submit()
  }

  const showProductStock = !hasExistingVariants && generatedVariants.length === 0

  return (
    <>
      <FormModal
        visible={visible}
        title="Edit product"
        onClose={onClose}
        scrollViewRef={scrollViewRef}
        footer={<Button label="Save changes" loading={loading} onPress={() => void handleSubmit()} />}
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
        {showProductStock ? (
          <ProductInventoryFlagsEditor
            markAsSold={markAsSold}
            markAsNonInventory={markAsNonInventory}
            onMarkAsSoldChange={setMarkAsSold}
            onMarkAsNonInventoryChange={setMarkAsNonInventory}
            disabled={loading}
          />
        ) : null}

        {hasExistingVariants ? (
          <ProductVariantOptionsManager
            existingVariants={initialVariants}
            options={variantOptions}
            generatedVariants={generatedVariants}
            onChange={(nextOptions, nextGenerated) => {
              setVariantOptions(nextOptions)
              setGeneratedVariants(nextGenerated)
            }}
          />
        ) : (
          <ShopifyVariantEditor
            options={variantOptions}
            variants={generatedVariants}
            onChange={(nextOptions, nextGenerated) => {
              setVariantOptions(nextOptions)
              setGeneratedVariants(nextGenerated)
            }}
          />
        )}
      </FormModal>

      <ConfirmDialog
        visible={confirmDelete}
        title="Remove variants?"
        message="Removing option values will delete variants that use them. Continue?"
        confirmLabel="Save changes"
        loading={loading}
        onConfirm={() => void submit()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
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
