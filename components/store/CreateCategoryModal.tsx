import { useState } from 'react'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { FormModal } from '@/components/store/FormModal'
import { createCategory } from '@src/api/categories'
import { showError, showSuccess } from '@src/lib/toast'

type Props = {
  visible: boolean
  storeId: string
  onClose: () => void
  onCreated: () => void
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export function CreateCategoryModal({ visible, storeId, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(false)

  const onNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  const reset = () => {
    setName('')
    setSlug('')
    setSlugTouched(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    const trimmedName = name.trim()
    const trimmedSlug = slug.trim().toLowerCase()

    if (!trimmedName) {
      showError('Category name is required')
      return
    }
    if (!trimmedSlug) {
      showError('Category slug is required')
      return
    }

    setLoading(true)
    try {
      const res = await createCategory({
        store_id: storeId,
        name: trimmedName,
        slug: trimmedSlug,
      })
      showSuccess(res.message)
      reset()
      onCreated()
      onClose()
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormModal
      visible={visible}
      title="New category"
      onClose={handleClose}
      footer={<AuthButton label="Create category" loading={loading} onPress={handleSubmit} />}
    >
      <AuthInput label="Category name *" value={name} onChangeText={onNameChange} placeholder="Electronics" />
      <AuthInput
        label="Slug *"
        value={slug}
        onChangeText={(v) => {
          setSlugTouched(true)
          setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))
        }}
        placeholder="electronics"
        autoCapitalize="none"
      />
    </FormModal>
  )
}
