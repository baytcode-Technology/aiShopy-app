import { useCallback, useState } from 'react'
import { Image, Switch, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { PaymentMethodConfigLayout } from '@/components/store/PaymentMethodConfigLayout'
import { CategoryImagePicker } from '@/components/store/CategoryImagePicker'
import type { PickedImage } from '@/components/store/ProductImagePicker'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label, Muted } from '@/components/ui/Typography'
import { fetchPaymentConfig, updatePaymentConfig } from '@src/api/payment-config'
import { uploadProductImages } from '@src/api/uploads'
import { useStore } from '@src/contexts/store-context'
import { shadows } from '@src/lib/shadows'
import { showError, showSuccess } from '@src/lib/toast'

export default function UpiPaymentScreen() {
  const { store } = useStore()
  const [enabled, setEnabled] = useState(false)
  const [vpa, setVpa] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrImage, setQrImage] = useState<PickedImage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchPaymentConfig()
      const upi = res.data.payment_config.upi
      setEnabled(upi.enabled)
      setVpa(upi.vpa ?? '')
      setDisplayName(upi.display_name ?? '')
      setQrUrl(upi.qr_image_url)
    } catch (e) {
      showError(e, 'Could not load UPI settings')
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
    if (!store?.id) return
    setSaving(true)
    try {
      let nextQrUrl = qrUrl
      if (qrImage) {
        const [uploaded] = await uploadProductImages(store.id, [
          { uri: qrImage.uri, name: qrImage.name, type: qrImage.type },
        ])
        nextQrUrl = uploaded ?? qrUrl
      }

      await updatePaymentConfig({
        upi: {
          enabled,
          vpa: vpa.trim(),
          display_name: displayName.trim() || null,
          qr_image_url: nextQrUrl,
        },
      })
      setQrImage(null)
      showSuccess('UPI settings saved')
      await load()
    } catch (e) {
      showError(e, 'Could not save UPI settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PaymentMethodConfigLayout
      title="UPI"
      subtitle="Manual UPI collection"
      footer={<Button label="Save" loading={saving || loading} onPress={save} />}
    >
      <View className="rounded-[28px] border border-gray-200 bg-surface px-5 py-5 gap-4" style={shadows.card}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Label>Enable UPI</Label>
            <Muted className="text-xs mt-1">
              Show your UPI ID and QR at checkout. Confirm payment manually in the app.
            </Muted>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: '#E4E4E7', true: '#0A0A0B' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Input
          label="UPI ID (VPA) *"
          value={vpa}
          onChangeText={setVpa}
          placeholder="mystore@paytm"
          autoCapitalize="none"
        />
        <Input
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="My Store"
        />

        <View>
          <Label className="mb-2">UPI QR image (optional)</Label>
          {qrUrl && !qrImage ? (
            <Image source={{ uri: qrUrl }} className="w-40 h-40 rounded-xl mb-3 self-center" resizeMode="contain" />
          ) : null}
          <CategoryImagePicker image={qrImage} onChange={setQrImage} label="UPI QR image" />
        </View>
      </View>

      <View className="rounded-[28px] border border-gray-200 bg-gray-50 px-5 py-4">
        <Text className="text-[14px] text-gray-600 leading-6">
          Customers pay you directly in PhonePe, Google Pay, or Paytm. You will see the order as
          awaiting UPI payment and can confirm once you receive the transfer.
        </Text>
      </View>
    </PaymentMethodConfigLayout>
  )
}
