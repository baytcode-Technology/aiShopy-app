import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormModal } from '@/components/store/FormModal'
import { ProductVariantOptionsManager } from '@/components/store/ProductVariantOptionsManager'
import { uploadProductImages } from '@src/api/uploads'
import { useStore } from '@src/contexts/store-context'
import { parseOptionalPrice } from '@src/lib/parse-optional-price'
import { persistVariantChanges } from '@src/lib/variant-persist'
import {
  diffVariants,
  hydrateVariantEditorState,
  type GeneratedVariant,
  type VariantOption,
} from '@src/lib/variant-options'
import { showError, showSuccess } from '@src/lib/toast'
import type { Product, ProductVariant } from '@src/types/product'

type Props = {
  visible: boolean
  product: Product | null
  variants: ProductVariant[]
  onClose: () => void
  onSaved: () => void
}

export function ManageVariantOptionsModal({
  visible,
  product,
  variants: initialVariants,
  onClose,
  onSaved,
}: Props) {
  const { store } = useStore()
  const [options, setOptions] = useState<VariantOption[]>([])
  const [generated, setGenerated] = useState<GeneratedVariant[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!visible) return
    const state = hydrateVariantEditorState(initialVariants)
    setOptions(state.options)
    setGenerated(state.generated)
  }, [visible, initialVariants])

  const validate = (): boolean => {
    for (const v of generated) {
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

  const save = async () => {
    if (!product || !store?.id) return
    if (!validate()) return

    setLoading(true)
    try {
      const result = await persistVariantChanges({
        productId: product.id,
        storeId: store.id,
        generated,
        initialVariants,
        uploadImages: uploadProductImages,
      })

      const parts: string[] = []
      if (result.created) parts.push(`${result.created} added`)
      if (result.updated) parts.push(`${result.updated} updated`)
      if (result.deleted) parts.push(`${result.deleted} removed`)
      showSuccess(parts.length ? `Variants saved (${parts.join(', ')})` : 'Variants saved')
      onSaved()
      onClose()
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  const handleSave = () => {
    if (!product || !store?.id) return
    if (!validate()) return

    const { toDelete } = diffVariants(generated, initialVariants)
    if (toDelete.length > 0) {
      setConfirmDelete(true)
      return
    }
    void save()
  }

  return (
    <>
      <FormModal
        visible={visible}
        title="Manage options"
        onClose={onClose}
        footer={<Button label="Save changes" loading={loading} onPress={handleSave} />}
      >
        <ProductVariantOptionsManager
          existingVariants={initialVariants}
          options={options}
          generatedVariants={generated}
          onChange={(nextOptions, nextGenerated) => {
            setOptions(nextOptions)
            setGenerated(nextGenerated)
          }}
        />
      </FormModal>

      <ConfirmDialog
        visible={confirmDelete}
        title="Remove variants?"
        message="Removing option values will delete variants that use them. Continue?"
        confirmLabel="Save changes"
        loading={loading}
        onConfirm={() => void save()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}
