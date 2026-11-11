import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { TrackingBarcodeScanner } from '@/components/store/TrackingBarcodeScanner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateOrder } from '@src/api/orders'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Order } from '@src/types/order'

type Props = {
  order: Order
  storeId: number
  courierTracking: boolean
  saving: boolean
  onSavingChange: (saving: boolean) => void
  onUpdated: (order: Order) => void
}

function formatPromisedLabel(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const date = new Date(`${trimmed}T00:00:00`)
  if (Number.isNaN(date.getTime())) return trimmed
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function orderHasCourier(order: Order): boolean {
  return Boolean(
    order.courier_name?.trim() || order.tracking_number?.trim() || order.tracking_url?.trim()
  )
}

export function OrderDeliveryCard({
  order,
  storeId,
  courierTracking,
  saving,
  onSavingChange,
  onUpdated,
}: Props) {
  const [open, setOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [cameraNote, setCameraNote] = useState<string | null>(null)
  const [promisedBy, setPromisedBy] = useState('')
  const [delayNote, setDelayNote] = useState('')
  const [courierName, setCourierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')

  useEffect(() => {
    setPromisedBy(order.promised_by ?? '')
    setDelayNote(order.delay_note ?? '')
    setCourierName(order.courier_name ?? '')
    setTrackingNumber(order.tracking_number ?? '')
    setTrackingUrl(order.tracking_url ?? '')
  }, [order.id, order.promised_by, order.delay_note, order.courier_name, order.tracking_number, order.tracking_url])

  const showCourier = courierTracking || orderHasCourier(order)
  const dateLabel = formatPromisedLabel(order.promised_by)
  const courierLabel = order.courier_name?.trim()
  const summary = [
    'Delivery',
    dateLabel ?? 'No date yet',
    courierLabel || null,
  ]
    .filter(Boolean)
    .join(' · ')

  const save = async () => {
    if (saving) return
    onSavingChange(true)
    try {
      const res = await updateOrder(order.id, {
        store_id: storeId,
        promised_by: promisedBy.trim() || null,
        delay_note: delayNote.trim() || null,
        courier_name: showCourier ? courierName.trim() || null : order.courier_name ?? null,
        tracking_number: showCourier ? trackingNumber.trim() || null : order.tracking_number ?? null,
        tracking_url: showCourier ? trackingUrl.trim() || null : order.tracking_url ?? null,
      })
      onUpdated({ ...order, ...res.data.order, customers: order.customers, items: order.items })
      showSuccess('Delivery details saved')
      setOpen(false)
    } catch (e) {
      showError(e, 'Could not save delivery details')
    } finally {
      onSavingChange(false)
    }
  }

  return (
    <View className="rounded-2xl border border-gray-200 bg-surface">
      <Pressable
        onPress={() => setOpen((value) => !value)}
        className="flex-row items-center justify-between gap-3 px-4 py-3.5 active:opacity-90"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text className="flex-1 text-[15px] font-semibold text-ink" numberOfLines={2}>
          {summary}
        </Text>
        <FontAwesome
          name={open ? 'chevron-down' : 'chevron-right'}
          size={13}
          color={Colors.brand.primary}
        />
      </Pressable>

      {open ? (
        <View className="gap-3 border-t border-gray-200 px-4 pb-4 pt-3">
          <Input
            label="Promised by (YYYY-MM-DD)"
            value={promisedBy}
            onChangeText={setPromisedBy}
            placeholder="2026-11-10"
            autoCapitalize="none"
          />
          <Input
            label="Delay note"
            value={delayNote}
            onChangeText={setDelayNote}
            placeholder="Extra 2 days"
            multiline
          />
          {showCourier ? (
            <>
              <Input label="Courier" value={courierName} onChangeText={setCourierName} />
              <View className="flex-row items-end gap-2">
                <View className="flex-1">
                  <Input
                    label="Tracking number"
                    value={trackingNumber}
                    onChangeText={setTrackingNumber}
                    autoCapitalize="none"
                  />
                </View>
                <Button
                  label="Scan"
                  variant="outline"
                  style={{ width: undefined, alignSelf: 'flex-end' }}
                  onPress={() => {
                    setCameraNote(null)
                    setScanOpen(true)
                  }}
                />
              </View>
              {cameraNote ? (
                <Text className="text-[13px] leading-5 text-gray-500">{cameraNote}</Text>
              ) : null}
              <TrackingBarcodeScanner
                visible={scanOpen}
                onClose={() => setScanOpen(false)}
                onScanned={(value) => {
                  setTrackingNumber(value)
                  setScanOpen(false)
                }}
                onDenied={() => {
                  setScanOpen(false)
                  setCameraNote('Camera access is off. Type the tracking number instead.')
                }}
              />
              <Input
                label="Tracking URL"
                value={trackingUrl}
                onChangeText={setTrackingUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          ) : null}
          <Button label="Save delivery" onPress={() => void save()} disabled={saving} />
        </View>
      ) : null}
    </View>
  )
}
