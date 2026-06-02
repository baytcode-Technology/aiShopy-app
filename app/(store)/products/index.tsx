import { useCallback, useMemo, useState } from 'react'
import { FlatList, ScrollView, Text, View } from 'react-native'
import { AppPressable } from '@/components/ui/AppPressable'
import { Chip } from '@/components/ui/Chip'
import { Fab } from '@/components/ui/Fab'
import { CatalogSkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import Colors from '@src/theme/colors'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect, useRouter, type Href } from 'expo-router'
import { ProductCard } from '@/components/store/ProductCard'
import { CreateProductModal } from '@/components/store/CreateProductModal'
import { fetchProducts } from '@src/api/products'
import { fetchCategories } from '@src/api/categories'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import type { Product } from '@src/types/product'
import type { Category } from '@src/types/category'

export default function ProductsScreen() {
  const router = useRouter()
  const { store } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetchProducts(store.id),
        fetchCategories(store.id),
      ])
      setProducts(productsRes.data.products)
      const counts = new Map<string, number>()
      for (const p of productsRes.data.products) {
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
      showError(e, 'Could not load catalog')
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
    return products.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q)
      const matchesCategory =
        !selectedCategoryId || p.category_id === selectedCategoryId
      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategoryId])

  const listHeader = useMemo(
    () => (
      <View className="pb-2">
        <SearchBar
          placeholder="Search products…"
          value={search}
          onChangeText={setSearch}
          className="mt-1 mb-3"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-[56px]"
          contentContainerClassName="px-5 pb-2 items-center"
        >
          <Chip
            label="All"
            active={!selectedCategoryId}
            onPress={() => setSelectedCategoryId(null)}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              active={selectedCategoryId === cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
            />
          ))}
        </ScrollView>
      </View>
    ),
    [search, categories, selectedCategoryId]
  )

  return (
    <Screen>
      <ScreenHeader
        showLogo
        variant="tab"
        title="Products"
        subtitle={`${products.length} products · ${categories.length} categories`}
        right={
          <AppPressable
            containerClassName="flex-row items-center gap-2 rounded-full border border-gray-200 bg-surface px-4 py-2.5"
            onPress={() => router.push('/(store)/products/categories' as Href)}
          >
            <FontAwesome name="th-large" size={13} color={Colors.brand.primary} />
            <Text className="text-[12px] font-bold text-ink tracking-wide">Categories</Text>
          </AppPressable>
        }
      />

      <ScreenBody className="flex-1">
        {loading ? (
          <View className="flex-1 px-5 pt-2">
            {listHeader}
            <CatalogSkeletonGrid />
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1">
            {listHeader}
            <View className="flex-1 px-2 pb-28">
              <EmptyState
                icon="cube"
                title="No products yet"
                description="Tap + to add your first product to the catalog."
              />
            </View>
          </View>
        ) : filtered.length === 0 ? (
          <View className="flex-1">
            {listHeader}
            <View className="flex-1 px-2 pb-28">
              <EmptyState
                icon={selectedCategoryId ? 'cube' : 'search'}
                title={selectedCategoryId ? 'No products in this category' : 'No matches'}
                description={
                  selectedCategoryId
                    ? 'Assign products from the Categories screen.'
                    : 'Try a different search term.'
                }
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={2}
            ListHeaderComponent={listHeader}
            contentContainerClassName="px-5 pb-32 pt-1"
            columnWrapperClassName="justify-between gap-y-5"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="w-[48%]">
                <ProductCard
                  product={item}
                  currency={store?.currency}
                  onPress={() => router.push(`/(store)/products/${item.id}` as Href)}
                />
              </View>
            )}
          />
        )}

        <Fab onPress={() => setProductModalOpen(true)}>
          <FontAwesome name="plus" size={22} color={Colors.brand.onPrimary} />
        </Fab>

        {store?.id ? (
          <CreateProductModal
            visible={productModalOpen}
            storeId={store.id}
            categories={categories}
            initialCategoryId={selectedCategoryId ?? undefined}
            onClose={() => setProductModalOpen(false)}
            onCreated={loadData}
          />
        ) : null}
      </ScreenBody>
    </Screen>
  )
}
