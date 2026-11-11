import { useEffect, useRef } from 'react'
import { Modal, Text, View } from 'react-native'
import { CameraView, useCameraPermissions, type BarcodeScanningResult, type BarcodeType } from 'expo-camera'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'

const BARCODE_TYPES: BarcodeType[] = [
  'code128',
  'code39',
  'code93',
  'codabar',
  'ean13',
  'ean8',
  'itf14',
  'qr',
  'pdf417',
  'upc_a',
  'upc_e',
  'datamatrix',
  'aztec',
]

type Props = {
  visible: boolean
  onClose: () => void
  onScanned: (value: string) => void
  onDenied: () => void
}

export function TrackingBarcodeScanner({ visible, onClose, onScanned, onDenied }: Props) {
  const insets = useSafeAreaInsets()
  const [permission, requestPermission] = useCameraPermissions()
  const locked = useRef(false)
  const onDeniedRef = useRef(onDenied)
  onDeniedRef.current = onDenied

  useEffect(() => {
    if (!visible) {
      locked.current = false
      return
    }
    let cancelled = false
    void (async () => {
      const current = permission?.granted ? permission : await requestPermission()
      if (cancelled) return
      if (!current.granted) onDeniedRef.current()
    })()
    return () => {
      cancelled = true
    }
    // Ask once each time the scanner opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const onRead = (result: BarcodeScanningResult) => {
    if (locked.current) return
    const value = result.data.trim()
    if (!value) return
    locked.current = true
    onScanned(value)
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 12 }}>
        <View className="px-5 pb-3">
          <Text className="text-[22px] font-semibold text-ink">Scan label</Text>
          <Text className="mt-1 text-[14px] leading-5 text-gray-500">
            Point at the barcode on the label.
          </Text>
        </View>
        <View className="mx-5 mb-4 flex-1 overflow-hidden rounded-3xl bg-ink-overlay">
          {permission?.granted ? (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
              onBarcodeScanned={onRead}
            />
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center text-[15px] font-medium text-ink">
                Waiting for camera access
              </Text>
            </View>
          )}
        </View>
        <View className="px-5" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <Button label="Cancel" variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  )
}
