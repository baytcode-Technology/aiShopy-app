import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from 'expo-router'
import { OrderCard } from '@/components/store/OrderCard'
import { CreateOrderModal } from '@/components/store/CreateOrderModal'
import { fetchOrders } from '@src/api/orders'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import type { Order } from '@src/types/order'
import { theme } from '@src/theme/colors'

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>Take orders & track inventory</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.black} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Tap + to create an order for a customer.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <OrderCard order={item} currency={store?.currency} />}
        />
      )}

      <Pressable style={styles.fab} onPress={() => setModalOpen(true)}>
        <FontAwesome name="plus" size={22} color={theme.white} />
      </Pressable>

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.gray100 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.black },
  subtitle: { fontSize: 13, color: theme.gray600, marginTop: 4 },
  list: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.black, marginBottom: 8 },
  emptyText: { fontSize: 14, color: theme.gray600, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.black,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})
