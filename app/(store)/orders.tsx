import { useCallback, useState } from 'react'
import { FlatList, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from 'expo-router'
import { OrderCard } from '@/components/store/OrderCard'
import { CreateOrderModal } from '@/components/store/CreateOrderModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Fab } from '@/components/ui/Fab'
import { OrdersSkeletonList } from '@/components/ui/Skeleton'
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
      <ScreenHeader showLogo variant="tab" title="Orders" subtitle="Manage customer orders & COD" />
      <ScreenBody className="flex-1 px-5">
        {loading ? (
          <OrdersSkeletonList />
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
            contentContainerClassName="pt-3 pb-32"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <OrderCard order={item} currency={store?.currency} />
            )}
          />
        )}
      </ScreenBody>

      <Fab onPress={() => setModalOpen(true)} iconSize={20} />

      {store?.id ? (
        <CreateOrderModal
          visible={modalOpen}
          storeId={store.id}
          currency={store.currency}
          onClose={() => setModalOpen(false)}
          onCreated={loadOrders}
        />
      ) : null}
    </Screen>
  )
}
