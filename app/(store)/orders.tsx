import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { Fab } from '@/components/ui/Fab'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from 'expo-router'
import { OrderCard } from '@/components/store/OrderCard'
import { CreateOrderModal } from '@/components/store/CreateOrderModal'
import { Heading, Subtitle } from '@/components/ui/Typography'
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
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="px-6 py-4.5 bg-surface border-b border-gray-200">
        <Heading>Orders</Heading>
        <Subtitle className="mt-1">Take orders & track inventory</Subtitle>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.brand.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-lg font-extrabold text-ink mb-2">No orders yet</Text>
          <Subtitle className="text-center">
            Tap + to create an order for a customer.
          </Subtitle>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4 pb-24"
          renderItem={({ item }) => <OrderCard order={item} currency={store?.currency} />}
        />
      )}

      <Fab onPress={() => setModalOpen(true)}>
        <FontAwesome name="plus" size={22} color={Colors.brand.onPrimary} />
      </Fab>

      {store?.id ? (
        <CreateOrderModal
          visible={modalOpen}
          storeId={store.id}
          onClose={() => setModalOpen(false)}
          onCreated={loadOrders}
        />
      ) : null}
    </SafeAreaView>
  )
}
