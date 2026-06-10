import { useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from 'expo-router'
import { OrderCard } from '@/components/store/OrderCard'
import { OrderFilterModal } from '@/components/store/OrderFilterModal'
import { OrderSearchBar } from '@/components/store/order-create/OrderSearchBar'
import { CreateOrderModal } from '@/components/store/CreateOrderModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Fab } from '@/components/ui/Fab'
import { OrdersSkeletonList } from '@/components/ui/Skeleton'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { fetchOrders } from '@src/api/orders'
import { filterOrdersList } from '@src/lib/filter-orders'
import {
  EMPTY_ORDER_FILTERS,
  hasActiveOrderFilters,
  type OrderFilters,
} from '@src/lib/order-status'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import type { Order } from '@src/types/order'
import Colors from '@src/theme/colors'

export default function OrdersScreen() {
  const { store } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<OrderFilters>(EMPTY_ORDER_FILTERS)

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

  const filteredOrders = useMemo(
    () => filterOrdersList(orders, searchQuery, filters),
    [orders, searchQuery, filters]
  )

  const filtersActive = hasActiveOrderFilters(filters)

  return (
    <Screen>
      <ScreenHeader showLogo variant="tab" title="Orders" subtitle="Manage customer orders & COD" />
      <ScreenBody className="flex-1">
        <View className="flex-row items-center gap-2.5 px-4 pb-3">
          <View className="flex-1">
            <OrderSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by customer name or phone"
            />
          </View>
          <Pressable
            onPress={() => setFilterOpen(true)}
            className={`w-12 h-12 rounded-2xl border items-center justify-center active:opacity-85 ${
              filtersActive ? 'border-ink bg-gray-100' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <FontAwesome
              name="sliders"
              size={18}
              color={filtersActive ? Colors.brand.primary : Colors.text.secondary}
            />
          </Pressable>
        </View>

        {loading ? (
          <View className="px-4">
            <OrdersSkeletonList />
          </View>
        ) : orders.length === 0 ? (
          <View className="px-5 flex-1">
            <EmptyState
              icon="shopping-cart"
              title="No orders yet"
              description="Create your first order when a customer buys via chat or in person."
            />
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="px-5 flex-1">
            <EmptyState
              icon="search"
              title="No matching orders"
              description="Try a different search or adjust your filters."
            />
          </View>
        ) : (
          <FlatList
            className="flex-1 bg-surface mx-4 rounded-2xl border border-gray-200 overflow-hidden"
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            contentContainerClassName="pb-32"
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <OrderCard
                order={item}
                currency={store?.currency}
                isLast={index === filteredOrders.length - 1}
              />
            )}
          />
        )}
      </ScreenBody>

      <Fab onPress={() => setModalOpen(true)} iconSize={20} />

      <OrderFilterModal
        visible={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />

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
