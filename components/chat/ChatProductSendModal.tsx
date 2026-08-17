import { useCallback, useEffect, useState } from 'react'
import { SleekModal } from '@/components/ui/Modal'
import { OrderProductPickerBody } from '@/components/store/order-create/OrderProductPickerBody'
import { OrderVariantPickerBody } from '@/components/store/order-create/OrderVariantPickerBody'
import { fetchProduct, fetchProducts } from '@src/api/products'
import {
  buildProductShareMessage,
  resolveProductShareImageUrl,
} from '@src/lib/product-share-message'
import { getProductStatus } from '@src/lib/product-status'
import { showError } from '@src/lib/toast'
import type { Product, ProductVariant } from '@src/types/product'

type Step = 'products' | 'variants'

export type ProductShareSendPayload = {
  text: string
  imageUrl: string | null
}

type Props = {
  visible: boolean
  storeId: number
  storeSlug: string
  currency?: string
  onClose: () => void
  onSend: (payload: ProductShareSendPayload) => void
}

export function ChatProductSendModal({
  visible,
  storeId,
  storeSlug,
  currency,
  onClose,
  onSend,
}: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [step, setStep] = useState<Step>('products')
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null)
  const [pendingVariants, setPendingVariants] = useState<ProductVariant[]>([])
  const [variantsLoading, setVariantsLoading] = useState(false)

  const reset = useCallback(() => {
    setStep('products')
    setPendingProduct(null)
    setPendingVariants([])
    setVariantsLoading(false)
  }, [])

  useEffect(() => {
    if (!visible || !storeId) return
    reset()
    setProductsLoading(true)
    fetchProducts(storeId)
      .then((res) =>
        setProducts(res.data.products.filter((p) => getProductStatus(p) === 'active')),
      )
      .catch((e) => showError(e, 'Could not load products'))
      .finally(() => setProductsLoading(false))
  }, [visible, storeId, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSheetClose = () => {
    if (step === 'variants') {
      setStep('products')
      setPendingProduct(null)
      setPendingVariants([])
      return
    }
    handleClose()
  }

  const sendProduct = (product: Product, variant: ProductVariant | null) => {
    const text = buildProductShareMessage({
      product,
      variant,
      currency,
      storeSlug,
    })
    reset()
    onSend({
      text,
      imageUrl: resolveProductShareImageUrl(product, variant),
    })
    onClose()
  }

  const handleProductSelect = async (product: Product) => {
    if (variantsLoading) return
    setPendingProduct(product)
    setVariantsLoading(true)
    try {
      const res = await fetchProduct(product.id, storeId)
      const detailProduct = res.data.product
      const active = res.data.variants.filter((v) => v.is_active)
      if (active.length > 0) {
        setPendingProduct(detailProduct)
        setPendingVariants(active)
        setStep('variants')
      } else {
        sendProduct(detailProduct, null)
      }
    } catch (e) {
      showError(e, 'Could not load product')
      setPendingProduct(null)
    } finally {
      setVariantsLoading(false)
    }
  }

  const modalTitle = step === 'products' ? 'Send product' : (pendingProduct?.name ?? 'Choose variant')
  const modalSubtitle = step === 'variants' ? 'Select a variant to send' : 'Choose a product to share'

  return (
    <SleekModal
      isOpen={visible}
      onClose={handleSheetClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      minHeightRatio={0.5}
      maxHeightRatio={0.8}
      bodyScroll={false}
    >
      {step === 'products' ? (
        <OrderProductPickerBody
          products={products}
          loading={productsLoading}
          selecting={variantsLoading}
          currency={currency}
          onSelectProduct={(product) => void handleProductSelect(product)}
        />
      ) : (
        <OrderVariantPickerBody
          product={pendingProduct}
          variants={pendingVariants}
          loading={variantsLoading}
          currency={currency}
          onSelectVariant={(variant) => {
            if (pendingProduct) sendProduct(pendingProduct, variant)
          }}
        />
      )}
    </SleekModal>
  )
}
