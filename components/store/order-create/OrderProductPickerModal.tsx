import { SleekModal } from '@/components/ui/Modal'
import type { Product } from '@src/types/product'
import { OrderProductPickerBody } from './OrderProductPickerBody'

type Props = {
  visible: boolean
  products: Product[]
  loading?: boolean
  currency?: string
  onClose: () => void
  onSelectProduct: (product: Product) => void
}

export function OrderProductPickerModal({
  visible,
  products,
  loading,
  currency,
  onClose,
  onSelectProduct,
}: Props) {
  return (
    <SleekModal
      isOpen={visible}
      onClose={onClose}
      title="Products"
      minHeightRatio={0.5}
      maxHeightRatio={0.8}
      bodyScroll={false}
    >
      <OrderProductPickerBody
        products={products}
        loading={loading}
        currency={currency}
        onSelectProduct={onSelectProduct}
      />
    </SleekModal>
  )
}
