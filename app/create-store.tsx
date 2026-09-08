import { DeleteAccountSection } from '@/components/account/DeleteAccountSection'
import { AuthButton } from '@/components/auth/AuthButton'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { CountryPickerField } from '@/components/store/CountryPickerField'
import { CurrencyPickerField } from '@/components/store/CurrencyPickerField'
import { IndustryPicker } from '@/components/store/IndustryPicker'
import { PhoneNumberField } from '@/components/store/PhoneNumberField'
import { Button } from '@/components/ui/Button'
import { Caption, LinkText, SectionTitle } from '@/components/ui/Typography'
import { createStore } from '@src/api/stores'
import { fetchSupportAdminStatus } from '@src/api/support'
import { env } from '@src/config/env'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { getApiErrorCode } from '@src/lib/api-error'
import {
  DEFAULT_COUNTRY,
  defaultCurrencyForCountry,
  type CountryValue,
} from '@src/lib/country-currency'
import { performSignOut } from '@src/lib/safe-sign-out'
import { showError, showSuccess } from '@src/lib/toast'
import {
  createStoreFormSchema,
  slugifyFromName,
  toCreateStorePayload,
  type CreateStoreFormValues,
} from '@src/validations/store.validation'
import { router, type Href } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'

type FieldErrors = Partial<Record<keyof CreateStoreFormValues, string>>

const STORE_NAME_TAKEN_TOAST =
  'This store name is already taken. Change the store name.'
const STORE_NAME_TAKEN_HELPER = 'Already exists. Change the store name.'
const CONTACT_TAKEN_TOAST =
  'This contact number is already registered. Use a different number or leave it blank.'
const CONTACT_TAKEN_HELPER =
  'Already registered. Use a different number or leave it blank.'

export default function CreateStoreScreen() {
  const { signOut } = useAuth()
  const { activateStoreSession, clearStore, refreshStores } = useStore()
  const [name, setName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [country, setCountry] = useState<CountryValue>(DEFAULT_COUNTRY)
  const [currency, setCurrency] = useState('USD')
  const [currencyTouched, setCurrencyTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [industry, setIndustry] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)
  const prevCountryCode = useRef(country.cca2)

  const slug = slugifyFromName(name)

  useEffect(() => {
    void fetchSupportAdminStatus()
      .then((res) => setIsPlatformAdmin(res.data.isAdmin))
      .catch(() => setIsPlatformAdmin(false))
  }, [])

  const clearFieldError = (key: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const onNameChange = (value: string) => {
    setName(value)
    clearFieldError('name')
  }

  const onWhatsappChange = (value: string) => {
    setWhatsappNumber(value)
    clearFieldError('whatsapp_number')
  }

  const handleCountryChange = (next: CountryValue) => {
    setCountry(next)
    if (!currencyTouched || prevCountryCode.current === country.cca2) {
      setCurrency(defaultCurrencyForCountry(next.cca2))
    }
    prevCountryCode.current = next.cca2
  }

  const handleSignOut = () => {
    void performSignOut(clearStore, signOut)
  }

  const onSubmit = async () => {
    const parsed = createStoreFormSchema.safeParse({
      name,
      slug,
      whatsapp_number: whatsappNumber,
      currency,
      country: country.name,
      description: description || null,
      industry: industry || null,
    })

    if (!parsed.success) {
      const next: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CreateStoreFormValues
        const field = key === 'slug' ? 'name' : key
        if (!next[field]) {
          next[field] = issue.message
        }
      }
      setErrors(next)
      showError(parsed.error.issues[0]?.message ?? 'Please fix the form')
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const res = await createStore(toCreateStorePayload(parsed.data))
      await refreshStores()
      await activateStoreSession(res.data.store, res.data.subdomainUrl, 'owner')
      showSuccess(
        res.message,
        `${res.data.store.slug}.${env.storefrontBaseDomain}`,
      )
      router.replace('/(store)/chats' as Href)
    } catch (e) {
      const code = getApiErrorCode(e)
      if (code === 'SLUG_EXISTS' || code === 'CONFLICT') {
        setErrors({ name: STORE_NAME_TAKEN_HELPER })
        showError(STORE_NAME_TAKEN_TOAST)
        return
      }
      if (code === 'WHATSAPP_EXISTS') {
        setErrors({ whatsapp_number: CONTACT_TAKEN_HELPER })
        showError(CONTACT_TAKEN_TOAST)
        return
      }
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your store"
      subtitle="Required fields are marked with *. Optional fields can be added now or later."
      footer={
        <View className="w-full items-center gap-3">
          <Button
            label="Sign out"
            variant="ghost"
            onPress={() => void handleSignOut()}
            className="w-full"
          />
          <DeleteAccountSection variant="link" />
          <Pressable
            onPress={() => router.push('/ai-privacy' as Href)}
            hitSlop={8}
            className="py-1"
          >
            <LinkText className="text-[14px] font-semibold no-underline">
              AI & data privacy
            </LinkText>
          </Pressable>
        </View>
      }
    >
      {isPlatformAdmin ? (
        <View className="mb-2">
          <Pressable
            onPress={() => router.replace("/platform-admin" as Href)}
            hitSlop={8}
          >
            <LinkText className="text-[14px] text-brand-green">
              Skip — open Admin home
            </LinkText>
          </Pressable>
        </View>
      ) : null}
      <SectionTitle className="mt-4 mb-1.5">Basics</SectionTitle>
      <AuthInput
        label="Store name *"
        value={name}
        onChangeText={onNameChange}
        placeholder="My Shop"
        error={errors.name}
      />
      <Caption className="pl-1 -mt-1 mb-2.5">
        Your store domain: {slug || 'my-shop'}.{env.storefrontBaseDomain}
      </Caption>

      <CountryPickerField
        variant="auth"
        value={country}
        onChange={handleCountryChange}
        error={errors.country}
      />
      <CurrencyPickerField
        variant="auth"
        value={currency}
        onChange={(code) => {
          setCurrencyTouched(true)
          setCurrency(code)
        }}
        error={errors.currency}
      />
      <PhoneNumberField
        variant="auth"
        label="Contact number"
        value={whatsappNumber}
        onChange={onWhatsappChange}
        error={errors.whatsapp_number}
      />

      <IndustryPicker
        variant="auth"
        value={industry}
        onChange={setIndustry}
        error={errors.industry}
      />
      <AuthInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Tell customers about your shop"
        multiline
        numberOfLines={3}
        style={{ minHeight: 100, textAlignVertical: 'top', borderRadius: 14 }}
        error={errors.description}
      />

      <AuthButton label="Create store" loading={loading} onPress={onSubmit} />
    </AuthLayout>
  )
}
