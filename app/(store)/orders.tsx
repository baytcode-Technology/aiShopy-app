import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from 'expo-router'
import { OrderCard } from '@/components/store/OrderCard'
import { CreateOrderModal } from '@/components/store/CreateOrderModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Fab } from '@/components/ui/Fab'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { fetchOrders } from '@src/api/orders'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import type { Order } from '@src/types/order'
import Colors from '@src/theme/colors'

export default function OrdersScreen() {
  const { store } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadOrders = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const res = await fetchOrders(store.id)
      setOrders(res.data.orders)
    } catch (e) {
      showError(e, 'Could not load orders')
    } finally {
      setLoading(false)
    }
  }, [store?.id])

  useFocusEffect(
    useCallback(() => {
      loadOrders()
    }, [loadOrders])
  )

  return (
    <Screen>
      <ScreenHeader title="Orders" subtitle="Manage customer orders & COD" />
      <ScreenBody>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.brand.primary} size="large" />
          </View>
        ) : orders.length === 0 ? (
          <EmptyState
            icon="shopping-cart"
            title="No orders yet"
            description="Create your first order when a customer buys via chat or in person."
          />
        ) : (
          <FlatList
            className="flex-1"
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 pt-4 pb-28"
            renderItem={({ item }) => (
              <OrderCard order={item} currency={store?.currency} />
            )}
          />
        )}
      </ScreenBody>

      <Fab onPress={() => setModalOpen(true)}>
        <FontAwesome name="plus" size={20} color={Colors.brand.onPrimary} />
      </Fab>

      {store?.id ? (
        <CreateOrderModal
          visible={modalOpen}
          storeId={store.id}
          onClose={() => setModalOpen(false)}
          onCreated={loadOrders}
        />
      ) : null}
    </Screen>
  )
}
