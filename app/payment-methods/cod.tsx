import { useCallback, useState } from 'react'
import { Switch, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { PaymentMethodConfigLayout } from '@/components/store/PaymentMethodConfigLayout'
import { Button } from '@/components/ui/Button'
import { Label, Muted } from '@/components/ui/Typography'
import { fetchPaymentConfig, updatePaymentConfig } from '@src/api/payment-config'
import { shadows } from '@src/lib/shadows'
import { showError, showSuccess } from '@src/lib/toast'

export default function CodPaymentScreen() {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchPaymentConfig()
      setEnabled(res.data.payment_config.cod.enabled)
    } catch (e) {
      showError(e, 'Could not load payment settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load])
  )

  const save = async () => {
    setSaving(true)
    try {
      await updatePaymentConfig({ cod: { enabled } })
      showSuccess('Cash on delivery settings saved')
    } catch (e) {
      showError(e, 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PaymentMethodConfigLayout
      title="Cash on delivery"
      subtitle="Pay when the order arrives"
      footer={<Button label="Save" loading={saving || loading} onPress={save} />}
    >
      <View className="rounded-[28px] border border-gray-200 bg-surface px-5 py-5" style={shadows.card}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Label>Enable COD</Label>
            <Muted className="text-xs mt-1">
              Customers can choose cash on delivery at checkout. You or your delivery partner
              collects payment on delivery.
            </Muted>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: '#E4E4E7', true: '#0A0A0B' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View className="rounded-[28px] border border-gray-200 bg-gray-50 px-5 py-4">
        <Text className="text-[14px] text-gray-600 leading-6">
          When a customer places a COD order, the order is confirmed immediately. Mark payment as
          received in the order detail after you collect cash.
        </Text>
      </View>
    </PaymentMethodConfigLayout>
  )
}
