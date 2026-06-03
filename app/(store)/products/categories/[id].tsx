import { useCallback, useMemo, useState } from 'react'
import { FlatList, Image, Text, View } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AddGridTile } from '@/components/store/AddGridTile'
import { AppPressable } from '@/components/ui/AppPressable'
import { Fab } from '@/components/ui/Fab'
import { ProductCard } from '@/components/store/ProductCard'
import { CreateProductModal } from '@/components/store/CreateProductModal'
import { CategoryProductPickerModal } from '@/components/store/CategoryProductPickerModal'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CatalogSkeletonGrid } from '@/components/ui/Skeleton'
import { fetchCategories } from '@src/api/categories'
import { fetchProducts } from '@src/api/products'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'
import type { Product } from '@src/types/product'

export default function CategoryDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const categoryId = typeof id === 'string' ? id : ''
  const { store } = useStore()

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerMode, setPickerMode] = useState<'assign' | 'edit'>('assign')

  const loadData = useCallback(async () => {
    if (!store?.id || !categoryId) return
    setLoading(true)
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetchCategories(store.id),
        fetchProducts(store.id),
      ])
      const cats = categoriesRes.data.categories
      const found = cats.find((c) => c.id === categoryId) ?? null
      if (!found) {
        showError('Category not found')
        router.back()
        return
      }
      const all = productsRes.data.products
      setCategory(found)
      setCategories(cats)
      setAllProducts(all)
      setProducts(all.filter((p) => p.category_id === categoryId))
    } catch (e) {
      showError(e, 'Could not load category')
    } finally {
      setLoading(false)
    }
  }, [store?.id, categoryId, router])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const openPicker = useCallback((mode: 'assign' | 'edit') => {
    setPickerMode(mode)
    setPickerOpen(true)
  }, [])

  const productCountLabel = useMemo(() => {
    const n = products.length
    return n === 1 ? '1 product' : `${n} products`
  }, [products.length])

  const listHeader = useMemo(() => {
    if (!category) return null
    return (
      <View className="pt-1 pb-2">
        <View className="rounded-[28px] overflow-hidden h-[200px] mb-5 bg-gray-100 border border-gray-200">
          {category.image_url ? (
            <Image
              source={{ uri: category.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-4xl font-extrabold text-gray-300 tracking-wider">
                {category.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? '')
                  .join('')}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-3 mb-6">
          <AppPressable
            containerClassName="flex-1 flex-row items-center justify-center gap-2 bg-brand-primary py-4 rounded-[22px] border border-ink"
            onPress={() => openPicker('assign')}
          >
            <FontAwesome name="plus" size={13} color={Colors.brand.onPrimary} />
            <Text className="text-sm font-bold text-brand-on-primary">Add products</Text>
          </AppPressable>
          <AppPressable
            containerClassName="flex-1 items-center justify-center py-4 rounded-[22px] border border-gray-200 bg-surface"
            onPress={() => openPicker('edit')}
          >
            <Text className="text-sm font-bold text-ink">Edit list</Text>
          </AppPressable>
        </View>

        <SectionHeader title="Products" subtitle={productCountLabel} className="mb-4" />

        {products.length === 0 ? (
          <View className="mb-6">
            <AddGridTile onPress={() => openPicker('assign')} />
          </View>
        ) : null}
      </View>
    )
  }, [category, products.length, productCountLabel, openPicker])

  return (
    <Screen>
      <ScreenHeader
        title={category?.name ?? 'Category'}
        subtitle={productCountLabel}
        onBack={() => router.back()}
        large={false}
      />
      <ScreenBody className="flex-1 px-5">
        {loading ? (
          <View className="flex-1 pt-2">
            <View className="rounded-[28px] h-[200px] mb-5 bg-gray-100 border border-gray-200" />
            <CatalogSkeletonGrid />
          </View>
        ) : !category ? null : (
          <>
            <FlatList
              style={{ flex: 1 }}
              data={products}
              keyExtractor={(item) => item.id}
              numColumns={2}
              ListHeaderComponent={listHeader}
              ListEmptyComponent={
                products.length === 0 ? (
                  <View className="h-2" />
                ) : null
              }
              contentContainerClassName="pb-32 pt-1"
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

            <Fab onPress={() => setProductModalOpen(true)}>
              <FontAwesome name="plus" size={22} color={Colors.brand.onPrimary} />
            </Fab>

            {store?.id ? (
              <>
                <CreateProductModal
                  visible={productModalOpen}
                  storeId={store.id}
                  categories={categories}
                  initialCategoryId={categoryId}
                  onClose={() => setProductModalOpen(false)}
                  onCreated={loadData}
                />
                <CategoryProductPickerModal
                  visible={pickerOpen}
                  mode={pickerMode}
                  storeId={store.id}
                  categoryId={categoryId}
                  categoryName={category.name}
                  allProducts={allProducts}
                  onClose={() => setPickerOpen(false)}
                  onSaved={loadData}
                />
              </>
            ) : null}
          </>
        )}
      </ScreenBody>
    </Screen>
  )
}
