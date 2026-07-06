import { SleekModal } from '@/components/ui/Modal'
import type { Product, ProductVariant } from '@src/types/product'
import { OrderVariantPickerBody } from './OrderVariantPickerBody'

type Props = {
  visible: boolean
  product: Product | null
  variants: ProductVariant[]
  loading?: boolean
  currency?: string
  onClose: () => void
  onSelectVariant: (variant: ProductVariant) => void
}

export function OrderVariantPickerModal({
  visible,
  product,
  variants,
  loading,
  currency,
  onClose,
  onSelectVariant,
}: Props) {
  return (
    <SleekModal
      isOpen={visible}
      onClose={onClose}
      title={product?.name ?? 'Choose variant'}
      subtitle="Select a variant to add"
      minHeightRatio={0.5}
      maxHeightRatio={0.8}
      bodyScroll={false}
    >
      <OrderVariantPickerBody
        product={product}
        variants={variants}
        loading={loading}
        currency={currency}
        onSelectVariant={onSelectVariant}
      />
    </SleekModal>
  )
}
