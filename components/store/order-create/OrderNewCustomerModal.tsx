import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SleekModal } from '@/components/ui/Modal'
import { createCustomer } from '@src/api/customers'
import { showError, showSuccess } from '@src/lib/toast'
import type { Customer } from '@src/types/customer'

type Props = {
  visible: boolean
  storeId: number
  onClose: () => void
  onCreated: (customer: Customer) => void
}

export function OrderNewCustomerModal({ visible, storeId, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const canSave = useMemo(() => name.trim().length > 0, [name])

  const reset = () => {
    setName('')
    setPhone('')
    setEmail('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = async () => {
    if (!canSave) return
    setLoading(true)
    try {
      const res = await createCustomer({
        store_id: storeId,
        name: name.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
      })
      showSuccess('Customer saved')
      reset()
      onCreated(res.data)
      onClose()
    } catch (e) {
      showError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SleekModal
      isOpen={visible}
      onClose={handleClose}
      title="New customer"
      scrollClassName="max-h-[55%]"
      footer={
        <View className="gap-3">
          <Button
            label="Save customer"
            loading={loading}
            disabled={!canSave}
            onPress={handleSave}
            size="lg"
          />
          <Pressable onPress={handleClose} className="items-center py-1">
            <Text className="text-[15px] font-medium text-gray-500">Cancel</Text>
          </Pressable>
        </View>
      }
    >
      <Input label="Name" value={name} onChangeText={setName} placeholder="Customer name" />
      <Input
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone number"
        keyboardType="phone-pad"
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </SleekModal>
  )
}
