import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { FormModal } from '@/components/store/FormModal'
import { StoreLogoPicker } from '@/components/store/StoreLogoPicker'
import type { PickedImage } from '@/components/store/ProductImagePicker'
import { updateMyStore } from '@src/api/stores'
import { uploadProductImages } from '@src/api/uploads'
import { showError, showSuccess } from '@src/lib/toast'
import type { Store } from '@src/types/store'

type Props = {
  visible: boolean
  store: Store | null
  onClose: () => void
  onUpdated: (store: Store) => void
}

export function EditStoreLogoModal({ visible, store, onClose, onUpdated }: Props) {
  const [image, setImage] = useState<PickedImage | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      setImage(null)
    }
  }, [visible])

  const handleClose = () => {
    setImage(null)
    onClose()
  }

  const handleSave = async () => {
    if (!store) return
    if (!image) {
      showError('Choose a new logo image')
      return
    }

    setLoading(true)
    try {
      const [logoUrl] = await uploadProductImages(store.id, [
        { uri: image.uri, name: image.name, type: image.type },
      ])

      if (logoUrl === store.logo_url) {
        handleClose()
        return
      }

      const res = await updateMyStore(store.id, { logo_url: logoUrl })
      onUpdated(res.data.store)
      showSuccess('Store logo updated')
      handleClose()
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  if (!store) return null

  return (
    <FormModal
      visible={visible}
      title="Edit logo"
      subtitle="Choose a new image for your store"
      onClose={handleClose}
      footer={<Button label="Save logo" loading={loading} onPress={handleSave} />}
    >
      <StoreLogoPicker
        image={image}
        remoteUrl={store.logo_url}
        storeName={store.name}
        onChange={setImage}
        variant="round"
      />
    </FormModal>
  )
}
