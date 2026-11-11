import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useKeyboardInset } from '@src/hooks/useKeyboardInset'
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router'
import { OrderStatusPickerSheet } from '@/components/store/OrderStatusPickerSheet'
import { OrderStatusRow } from '@/components/store/OrderStatusRow'
import { DetailSection } from '@/components/store/detail/DetailSection'
import { OrderDeliveryCard } from '@/components/store/OrderDeliveryCard'
import { OrderSummaryCard } from '@/components/store/OrderSummaryCard'
import { OrderInvoiceCard } from '@/components/store/OrderInvoiceCard'
import { OrderPaymentActions } from '@/components/store/OrderPaymentActions'
import { OrderPaymentProofCard } from '@/components/store/OrderPaymentProofCard'
import { OrderRazorpayPaymentCard } from '@/components/store/OrderRazorpayPaymentCard'
import { OrderRazorpayPendingCard } from '@/components/store/OrderRazorpayPendingCard'
import { DetailScreenHeader } from '@/components/navigation/DetailScreenHeader'
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { Muted, SectionTitle } from '@/components/ui/Typography'
import { fetchOrder, updateOrder } from '@src/api/orders'
import { parseShopPolicies } from '@src/types/shop-policies'
import { useStore } from '@src/contexts/store-context'
import { useStoreUnread } from '@src/contexts/store-unread-context'
import { formatOrderNumber } from '@src/lib/order-status'
import type { OrderStatusField } from '@src/lib/order-status'
import { useNavigateBackTo } from '@src/hooks/useNavigateBackTo'
import { showError, showSuccess } from '@src/lib/toast'
import type { Order } from '@src/types/order'
import Colors from '@src/theme/colors'

export default function OrderDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>()
  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam
  const id = idRaw != null ? Number(idRaw) : NaN
  const router = useRouter()
  const { store } = useStore()
  const { markOrderViewed } = useStoreUnread()
  const ordersListHref = '/(store)/orders' as Href

  useNavigateBackTo(ordersListHref)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pickerField, setPickerField] = useState<OrderStatusField | null>(null)
  const keyboardHeight = useKeyboardInset()

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || !store?.id) return
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

  useFocusEffect(
    useCallback(() => {
      if (!Number.isFinite(id)) return
      void markOrderViewed(id)
    }, [id, markOrderViewed])
  )

  const confirmPaymentReceived = async () => {
    if (!order || !store?.id || saving) return
    setSaving(true)
    try {
      await updateOrder(order.id, {
        store_id: store.id,
        payment_status: 'paid',
        order_status: order.order_status === 'pending' ? 'confirmed' : order.order_status,
      })
      const refreshed = await fetchOrder(store.id, order.id)
      setOrder(refreshed.data)
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
        title={order ? `Order ${formatOrderNumber(order.order_number)}` : 'Order'}
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
            <View className="absolute inset-0 z-30 items-center justify-center bg-surface/50">
              <ActivityIndicator color={Colors.brand.primary} />
            </View>
          ) : null}

          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pt-4 gap-4"
            contentContainerStyle={{ paddingBottom: 32 + keyboardHeight }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
          >
            <AnimatedFadeIn className="gap-4">
              <OrderSummaryCard order={order} currency={store?.currency} />

              <OrderPaymentActions
                order={order}
                payment={order.payment ?? null}
                saving={saving}
                onConfirmPayment={confirmPaymentReceived}
              />
              {order.payment?.provider === 'razorpay' &&
              order.order_status !== 'cancelled' &&
              order.payment_status !== 'paid' ? (
                <OrderRazorpayPendingCard failed={order.payment?.status === 'failed'} />
              ) : null}

              <View className="gap-2">
                <SectionTitle>Status</SectionTitle>
                <DetailSection>
                  <OrderStatusRow
                    grouped
                    field="order_status"
                    value={order.order_status}
                    onPress={() => {
                      if (!saving) setPickerField('order_status')
                    }}
                    disabled={saving}
                  />
                  <View className="mx-3.5 h-px bg-gray-200" />
                  <OrderStatusRow
                    grouped
                    field="payment_status"
                    value={order.payment_status}
                    onPress={() => {
                      if (!saving) setPickerField('payment_status')
                    }}
                    disabled={saving}
                  />
                  <View className="mx-3.5 h-px bg-gray-200" />
                  <OrderStatusRow
                    grouped
                    field="fulfillment_status"
                    value={order.fulfillment_status}
                    onPress={() => {
                      if (!saving) setPickerField('fulfillment_status')
                    }}
                    disabled={saving}
                  />
                </DetailSection>
              </View>

              {store ? (
                <View className="gap-2">
                  <SectionTitle>Delivery</SectionTitle>
                  <OrderDeliveryCard
                    order={order}
                    storeId={store.id}
                    courierTracking={parseShopPolicies(store.shop_policies).courier_tracking}
                    saving={saving}
                    onSavingChange={setSaving}
                    onUpdated={setOrder}
                  />
                </View>
              ) : null}

              {order.payment?.payment_proof_url ? (
                <OrderPaymentProofCard url={order.payment.payment_proof_url} />
              ) : null}
              {order.payment?.provider === 'razorpay' &&
              order.payment_status === 'paid' &&
              order.payment.provider_payment_id ? (
                <OrderRazorpayPaymentCard paymentId={order.payment.provider_payment_id} />
              ) : null}

              {store ? (
                <View className="gap-2">
                  <SectionTitle>Invoice</SectionTitle>
                  <OrderInvoiceCard order={order} store={store} />
                </View>
              ) : null}
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
