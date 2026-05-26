import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, ScrollView, Text, View } from 'react-native'
import { AppPressable } from '@/components/ui/AppPressable'
import { Chip } from '@/components/ui/Chip'
import { Fab } from '@/components/ui/Fab'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { SearchField } from '@/components/ui/SearchField'
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

  return (
    <Screen>
      <ScreenHeader
        title="Catalog"
        subtitle={`${products.length} products · ${categories.length} categories`}
        right={
          <AppPressable
            containerClassName="flex-row items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-2.5 rounded-xl"
            onPress={() => router.push('/(store)/products/categories' as Href)}
          >
            <FontAwesome name="th-large" size={14} color={Colors.brand.primary} />
            <Text className="text-xs font-bold text-ink">Categories</Text>
          </AppPressable>
        }
      />

      <SearchField
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
        className="mt-1"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-[52px] mb-1"
        contentContainerClassName="px-6 py-2 items-center"
      >
        <Chip
          label="All products"
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

      <ScreenBody>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.brand.primary} />
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1 px-2 pb-28">
            <EmptyState
              icon="cube"
              title="No products yet"
              description="Tap + to add your first product to the catalog."
            />
          </View>
        ) : filtered.length === 0 ? (
          <View className="flex-1 px-2 pb-28">
            <EmptyState
              icon={selectedCategoryId ? 'cube' : 'search'}
              title={selectedCategoryId ? 'No products in this category' : 'No matches'}
              description={
                selectedCategoryId
                  ? 'Assign products via the Categories screen.'
                  : 'Try a different search term.'
              }
            />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerClassName="px-2 pb-28 pt-2"
            columnWrapperClassName="justify-between gap-y-3"
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
