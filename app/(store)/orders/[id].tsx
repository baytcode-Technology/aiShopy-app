import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router'
import { OrderStatusPickerSheet } from '@/components/store/OrderStatusPickerSheet'
import { OrderStatusRow } from '@/components/store/OrderStatusRow'
import { OrderInvoiceCard } from '@/components/store/OrderInvoiceCard'
import { OrderPaymentActions } from '@/components/store/OrderPaymentActions'
import { DetailScreenHeader } from '@/components/navigation/DetailScreenHeader'
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { Muted } from '@/components/ui/Typography'
import { fetchOrder, updateOrder } from '@src/api/orders'
import { useStore } from '@src/contexts/store-context'
import { useNavigateBackTo } from '@src/hooks/useNavigateBackTo'
import type { OrderStatusField } from '@src/lib/order-status'
import { showError, showSuccess } from '@src/lib/toast'
import type { Order } from '@src/types/order'
import Colors from '@src/theme/colors'

export default function OrderDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>()
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  const router = useRouter()
  const { store } = useStore()
  const ordersListHref = '/(store)/orders' as Href

  useNavigateBackTo(ordersListHref)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pickerField, setPickerField] = useState<OrderStatusField | null>(null)

  const load = useCallback(async () => {
    if (!id || !store?.id) return
    setLoading(true)
    try {
      const res = await fetchOrder(store.id, id)
      setOrder(res.data)
    } catch (e) {
      showError(e, 'Could not load order')
    } finally {
      setLoading(false)
    }
  }, [id, store?.id])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const confirmPaymentReceived = async () => {
    if (!order || !store?.id || saving) return
    setSaving(true)
    try {
      const res = await updateOrder(order.id, {
        store_id: store.id,
        payment_status: 'paid',
        order_status: order.order_status === 'pending' ? 'confirmed' : order.order_status,
      })
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              ...res.data.order,
              customers: prev.customers,
              items: prev.items,
              payment: prev.payment
                ? { ...prev.payment, status: 'paid' }
                : prev.payment,
            }
          : prev
      )
      showSuccess('Payment marked as received')
    } catch (e) {
      showError(e, 'Could not confirm payment')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (field: OrderStatusField, value: string) => {
    if (!order || !store?.id || saving) return
    setSaving(true)
    try {
      const res = await updateOrder(order.id, {
        store_id: store.id,
        [field]: value,
      })
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              ...res.data.order,
              customers: prev.customers,
              items: prev.items,
            }
          : prev
      )
      showSuccess('Status updated')
    } catch (e) {
      showError(e, 'Could not update status')
    } finally {
      setSaving(false)
    }
  }

  const currentPickerValue =
    pickerField && order
      ? String(order[pickerField])
      : null

  return (
    <Screen variant="shell" edges={['top']}>
      <DetailScreenHeader
        title={order ? `Order ${order.order_number}` : 'Order'}
        onBack={() => router.navigate(ordersListHref)}
      />

      {loading ? (
        <ScreenBody className="items-center justify-center">
          <ActivityIndicator color={Colors.brand.primary} size="large" />
        </ScreenBody>
      ) : !order ? (
        <ScreenBody className="items-center justify-center">
          <Muted className="text-base font-semibold">Order not found</Muted>
        </ScreenBody>
      ) : (
        <View className="flex-1">
          {saving ? (
            <View className="absolute inset-0 z-30 items-center justify-center bg-white/50">
              <ActivityIndicator color={Colors.brand.primary} />
            </View>
          ) : null}

          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pt-4 gap-3"
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <AnimatedFadeIn className="gap-2">
              <OrderPaymentActions
                order={order}
                payment={order.payment ?? null}
                saving={saving}
                onConfirmPayment={confirmPaymentReceived}
              />
              <View>
                <OrderStatusRow
                  field="order_status"
                  value={order.order_status}
                  onPress={() => {
                    if (!saving) setPickerField('order_status')
                  }}
                  disabled={saving}
                />
                <OrderStatusRow
                  field="payment_status"
                  value={order.payment_status}
                  onPress={() => {
                    if (!saving) setPickerField('payment_status')
                  }}
                  disabled={saving}
                />
                <OrderStatusRow
                  field="fulfillment_status"
                  value={order.fulfillment_status}
                  onPress={() => {
                    if (!saving) setPickerField('fulfillment_status')
                  }}
                  disabled={saving}
                />
              </View>

              {store ? <OrderInvoiceCard order={order} store={store} /> : null}
            </AnimatedFadeIn>
          </ScrollView>
        </View>
      )}

      <OrderStatusPickerSheet
        visible={pickerField !== null}
        field={pickerField}
        currentValue={currentPickerValue}
        onClose={() => setPickerField(null)}
        onSelect={(value) => {
          if (!pickerField || saving) return
          const field = pickerField
          setPickerField(null)
          void handleStatusChange(field, value)
        }}
      />
    </Screen>
  )
}
