import { AuthButton } from '@/components/auth/AuthButton'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Caption, SectionTitle } from '@/components/ui/Typography'
import { createStore } from '@src/api/stores'
import { env } from '@src/config/env'
import { useStore } from '@src/contexts/store-context'
import { showError, showSuccess } from '@src/lib/toast'
import {
  createStoreFormSchema,
  slugifyFromName,
  toCreateStorePayload,
  type CreateStoreFormValues,
} from '@src/validations/store.validation'
import { router, type Href } from 'expo-router'
import { useState } from 'react'

type FieldErrors = Partial<Record<keyof CreateStoreFormValues, string>>

export default function CreateStoreScreen() {
  const { activateStoreSession } = useStore()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [description, setDescription] = useState('')
  const [industry, setIndustry] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  const onNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) {
      setSlug(slugifyFromName(value))
    }
  }

  const onSubmit = async () => {
    const parsed = createStoreFormSchema.safeParse({
      name,
      slug,
      whatsapp_number: whatsappNumber,
      currency,
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
      await activateStoreSession(res.data.store, res.data.subdomainUrl)
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
    >
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
      <AuthInput
        label="WhatsApp number *"
        value={whatsappNumber}
        onChangeText={setWhatsappNumber}
        placeholder="+919876543210"
        keyboardType="phone-pad"
        error={errors.whatsapp_number}
      />
      <AuthInput
        label="Currency *"
        value={currency}
        onChangeText={(v) =>
          setCurrency(
            v
              .toUpperCase()
              .replace(/[^A-Z]/g, '')
              .slice(0, 3),
          )
        }
        placeholder="INR"
        autoCapitalize="characters"
        maxLength={3}
        error={errors.currency}
      />
      <AuthInput
        label="Industry"
        value={industry}
        onChangeText={setIndustry}
        placeholder="e.g. Fashion, Electronics, Food"
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
