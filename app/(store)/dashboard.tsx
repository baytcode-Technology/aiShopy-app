import { StoreAvatar } from '@/components/store/StoreAvatar'
import { MenuRow } from '@/components/ui/MenuRow'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Caption, Heading } from '@/components/ui/Typography'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { fetchCategories } from '@src/api/categories'
import { fetchChats } from '@src/api/chats'
import { fetchOrders } from '@src/api/orders'
import { fetchProducts } from '@src/api/products'
import { useStore } from '@src/contexts/store-context'
import { shadows } from '@src/lib/shadows'
import Colors from '@src/theme/colors'
import { router, useFocusEffect, type Href } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
type Stats = {
  products: number
  categories: number
  orders: number
  chats: number
}

export default function DashboardScreen() {
  const { store } = useStore()
  const [stats, setStats] = useState<Stats>({
    products: 0,
    categories: 0,
    orders: 0,
    chats: 0,
  })
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const [productsRes, categoriesRes, ordersRes, chatsRes] = await Promise.all([
        fetchProducts(store.id),
        fetchCategories(store.id),
        fetchOrders(store.id),
        fetchChats(store.id),
      ])
      setStats({
        products: productsRes.data.products.length,
        categories: categoriesRes.data.categories.length,
        orders: ordersRes.data.orders.length,
        chats: chatsRes.data.chats.length,
      })
    } catch {
      // Keep last known stats on refresh failure
    } finally {
      setLoading(false)
    }
  }, [store?.id])

  useFocusEffect(
    useCallback(() => {
      void loadStats()
    }, [loadStats])
  )

  const subtitle = loading
    ? 'Loading overview…'
    : `${stats.products} products · ${stats.orders} orders · ${stats.chats} chats`

  return (
    <Screen>
      <ScreenHeader showLogo variant="tab" title="Dashboard" subtitle={subtitle} />
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
                <Heading className="text-2xl tracking-tight">{store?.name ?? 'Your store'}</Heading>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <StatCard
                label="Products"
                value={stats.products}
                icon="th-large"
                onPress={() => router.push('/(store)/products' as Href)}
              />
              <StatCard
                label="Categories"
                value={stats.categories}
                icon="folder-open-o"
                onPress={() => router.push('/(store)/products/categories' as Href)}
              />
              <StatCard
                label="Orders"
                value={stats.orders}
                icon="shopping-bag"
                onPress={() => router.push('/(store)/orders' as Href)}
              />
              <StatCard
                label="Chats"
                value={stats.chats}
                icon="comments"
                onPress={() => router.push('/(store)/chats' as Href)}
              />
            </View>
          </View>

          <MenuRow
            label="Admin Dashboard"
            value="WhatsApp · Instagram · Chat Boat · Domain"
            icon="plug"
            showChevron
            onPress={() => router.push('/admin-dashboard' as Href)}
          />        </ScrollView>
      </ScreenBody>
    </Screen>
  )
}

function StatCard({
  label,
  value,
  icon,
  onPress,
}: {
  label: string
  value: number
  icon: React.ComponentProps<typeof FontAwesome>['name']
  onPress: () => void
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
  )
}