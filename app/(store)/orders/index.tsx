import { CreateOrderModal } from "@/components/store/CreateOrderModal";
import { OrderActiveFilterChips } from "@/components/store/OrderActiveFilterChips";
import { OrderCard } from "@/components/store/OrderCard";
import { OrderFilterModal } from "@/components/store/OrderFilterModal";
import { OrderSearchBar } from "@/components/store/order-create/OrderSearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Fab } from "@/components/ui/Fab";
import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { OrdersSkeletonList } from "@/components/ui/Skeleton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { fetchOrders } from "@src/api/orders";
import { useStore } from "@src/contexts/store-context";
import { useStoreUnread } from "@src/contexts/store-unread-context";
import { filterOrdersList } from "@src/lib/filter-orders";
import {
  EMPTY_ORDER_FILTERS,
  hasActiveOrderFilters,
  removeOrderFilterChip,
  type OrderFilters,
  type OrderStatusField,
} from "@src/lib/order-status";
import { showError } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import type { Order } from "@src/types/order";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";

export default function OrdersScreen() {
  const { store } = useStore();
  const { syncOrdersUnread, onOrderViewed } = useStoreUnread();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<OrderFilters>(EMPTY_ORDER_FILTERS);

  const loadOrders = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const res = await fetchOrders(store.id);
      setOrders(res.data.orders);
      syncOrdersUnread(res.data.orders);
    } catch (e) {
      showError(e, "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [store?.id, syncOrdersUnread]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  useEffect(() => {
    return onOrderViewed((orderId) => {
      setOrders((prev) => {
        const next = prev.map((o) =>
          o.id === orderId
            ? { ...o, merchant_viewed_at: o.merchant_viewed_at ?? new Date().toISOString() }
            : o
        );
        syncOrdersUnread(next);
        return next;
      });
    });
  }, [onOrderViewed, syncOrdersUnread]);

  const filteredOrders = useMemo(
    () => filterOrdersList(orders, searchQuery, filters),
    [orders, searchQuery, filters],
  );

  const filtersActive = hasActiveOrderFilters(filters);

  const clearAllFilters = () => setFilters(EMPTY_ORDER_FILTERS);

  const removeFilter = (field: OrderStatusField, value: string) => {
    setFilters((prev) => removeOrderFilterChip(prev, field, value));
  };

  return (
    <Screen>
      <ScreenHeader
        showLogo
        variant="tab"
        title="Orders"
        subtitle="Manage customer orders & COD"
      />
      <ScreenBody className="flex-1">
        <View className="flex-row items-start gap-2.5 px-4 py-2">
          <View className="flex-1">
            <OrderSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by customer name or phone"
            />
          </View>
          <View className="items-center gap-1">
            <Pressable
              onPress={() => setFilterOpen(true)}
              className={`w-12 h-12 rounded-2xl border items-center justify-center active:opacity-85 ${
                filtersActive
                  ? "border-ink bg-gray-100"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <FontAwesome
                name="sliders"
                size={18}
                color={
                  filtersActive ? Colors.brand.primary : Colors.text.secondary
                }
              />
            </Pressable>
          </View>
        </View>

        <OrderActiveFilterChips
          filters={filters}
          onRemove={removeFilter}
          onClearAll={clearAllFilters}
        />

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
  );
}
