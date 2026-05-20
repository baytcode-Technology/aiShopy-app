import { useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { FormModal } from '@/components/store/FormModal'
import { ProductImagePicker, type PickedImage } from '@/components/store/ProductImagePicker'
import { createProduct } from '@src/api/products'
import { uploadProductImages } from '@src/api/uploads'
import { showError, showSuccess } from '@src/lib/toast'
import { theme } from '@src/theme/colors'

type Props = {
  visible: boolean
  storeId: string
  onClose: () => void
  onCreated: () => void
}

export function CreateProductModal({ visible, storeId, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [stockQty, setStockQty] = useState('0')
  const [description, setDescription] = useState('')
  const [sku, setSku] = useState('')
  const [images, setImages] = useState<PickedImage[]>([])
  const [thumbnailId, setThumbnailId] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setName('')
    setBasePrice('')
    setStockQty('0')
    setDescription('')
    setSku('')
    setImages([])
    setThumbnailId(null)
    setImageError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
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
    if (images.length === 0) {
      setImageError('At least one product image is required')
      showError('Add at least one product image')
      return
    }
    if (!thumbnailId) {
      setImageError('Select a thumbnail image')
      showError('Tap an image to set it as thumbnail')
      return
    }

    setImageError('')
    setLoading(true)

    try {
      const urls = await uploadProductImages(
        storeId,
        images.map((img) => ({ uri: img.uri, name: img.name, type: img.type }))
      )

      const thumbIndex = images.findIndex((img) => img.id === thumbnailId)
      const thumbnailUrl = urls[thumbIndex] ?? urls[0]
      if (!thumbnailUrl) {
        throw new Error('Thumbnail URL is required')
      }

      await createProduct({
        store_id: storeId,
        name: trimmedName,
        base_price: price,
        stock_qty: Number.isFinite(stock) ? stock : 0,
        track_inventory: stock > 0,
        description: description.trim() || undefined,
        sku: sku.trim() || undefined,
        images: urls,
        thumbnail_url: thumbnailUrl,
      })
      reset()
      onCreated()
      onClose()
      showSuccess('Product created successfully')
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormModal
      visible={visible}
      title="New product"
      onClose={handleClose}
      footer={<AuthButton label="Create product" loading={loading} onPress={handleSubmit} />}
    >
      <ProductImagePicker
        images={images}
        thumbnailId={thumbnailId}
        onChange={(nextImages, nextThumb) => {
          setImages(nextImages)
          setThumbnailId(nextThumb)
          if (nextImages.length > 0 && nextThumb) {
            setImageError('')
          }
        }}
        error={imageError}
      />
      <AuthInput label="Product name *" value={name} onChangeText={setName} placeholder="Premium Headphones" />
      <AuthInput
        label="Base price *"
        value={basePrice}
        onChangeText={setBasePrice}
        placeholder="299"
        keyboardType="decimal-pad"
      />
      <AuthInput
        label="Stock quantity"
        value={stockQty}
        onChangeText={setStockQty}
        placeholder="0"
        keyboardType="number-pad"
      />
      <AuthInput label="SKU" value={sku} onChangeText={setSku} placeholder="SKU-001" autoCapitalize="none" />
      <AuthInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Product details"
        multiline
        numberOfLines={3}
        style={styles.multiline}
      />
      <Text style={styles.note}>Images are uploaded to storage, then saved on the product.</Text>
    </FormModal>
  )
}

const styles = StyleSheet.create({
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  note: { fontSize: 12, color: theme.gray600 },
})
