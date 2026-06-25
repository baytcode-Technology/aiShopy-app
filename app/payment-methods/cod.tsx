import { useCallback, useState } from 'react'
import { Switch, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { PaymentMethodConfigLayout } from '@/components/store/PaymentMethodConfigLayout'
import { Button } from '@/components/ui/Button'
import { PaymentMethodConfigSkeleton } from '@/components/ui/Skeleton'
import { Label, Muted } from '@/components/ui/Typography'
import { fetchPaymentConfig, updatePaymentConfig } from '@src/api/payment-config'
import { useUnsavedChangesExit } from '@src/hooks/useUnsavedChangesExit'
import { shadows } from '@src/lib/shadows'
import { showError, showSuccess } from '@src/lib/toast'

export default function CodPaymentScreen() {
  const [enabled, setEnabled] = useState(true)
  const [savedEnabled, setSavedEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isDirty = !loading && enabled !== savedEnabled

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchPaymentConfig()
      const nextEnabled = res.data.payment_config.cod.enabled
      setEnabled(nextEnabled)
      setSavedEnabled(nextEnabled)
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

  const save = useCallback(async (): Promise<boolean> => {
    setSaving(true)
    try {
      await updatePaymentConfig({ cod: { enabled } })
      setSavedEnabled(enabled)
      showSuccess('Cash on delivery settings saved')
      return true
    } catch (e) {
      showError(e, 'Could not save settings')
      return false
    } finally {
      setSaving(false)
    }
  }, [enabled])

  const { requestBack, dialog } = useUnsavedChangesExit({
    isDirty,
    isLoading: loading,
    onSave: save,
  })

  return (
    <PaymentMethodConfigLayout
      title="Cash on delivery"
      subtitle="Pay when the order arrives"
      onBack={requestBack}
      footer={
        <Button label="Save" loading={saving} disabled={loading} onPress={() => void save()} />
      }
    >
      {loading ? (
        <PaymentMethodConfigSkeleton inputCount={0} showSecondCard />
      ) : (
        <>
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
        </>
      )}
      {dialog}
    </PaymentMethodConfigLayout>
  )
}
