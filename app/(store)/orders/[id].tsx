import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { OrderStatusPickerSheet } from '@/components/store/OrderStatusPickerSheet'
import { OrderStatusRow } from '@/components/store/OrderStatusRow'
import { DetailSection } from '@/components/store/detail/DetailSection'
import { DetailScreenHeader } from '@/components/navigation/DetailScreenHeader'
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { Caption, Muted } from '@/components/ui/Typography'
import { fetchOrder, updateOrder } from '@src/api/orders'
import { useStore } from '@src/contexts/store-context'
import type { OrderStatusField } from '@src/lib/order-status'
import { showError, showSuccess } from '@src/lib/toast'
import type { Order } from '@src/types/order'
import Colors from '@src/theme/colors'

export default function OrderDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>()
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  const router = useRouter()
  const { store } = useStore()

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

  const symbol = store?.currency === 'INR' ? '₹' : '$'
  const customerName =
    order?.customers?.name ??
    order?.customers?.whatsapp_number ??
    (order?.source === 'offline' ? 'Walk-in order' : 'Customer')

  const currentPickerValue =
    pickerField && order
      ? String(order[pickerField])
      : null

  return (
    <Screen variant="shell" edges={['top']}>
      <DetailScreenHeader
        title={order ? `Order ${order.order_number}` : 'Order'}
        onBack={() => router.back()}
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

              <DetailSection className="p-4 gap-3">
                <View>
                  <Caption className="text-gray-500">Customer</Caption>
                  <Text className="text-[16px] font-bold text-ink mt-0.5">{customerName}</Text>
                </View>

                <View className="h-px bg-gray-100" />

                <View>
                  <Caption className="text-gray-500 mb-2">Items</Caption>
                  {(order.items ?? []).map((item) => {
                    const snapshot = item.snapshot as {
                      product_name?: string
                      variant_name?: string
                    }
                    const label =
                      snapshot.variant_name
                        ? `${snapshot.product_name ?? 'Product'} · ${snapshot.variant_name}`
                        : snapshot.product_name ?? 'Product'
                    return (
                      <View
                        key={item.id}
                        className="flex-row items-center justify-between py-2 border-b border-gray-100"
                      >
                        <Text className="flex-1 text-[14px] font-semibold text-ink pr-3" numberOfLines={2}>
                          {label} × {item.quantity}
                        </Text>
                        <Text className="text-[14px] font-bold text-ink">
                          {symbol}
                          {item.total_price}
                        </Text>
                      </View>
                    )
                  })}
                </View>

                <View className="h-px bg-gray-100" />

                <View className="flex-row items-center justify-between">
                  <Text className="text-[15px] font-bold text-ink">Total</Text>
                  <Text className="text-xl font-extrabold text-ink">
                    {symbol}
                    {order.total}
                  </Text>
                </View>

                {order.notes ? (
                  <>
                    <View className="h-px bg-gray-100" />
                    <View>
                      <Caption className="text-gray-500">Notes</Caption>
                      <Text className="text-[14px] text-ink mt-0.5">{order.notes}</Text>
                    </View>
                  </>
                ) : null}
              </DetailSection>
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
