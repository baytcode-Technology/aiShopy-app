import { useCallback, useState } from 'react'
import { Pressable, Switch, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { PaymentMethodConfigLayout } from '@/components/store/PaymentMethodConfigLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label, Muted } from '@/components/ui/Typography'
import { fetchPaymentConfig, updatePaymentConfig } from '@src/api/payment-config'
import { shadows } from '@src/lib/shadows'
import { showError, showSuccess } from '@src/lib/toast'
import type { RazorpayMode } from '@src/types/payment-config'

export default function RazorpayPaymentScreen() {
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<RazorpayMode>('test')
  const [keyId, setKeyId] = useState('')
  const [keySecret, setKeySecret] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [maskedKey, setMaskedKey] = useState<string | null>(null)
  const [maskedWebhook, setMaskedWebhook] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchPaymentConfig()
      const rz = res.data.payment_config.razorpay
      setEnabled(rz.enabled)
      setMode(rz.mode)
      setKeyId(rz.key_id ?? '')
      setMaskedKey(rz.key_secret_masked)
      setMaskedWebhook(rz.webhook_secret_masked)
    } catch (e) {
      showError(e, 'Could not load Razorpay settings')
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
      await updatePaymentConfig({
        razorpay: {
          enabled,
          key_id: keyId.trim() || undefined,
          key_secret: keySecret.trim() || undefined,
          webhook_secret: webhookSecret.trim() || undefined,
          mode,
        },
      })
      setKeySecret('')
      setWebhookSecret('')
      showSuccess('Razorpay settings saved')
      await load()
    } catch (e) {
      showError(e, 'Could not save Razorpay settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PaymentMethodConfigLayout
      title="Razorpay"
      subtitle="Cards, wallets & netbanking"
      footer={<Button label="Save" loading={saving || loading} onPress={save} />}
    >
      <View
        className="w-full rounded-[28px] border border-gray-200 bg-surface px-4 py-5 gap-4"
        style={shadows.card}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 min-w-0 pr-2">
            <Label>Enable Razorpay</Label>
            <Muted className="text-xs mt-1">Accept online payments on your storefront checkout.</Muted>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: '#E4E4E7', true: '#0A0A0B' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View className="w-full">
          <Label className="mb-2">Environment</Label>
          <View className="flex-row w-full rounded-xl border border-gray-200 overflow-hidden">
            {(['test', 'live'] as RazorpayMode[]).map((item, index) => {
              const active = mode === item
              return (
                <Pressable
                  key={item}
                  onPress={() => setMode(item)}
                  className={`flex-1 min-w-0 py-3 items-center justify-center ${
                    active ? 'bg-brand-primary' : 'bg-surface'
                  } ${index > 0 ? 'border-l border-gray-200' : ''}`}
                >
                  <Text
                    className={`text-[14px] font-semibold ${
                      active ? 'text-brand-on-primary' : 'text-ink'
                    }`}
                    numberOfLines={1}
                  >
                    {item === 'test' ? 'Test' : 'Live'}
                  </Text>
                </Pressable>
              )
            })}
          </View>
          <Muted className="text-xs mt-1.5">
            {mode === 'test' ? 'Use Razorpay test API keys' : 'Use live keys after KYC'}
          </Muted>
        </View>

        <Input label="Key ID" value={keyId} onChangeText={setKeyId} placeholder="rzp_test_..." autoCapitalize="none" />
        <Input
          label="Key Secret"
          value={keySecret}
          onChangeText={setKeySecret}
          placeholder={maskedKey ? `Saved ${maskedKey}` : 'Enter key secret'}
          secureTextEntry
          autoCapitalize="none"
        />
        <Input
          label="Webhook secret"
          value={webhookSecret}
          onChangeText={setWebhookSecret}
          placeholder={maskedWebhook ? `Saved ${maskedWebhook}` : 'Enter webhook secret'}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View className="rounded-[28px] border border-gray-200 bg-gray-50 px-5 py-4 gap-2">
        <Text className="text-[13px] font-bold text-ink">Setup steps</Text>
        <Text className="text-[14px] text-gray-600 leading-6">
          1. Create a Razorpay account and complete KYC{'\n'}
          2. Dashboard → API Keys → copy Key ID and Key Secret{'\n'}
          3. Dashboard → Webhooks → add your API URL /api/webhooks/razorpay{'\n'}
          4. Enable payment.captured event and copy the webhook secret here
        </Text>
      </View>
    </PaymentMethodConfigLayout>
  )
}
