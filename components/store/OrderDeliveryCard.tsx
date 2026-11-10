import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Caption } from '@/components/ui/Typography'
import { updateOrder } from '@src/api/orders'
import { showError, showSuccess } from '@src/lib/toast'
import type { Order } from '@src/types/order'

type Props = {
  order: Order
  storeId: number
  saving: boolean
  onSavingChange: (saving: boolean) => void
  onUpdated: (order: Order) => void
}

export function OrderDeliveryCard({
  order,
  storeId,
  saving,
  onSavingChange,
  onUpdated,
}: Props) {
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

  const save = async () => {
    if (saving) return
    onSavingChange(true)
    try {
      const res = await updateOrder(order.id, {
        store_id: storeId,
        promised_by: promisedBy.trim() || null,
        delay_note: delayNote.trim() || null,
        courier_name: courierName.trim() || null,
        tracking_number: trackingNumber.trim() || null,
        tracking_url: trackingUrl.trim() || null,
      })
      onUpdated({ ...order, ...res.data.order, customers: order.customers, items: order.items })
      showSuccess('Delivery details saved')
    } catch (e) {
      showError(e, 'Could not save delivery details')
    } finally {
      onSavingChange(false)
    }
  }

  return (
    <View className="gap-3 rounded-2xl border border-gray-200 bg-surface p-4">
      <Caption className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
        Delivery & delay
      </Caption>
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
        placeholder="Courier delay — extra 2 days"
        multiline
      />
      <Input label="Courier" value={courierName} onChangeText={setCourierName} />
      <Input label="Tracking number" value={trackingNumber} onChangeText={setTrackingNumber} autoCapitalize="none" />
      <Input
        label="Tracking URL"
        value={trackingUrl}
        onChangeText={setTrackingUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button label="Save delivery" onPress={() => void save()} disabled={saving} />
    </View>
  )
}
