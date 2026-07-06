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

export default function CreateStoreScreen() {
  const { signOut } = useAuth()
  const { activateStoreSession, clearStore, refreshStores } = useStore()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
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

  useEffect(() => {
    void fetchSupportAdminStatus()
      .then((res) => setIsPlatformAdmin(res.data.isAdmin))
      .catch(() => setIsPlatformAdmin(false))
  }, [])

  const onNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) {
      setSlug(slugifyFromName(value))
    }
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
        if (!next[key]) {
          next[key] = issue.message
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
        <Button
          label="Sign out"
          variant="ghost"
          onPress={() => void handleSignOut()}
          className="w-full"
        />
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
      <AuthInput
        label="Store slug (subdomain) *"
        value={slug}
        onChangeText={(v) => {
          setSlugTouched(true)
          setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))
        }}
        placeholder="my-shop"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.slug}
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
        value={whatsappNumber}
        onChange={setWhatsappNumber}
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
