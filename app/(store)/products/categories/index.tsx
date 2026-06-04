import { useCallback, useMemo, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { useFocusEffect, useRouter, type Href } from 'expo-router'
import { CategoryListRow } from '@/components/store/CategoryListRow'
import { CreateCategoryModal } from '@/components/store/CreateCategoryModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Fab } from '@/components/ui/Fab'
import { PillTab } from '@/components/ui/PillTab'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import { ProductListSkeleton } from '@/components/ui/Skeleton'
import { fetchCategories } from '@src/api/categories'
import { fetchProducts } from '@src/api/products'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import type { Category } from '@src/types/category'

type StatusFilter = 'all' | 'active' | 'unlisted'

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'unlisted', label: 'Unlisted' },
]

export default function CategoriesScreen() {
  const router = useRouter()
  const { store } = useStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetchCategories(store.id),
        fetchProducts(store.id),
      ])
      const products = productsRes.data.products
      const counts = new Map<string, number>()
      for (const p of products) {
        if (p.category_id) {
          counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1)
        }
      }
      setCategories(
        categoriesRes.data.categories.map((c) => ({
          ...c,
          product_count: counts.get(c.id) ?? c.product_count ?? 0,
        }))
      )
    } catch (e) {
      showError(e, 'Could not load categories')
    } finally {
      setLoading(false)
    }
  }, [store?.id])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return categories.filter((c) => {
      const matchesSearch =
        !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? c.is_active : !c.is_active)
      return matchesSearch && matchesStatus
    })
  }, [categories, search, statusFilter])

  const listHeader = (
    <View className="pb-2">
      <SearchBar
        placeholder="Search categories…"
        value={search}
        onChangeText={setSearch}
        className="mt-1 mb-3"
      />
      <View className="flex-row items-center gap-1 mb-1 px-1 flex-wrap">
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.key
          return (
            <PillTab
              key={tab.key}
              selected={active}
              onPress={() => setStatusFilter(tab.key)}
              accessibilityLabel={tab.label}
              style={{ marginRight: 4, paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Text
                className={`text-[14px] font-semibold ${
                  active ? 'text-ink' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </Text>
            </PillTab>
          )
        })}
      </View>
    </View>
  )

  return (
    <Screen>
      <ScreenHeader
        title="Categories"
        subtitle={`${categories.length} collections`}
        onBack={() => router.back()}
        variant="tab"
        large={false}
      />

      <ScreenBody className="flex-1">
        {loading ? (
          <View className="flex-1 px-5 pt-2">
            {listHeader}
            <ProductListSkeleton />
          </View>
        ) : categories.length === 0 ? (
          <View className="flex-1">
            {listHeader}
            <View className="flex-1 px-2 pb-28">
              <EmptyState
                icon="folder-open-o"
                title="No categories yet"
                description="Tap + to create a category with a cover image, then assign products."
              />
            </View>
          </View>
        ) : filtered.length === 0 ? (
          <View className="flex-1">
            {listHeader}
            <View className="flex-1 px-2 pb-28">
              <EmptyState
                icon="search"
                title="No matches"
                description="Try a different search or status filter."
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeader}
            contentContainerClassName="px-5 pb-32 pt-1"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CategoryListRow
                category={item}
                onPress={() =>
                  router.push(`/(store)/products/categories/${item.id}` as Href)
                }
              />
            )}
          />
        )}

        <Fab onPress={() => setModalOpen(true)} />

        {store?.id ? (
          <CreateCategoryModal
            visible={modalOpen}
            storeId={store.id}
            categories={categories}
            onClose={() => setModalOpen(false)}
            onCreated={loadData}
          />
        ) : null}
      </ScreenBody>
    </Screen>
  )
}
