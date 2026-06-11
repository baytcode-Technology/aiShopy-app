import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormModal } from '@/components/store/FormModal'
import { IndustryPicker } from '@/components/store/IndustryPicker'
import { StoreLogoPicker } from '@/components/store/StoreLogoPicker'
import type { PickedImage } from '@/components/store/ProductImagePicker'
import { updateMyStore } from '@src/api/stores'
import { uploadProductImages } from '@src/api/uploads'
import { buildStoreUpdatePatch } from '@src/lib/store-patch'
import { showError, showSuccess } from '@src/lib/toast'
import type { Store } from '@src/types/store'

type Props = {
  visible: boolean
  store: Store | null
  onClose: () => void
  onUpdated: (store: Store) => void
}

export function EditStoreModal({ visible, store, onClose, onUpdated }: Props) {
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [description, setDescription] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [logoImage, setLogoImage] = useState<PickedImage | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible || !store) return
    setName(store.name)
    setIndustry(store.industry ?? '')
    setDescription(store.description ?? '')
    setPhoneNumber(store.whatsapp_number)
    setLogoImage(null)
  }, [visible, store])

  const handleClose = () => {
    setLogoImage(null)
    onClose()
  }

  const handleSave = async () => {
    if (!store) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      showError('Store name is required')
      return
    }
    if (!phoneNumber.trim()) {
      showError('Phone number is required')
      return
    }

    setLoading(true)
    try {
      let nextLogoUrl: string | null | undefined = undefined

      if (logoImage) {
        const [uploaded] = await uploadProductImages(store.id, [
          { uri: logoImage.uri, name: logoImage.name, type: logoImage.type },
        ])
        nextLogoUrl = uploaded
      }

      const patch = buildStoreUpdatePatch(store, {
        name: trimmedName,
        industry,
        description,
        whatsapp_number: phoneNumber.trim(),
        ...(nextLogoUrl !== undefined ? { logo_url: nextLogoUrl } : {}),
      })

      if (Object.keys(patch).length === 0) {
        handleClose()
        return
      }

      const res = await updateMyStore(patch)
      onUpdated(res.data.store)
      showSuccess('Store updated')
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
      title="Edit store"
      onClose={handleClose}
      footer={<Button label="Save changes" loading={loading} onPress={handleSave} />}
    >
      <StoreLogoPicker
        image={logoImage}
        remoteUrl={store.logo_url}
        storeName={store.name}
        onChange={setLogoImage}
        label="Store logo"
      />
      <Input label="Store name *" value={name} onChangeText={setName} placeholder="My Shop" />
      <IndustryPicker value={industry} onChange={setIndustry} />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Tell customers about your shop"
        multiline
        numberOfLines={3}
        inputClassName="min-h-[96px]"
        style={{ textAlignVertical: 'top' }}
      />
      <Input
        label="Phone number *"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="+919876543210"
        keyboardType="phone-pad"
      />
    </FormModal>
  )
}
