import { useCallback, useMemo, useState } from 'react'
import { Image, Pressable, Switch, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useFocusEffect } from 'expo-router'
import { PaymentMethodConfigLayout } from '@/components/store/PaymentMethodConfigLayout'
import { CategoryImagePicker } from '@/components/store/CategoryImagePicker'
import type { PickedImage } from '@/components/store/ProductImagePicker'
import { Button } from '@/components/ui/Button'
import { PaymentMethodConfigSkeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { Label, Muted } from '@/components/ui/Typography'
import { fetchPaymentConfig, updatePaymentConfig } from '@src/api/payment-config'
import { uploadProductImages } from '@src/api/uploads'
import { useStore } from '@src/contexts/store-context'
import { useUnsavedChangesExit } from '@src/hooks/useUnsavedChangesExit'
import { shadows } from '@src/lib/shadows'
import { showError, showSuccess } from '@src/lib/toast'

function mimeFromUri(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

type UpiSavedSnapshot = {
  enabled: boolean
  vpa: string
  displayName: string
  qrUrl: string | null
}

export default function UpiPaymentScreen() {
  const { store } = useStore()
  const [enabled, setEnabled] = useState(false)
  const [vpa, setVpa] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrImage, setQrImage] = useState<PickedImage | null>(null)
  const [saved, setSaved] = useState<UpiSavedSnapshot>({
    enabled: false,
    vpa: '',
    displayName: '',
    qrUrl: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const qrDisplayUri = qrImage?.uri ?? qrUrl

  const isDirty = useMemo(() => {
    if (loading) return false
    return (
      enabled !== saved.enabled ||
      vpa.trim() !== saved.vpa ||
      displayName.trim() !== saved.displayName ||
      qrUrl !== saved.qrUrl ||
      qrImage !== null
    )
  }, [loading, enabled, saved, vpa, displayName, qrUrl, qrImage])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchPaymentConfig()
      const upi = res.data.payment_config.upi
      const nextSaved: UpiSavedSnapshot = {
        enabled: upi.enabled,
        vpa: upi.vpa ?? '',
        displayName: upi.display_name ?? '',
        qrUrl: upi.qr_image_url,
      }
      setEnabled(nextSaved.enabled)
      setVpa(nextSaved.vpa)
      setDisplayName(nextSaved.displayName)
      setQrUrl(nextSaved.qrUrl)
      setQrImage(null)
      setSaved(nextSaved)
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

  const pickQrImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      showError('Permission to access photos is required')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.85,
    })

    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    setQrImage({
      id: `upi-qr-${Date.now()}`,
      uri: asset.uri,
      name: asset.fileName ?? `upi-qr-${Date.now()}.jpg`,
      type: asset.mimeType ?? mimeFromUri(asset.uri),
    })
  }

  const removeQrImage = () => {
    setQrImage(null)
    setQrUrl(null)
  }

  const save = useCallback(async (): Promise<boolean> => {
    if (!store?.id) return false
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

      const nextSaved: UpiSavedSnapshot = {
        enabled,
        vpa: vpa.trim(),
        displayName: displayName.trim(),
        qrUrl: nextQrUrl,
      }
      setSaved(nextSaved)
      setQrImage(null)
      showSuccess('UPI settings saved')
      return true
    } catch (e) {
      showError(e, 'Could not save UPI settings')
      return false
    } finally {
      setSaving(false)
    }
  }, [store?.id, qrUrl, qrImage, enabled, vpa, displayName])

  const { requestBack, dialog } = useUnsavedChangesExit({
    isDirty,
    isLoading: loading,
    onSave: save,
  })

  return (
    <PaymentMethodConfigLayout
      title="UPI"
      subtitle="Manual UPI collection"
      onBack={requestBack}
      footer={<Button label="Save" loading={saving} disabled={loading} onPress={() => void save()} />}
    >
      {loading ? (
        <PaymentMethodConfigSkeleton inputCount={2} showImageField showSecondCard />
      ) : (
        <>
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
              {qrDisplayUri ? (
                <View className="items-center gap-3">
                  <Image
                    source={{ uri: qrDisplayUri }}
                    className="w-44 h-44 rounded-xl border border-gray-200 bg-gray-50"
                    resizeMode="contain"
                  />
                  <View className="flex-row gap-4">
                    <Pressable onPress={() => void pickQrImage()}>
                      <Text className="text-[13px] font-semibold text-blue-600">Change image</Text>
                    </Pressable>
                    <Pressable onPress={removeQrImage}>
                      <Text className="text-[13px] font-semibold text-gray-600">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <CategoryImagePicker
                  image={null}
                  onChange={setQrImage}
                  allowRemove={false}
                  label=""
                />
              )}
            </View>
          </View>

          <View className="rounded-[28px] border border-gray-200 bg-gray-50 px-5 py-4">
            <Text className="text-[14px] text-gray-600 leading-6">
              Customers pay you directly in PhonePe, Google Pay, or Paytm. You will see the order as
              awaiting UPI payment and can confirm once you receive the transfer.
            </Text>
          </View>
        </>
      )}
      {dialog}
    </PaymentMethodConfigLayout>
  )
}
