import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AppPressable } from '@/components/ui/AppPressable'
import { Button } from '@/components/ui/Button'
import { Fab } from '@/components/ui/Fab'
import { ProductCard } from '@/components/store/ProductCard'
import { CreateProductModal } from '@/components/store/CreateProductModal'
import { CategoryProductPickerModal } from '@/components/store/CategoryProductPickerModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
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

  const openPicker = (mode: 'assign' | 'edit') => {
    setPickerMode(mode)
    setPickerOpen(true)
  }

  const productCountLabel = useMemo(() => {
    const n = products.length
    return n === 1 ? '1 Product' : `${n} Products`
  }, [products.length])

  return (
    <Screen>
      <ScreenHeader
        title={category?.name ?? 'Category'}
        subtitle={productCountLabel}
        onBack={() => router.back()}
      />
      <ScreenBody>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.brand.primary} />
          </View>
        ) : !category ? null : (
          <>
            <View className="mx-4 mt-3 mb-5 rounded-[24px] overflow-hidden bg-gray-100 h-40">
              {category.image_url ? (
                <Image
                  source={{ uri: category.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-3xl font-extrabold text-gray-300 tracking-wider">
                    {category.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() ?? '')
                      .join('')}
                  </Text>
                </View>
              )}
            </View>

            <View className="mx-4 mb-5 flex-row gap-3">
              <AppPressable
                containerClassName="flex-1 flex-row items-center justify-center gap-1.5 bg-ink py-3.5 rounded-2xl"
                onPress={() => openPicker('assign')}
              >
                <FontAwesome name="plus" size={12} color="#FFFFFF" />
                <Text className="text-sm font-bold text-white">Add products</Text>
              </AppPressable>
              <AppPressable
                containerClassName="flex-1 items-center justify-center py-3.5 rounded-2xl border border-ink bg-surface"
                onPress={() => openPicker('edit')}
              >
                <Text className="text-sm font-bold text-ink">Edit products</Text>
              </AppPressable>
            </View>

            {products.length === 0 ? (
              <EmptyState
                icon="cube"
                title="No products here"
                description="Add existing products to this category or create a new one."
                action={
                  <Button
                    label="Add products"
                    className="self-center px-6"
                    onPress={() => openPicker('assign')}
                  />
                }
              />
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerClassName="px-3 pb-28"
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
