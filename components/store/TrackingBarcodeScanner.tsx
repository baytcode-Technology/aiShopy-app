import { useEffect, useRef } from 'react'
import { Modal, Text, View } from 'react-native'
import { CameraView, useCameraPermissions, type BarcodeScanningResult, type BarcodeType } from 'expo-camera'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import { parseLabelScan, type LabelScan } from '@src/lib/parse-label-scan'

const MATRIX_TYPES = new Set(['qr', 'datamatrix', 'aztec'])
const MATRIX_WAIT_MS = 400
const FRAME_INSET_X = 32
const FRAME_HEIGHT = 112

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
  onScanned: (scan: LabelScan) => void
  onDenied: () => void
}

function centerInAimBand(
  result: BarcodeScanningResult,
  view: { width: number; height: number },
): boolean {
  const origin = result.bounds?.origin
  const size = result.bounds?.size
  if (!origin || !size || size.width <= 0 || size.height <= 0) return true
  if (!view.width || !view.height) return true
  const centerX = origin.x + size.width / 2
  const centerY = origin.y + size.height / 2
  if (centerX < 0 || centerY < 0 || centerX > view.width || centerY > view.height) return true
  const top = (view.height - FRAME_HEIGHT) / 2
  return (
    centerX >= FRAME_INSET_X &&
    centerX <= view.width - FRAME_INSET_X &&
    centerY >= top &&
    centerY <= top + FRAME_HEIGHT
  )
}

export function TrackingBarcodeScanner({ visible, onClose, onScanned, onDenied }: Props) {
  const insets = useSafeAreaInsets()
  const [permission, requestPermission] = useCameraPermissions()
  const locked = useRef(false)
  const viewSize = useRef({ width: 0, height: 0 })
  const matrixTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onDeniedRef = useRef(onDenied)
  const onScannedRef = useRef(onScanned)
  onDeniedRef.current = onDenied
  onScannedRef.current = onScanned

  useEffect(() => {
    if (!visible) {
      locked.current = false
      if (matrixTimer.current) clearTimeout(matrixTimer.current)
      matrixTimer.current = null
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
      if (matrixTimer.current) clearTimeout(matrixTimer.current)
      matrixTimer.current = null
    }
    // Ask once each time the scanner opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const finish = (scan: LabelScan) => {
    if (locked.current || !scan.trackingNumber) return
    if (matrixTimer.current) clearTimeout(matrixTimer.current)
    matrixTimer.current = null
    locked.current = true
    onScannedRef.current(scan)
  }

  const onRead = (result: BarcodeScanningResult) => {
    if (locked.current || !centerInAimBand(result, viewSize.current)) return
    const scan = parseLabelScan(result.data)
    if (!scan.trackingNumber) return
    if (!MATRIX_TYPES.has(result.type)) {
      finish(scan)
      return
    }
    if (matrixTimer.current) return
    matrixTimer.current = setTimeout(() => finish(scan), MATRIX_WAIT_MS)
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top + 12 }}>
        <View className="px-5 pb-3">
          <Text className="text-[22px] font-semibold text-ink">Scan label</Text>
          <Text className="mt-1 text-[14px] leading-5 text-gray-500">
            Hold the label about 15 cm away, with the barcode inside the frame.
          </Text>
        </View>
        <View
          className="relative mx-5 mb-4 flex-1 overflow-hidden rounded-3xl bg-ink-overlay"
          onLayout={(event) => {
            viewSize.current = {
              width: event.nativeEvent.layout.width,
              height: event.nativeEvent.layout.height,
            }
          }}
        >
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
          <View
            pointerEvents="none"
            className="absolute inset-x-8 top-1/2 h-28 -mt-14 rounded-2xl border-2 border-ink"
          />
        </View>
        <View className="px-5" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <Button label="Cancel" variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  )
}
