import { StoreAvatar } from "@/components/store/StoreAvatar";
import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Heading, Label, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { fetchCategories } from "@src/api/categories";
import { fetchAllChats } from "@src/api/chats";
import { fetchOrders } from "@src/api/orders";
import { fetchProducts } from "@src/api/products";
import { useStore } from "@src/contexts/store-context";
import { useStoreTabRootBack } from "@src/hooks/useStoreTabRootBack";
import { formatMoney } from "@src/lib/format-money";
import {
  computeSalesOverview,
  SALES_PERIOD_OPTIONS,
  type SalesPeriod,
  type SalesSourceKey,
} from "@src/lib/sales-overview";
import { shadows } from "@src/lib/shadows";
import Colors from "@src/theme/colors";
import type { Order } from "@src/types/order";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Stats = {
  products: number;
  categories: number;
  orders: number;
  chats: number;
};

const SOURCE_LABELS: { key: SalesSourceKey; label: string }[] = [
  { key: "storefront", label: "Storefront" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "offline", label: "Offline" },
  { key: "other", label: "Other" },
];

export default function DashboardScreen() {
  useStoreTabRootBack("dashboard");

  const { store } = useStore();
  const [stats, setStats] = useState<Stats>({
    products: 0,
    categories: 0,
    orders: 0,
    chats: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("30d");
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes, chatsRes] =
        await Promise.all([
          fetchProducts(store.id),
          fetchCategories(store.id),
          fetchOrders(store.id),
          fetchAllChats(store.id),
        ]);
      const orderList = ordersRes.data.orders;
      setOrders(orderList);
      setStats({
        products: productsRes.data.products.length,
        categories: categoriesRes.data.categories.length,
        orders: orderList.length,
        chats: chatsRes.whatsapp.length + chatsRes.instagram.length,
      });
    } catch {
      // Keep last known stats on refresh failure
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  const sales = useMemo(
    () => computeSalesOverview(orders, salesPeriod),
    [orders, salesPeriod],
  );

  const sourceRows = useMemo(
    () =>
      SOURCE_LABELS.filter((row) => sales.bySource[row.key] > 0).map((row) => ({
        ...row,
        count: sales.bySource[row.key],
      })),
    [sales.bySource],
  );

  const currency = store?.currency;
  const subtitle = loading
    ? "Loading overview…"
    : `${stats.products} products · ${stats.orders} orders · ${stats.chats} chats`;

  return (
    <Screen>
      <ScreenHeader
        showLogo
        variant="tab"
        title="Dashboard"
        subtitle={subtitle}
      />
      <ScreenBody className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-32 gap-4"
        >
          <View
            className="rounded-[28px] border border-gray-200 bg-surface p-6"
            style={shadows.card}
          >
            <View className="flex-row items-center gap-4 mb-5">
              <StoreAvatar store={store} size="sm" />
              <View className="flex-1">
                <Heading className="text-2xl tracking-tight">
                  {store?.name ?? "Your store"}
                </Heading>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <StatCard
                label="Products"
                value={stats.products}
                icon="th-large"
                onPress={() => router.push("/(store)/products" as Href)}
              />
              <StatCard
                label="Categories"
                value={stats.categories}
                icon="folder-open-o"
                onPress={() =>
                  router.push("/(store)/products/categories" as Href)
                }
              />
              <StatCard
                label="Orders"
                value={stats.orders}
                icon="shopping-bag"
                onPress={() => router.push("/(store)/orders" as Href)}
              />
              <StatCard
                label="Chats"
                value={stats.chats}
                icon="comments"
                onPress={() => router.push("/(store)/chats" as Href)}
              />
            </View>
          </View>

          <View
            className="rounded-[28px] border border-gray-200 bg-surface p-5 gap-4"
            style={shadows.card}
          >
            <Pressable
              onPress={() => router.push("/(store)/orders" as Href)}
              className="flex-row items-center justify-between gap-2 active:opacity-85"
            >
              <Label>Sales</Label>
              <FontAwesome
                name="chevron-right"
                size={12}
                color={Colors.text.muted}
              />
            </Pressable>

            <View className="flex-row flex-wrap gap-2">
              {SALES_PERIOD_OPTIONS.map((opt) => {
                const active = salesPeriod === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSalesPeriod(opt.id)}
                    className={`rounded-xl px-3 py-1.5 border ${
                      active
                        ? "bg-brand-primary/10 border-brand-primary/30"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active ? "text-brand-primary" : "text-gray-500"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View>
              <Text className="text-3xl font-extrabold text-ink tracking-tight">
                {formatMoney(sales.salesTotal, currency)}
              </Text>
              <Muted className="text-xs mt-1">Booked sales (excl. cancelled)</Muted>
            </View>

            <View className="flex-row gap-6">
              <View>
                <Text className="text-lg font-bold text-ink">
                  {sales.orderCount}
                </Text>
                <Caption className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">
                  Orders
                </Caption>
              </View>
              <View>
                <Text className="text-lg font-bold text-ink">
                  {formatMoney(sales.avgOrder, currency)}
                </Text>
                <Caption className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">
                  Avg order
                </Caption>
              </View>
            </View>

            {sales.needsAttention > 0 ? (
              <View className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                <Text className="text-xs font-semibold text-amber-900">
                  {sales.needsAttention} need
                  {sales.needsAttention === 1 ? "s" : ""} attention
                </Text>
                <Muted className="text-[11px] mt-0.5 text-amber-800/80">
                  Unpaid or not fulfilled yet
                </Muted>
              </View>
            ) : null}

            {sourceRows.length > 0 ? (
              <View className="gap-2 pt-1">
                <Caption className="text-[11px] text-gray-400 uppercase tracking-widest">
                  Where orders came from
                </Caption>
                <View className="flex-row flex-wrap gap-2">
                  {sourceRows.map((row) => (
                    <View
                      key={row.key}
                      className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-1.5"
                    >
                      <Text className="text-xs text-gray-700">
                        {row.label}{" "}
                        <Text className="font-bold text-ink">{row.count}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Muted className="text-xs">No orders in this period.</Muted>
            )}
          </View>
        </ScrollView>
      </ScreenBody>
    </Screen>
  );
}

function StatCard({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 min-w-[44%] rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 active:opacity-85"
    >
      <FontAwesome name={icon} size={14} color={Colors.brand.primary} />
      <Text className="text-2xl font-extrabold text-ink mt-2">{value}</Text>
      <Caption className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">
        {label}
      </Caption>
    </Pressable>
  );
}
