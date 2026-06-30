import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CountryPickerField } from '@/components/store/CountryPickerField'
import { CurrencyPickerField } from '@/components/store/CurrencyPickerField'
import { FormModal } from '@/components/store/FormModal'
import { IndustryPicker } from '@/components/store/IndustryPicker'
import { PhoneNumberField } from '@/components/store/PhoneNumberField'
import { StoreLogoPicker } from '@/components/store/StoreLogoPicker'
import type { PickedImage } from '@/components/store/ProductImagePicker'
import { updateMyStore } from '@src/api/stores'
import { uploadProductImages } from '@src/api/uploads'
import {
  DEFAULT_COUNTRY,
  defaultCurrencyForCountry,
  guessCountryCodeFromName,
  type CountryValue,
} from '@src/lib/country-currency'
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
  const [country, setCountry] = useState<CountryValue>(DEFAULT_COUNTRY)
  const [currency, setCurrency] = useState('USD')
  const [currencyTouched, setCurrencyTouched] = useState(false)
  const [logoImage, setLogoImage] = useState<PickedImage | null>(null)
  const [loading, setLoading] = useState(false)
  const prevCountryCode = useRef(country.cca2)

  useEffect(() => {
    if (!visible || !store) return
    setName(store.name)
    setIndustry(store.industry ?? '')
    setDescription(store.description ?? '')
    setPhoneNumber(store.whatsapp_number)
    setCountry({
      name: store.country ?? DEFAULT_COUNTRY.name,
      cca2: guessCountryCodeFromName(store.country ?? DEFAULT_COUNTRY.name),
    })
    setCurrency(store.currency)
    setCurrencyTouched(false)
    setLogoImage(null)
    prevCountryCode.current = guessCountryCodeFromName(store.country ?? DEFAULT_COUNTRY.name)
  }, [visible, store])

  const handleCountryChange = (next: CountryValue) => {
    setCountry(next)
    if (!currencyTouched || prevCountryCode.current === country.cca2) {
      setCurrency(defaultCurrencyForCountry(next.cca2))
    }
    prevCountryCode.current = next.cca2
  }

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
    if (!country.name.trim()) {
      showError('Country is required')
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
        country: country.name.trim(),
        currency: currency.trim().toUpperCase(),
        ...(nextLogoUrl !== undefined ? { logo_url: nextLogoUrl } : {}),
      })

      if (Object.keys(patch).length === 0) {
        handleClose()
        return
      }

      const res = await updateMyStore(store.id, patch)
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
      <CountryPickerField value={country} onChange={handleCountryChange} />
      <CurrencyPickerField
        value={currency}
        onChange={(code) => {
          setCurrencyTouched(true)
          setCurrency(code)
        }}
      />
      <PhoneNumberField
        value={phoneNumber}
        onChange={setPhoneNumber}
        resetKey={store ? `${store.id}-${visible}` : undefined}
        label="Phone number *"
      />
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
    </FormModal>
  )
}
