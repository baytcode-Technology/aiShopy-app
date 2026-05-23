import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect, useRouter, type Href } from 'expo-router'
import { ProductCard } from '@/components/store/ProductCard'
import { CreateProductModal } from '@/components/store/CreateProductModal'
import { CreateCategoryModal } from '@/components/store/CreateCategoryModal'
import { CategoryProductPickerModal } from '@/components/store/CategoryProductPickerModal'
import { Button } from '@/components/ui/Button'
import { Heading, LinkText, Subtitle } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
import { fetchProducts } from '@src/api/products'
import { fetchCategories } from '@src/api/categories'
import { useStore } from '@src/contexts/store-context'
import { showError, showSuccess } from '@src/lib/toast'
import type { Product } from '@src/types/product'
import type { Category } from '@src/types/category'
import Colors from '@src/theme/colors'

export default function ProductsScreen() {
  const router = useRouter()
  const { store } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerMode, setPickerMode] = useState<'assign' | 'edit'>('assign')

  const loadData = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetchProducts(store.id),
        fetchCategories(store.id),
      ])
      setProducts(productsRes.data.products)
      setCategories(categoriesRes.data.categories)
    } catch (e) {
      showError(e, 'Could not load products')
    } finally {
      setLoading(false)
    }
  }, [store?.id])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.trim().toLowerCase())
      const matchesCategory =
        !selectedCategoryId || p.category_id === selectedCategoryId
      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategoryId])

  const uncategorized = useMemo(
    () =>
      products.filter(
        (p) =>
          !p.category_id &&
          p.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [products, search]
  )

  const openPicker = (mode: 'assign' | 'edit') => {
    setPickerMode(mode)
    setPickerOpen(true)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex-row items-center justify-between px-6 pt-5 pb-3.5">
        <View>
          <Heading>Catalog</Heading>
          <Subtitle className="mt-1">
            {products.length} products · {categories.length} categories
          </Subtitle>
        </View>
        <Pressable
          className="flex-row items-center gap-1.5 border border-gray-200 bg-surface px-3 py-2 rounded-xl shadow-sm shadow-ink/5 active:opacity-90"
          onPress={() => setCategoryModalOpen(true)}
        >
          <FontAwesome name="folder-open-o" size={14} color={Colors.brand.primary} />
          <Text className="text-xs font-bold text-ink">Category</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2.5 mx-6 mb-4 px-3.5 py-3 bg-surface rounded-2xl border border-gray-200 shadow-sm shadow-ink/5">
        <FontAwesome name="search" size={15} color={Colors.text.muted} />
        <TextInput
          className="flex-1 text-[15px] font-medium text-ink"
          placeholder="Search catalog..."
          placeholderTextColor={Colors.text.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-[46px] mb-3"
        contentContainerClassName="px-6 gap-2"
      >
        <Chip label="All" active={!selectedCategoryId} onPress={() => setSelectedCategoryId(null)} />
        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length
          return (
            <Chip
              key={cat.id}
              label={`${cat.name} (${count})`}
              active={selectedCategoryId === cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
            />
          )
        })}
      </ScrollView>

      {selectedCategoryId && selectedCategory ? (
        <View className="mx-6 mb-4 p-4 rounded-2xl border border-gray-200 bg-surface gap-3 shadow-sm shadow-ink/5">
          <Text className="text-base font-extrabold text-ink tracking-tight">
            {selectedCategory.name}
          </Text>
          <View className="flex-row gap-2.5">
            <Pressable
              className="flex-row items-center gap-1.5 bg-brand-primary px-3.5 py-2.5 rounded-xl active:opacity-90"
              onPress={() => openPicker('assign')}
            >
              <FontAwesome name="plus" size={12} color={Colors.brand.onPrimary} />
              <Text className="text-xs font-bold text-brand-on-primary">Add products</Text>
            </Pressable>
            <Pressable
              className="px-3.5 py-2.5 rounded-xl border-2 border-ink bg-surface active:opacity-90"
              onPress={() => openPicker('edit')}
            >
              <Text className="text-xs font-bold text-ink">Edit products</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.brand.primary} />
        </View>
      ) : !selectedCategoryId ? (
        <ScrollView contentContainerClassName="px-3.5 pb-24" showsVerticalScrollIndicator={false}>
          {categories.map((cat) => {
            const catProducts = products.filter(
              (p) =>
                p.category_id === cat.id &&
                p.name.toLowerCase().includes(search.trim().toLowerCase())
            )
            if (catProducts.length === 0) return null
            return (
              <View key={cat.id} className="mb-6">
                <View className="flex-row justify-between items-center px-2.5 mb-3">
                  <Text className="text-base font-extrabold text-ink tracking-tight">
                    {cat.name}
                  </Text>
                  <Pressable onPress={() => setSelectedCategoryId(cat.id)}>
                    <LinkText>View all</LinkText>
                  </Pressable>
                </View>
                <View className="flex-row flex-wrap">
                  {catProducts.slice(0, 4).map((item) => (
                    <View key={item.id} className="w-1/2">
                      <ProductCard
                        product={item}
                        currency={store?.currency}
                        onPress={() => router.push(`/(store)/products/${item.id}` as Href)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )
          })}
          {uncategorized.length > 0 ? (
            <View className="mb-6">
              <Text className="text-base font-extrabold text-ink tracking-tight px-2.5 mb-3">
                Uncategorized
              </Text>
              <View className="flex-row flex-wrap">
                {uncategorized.map((item) => (
                  <View key={item.id} className="w-1/2">
                    <ProductCard
                      product={item}
                      currency={store?.currency}
                      onPress={() => router.push(`/(store)/products/${item.id}` as Href)}
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          {products.length === 0 ? (
            <View className="items-center justify-center p-8">
              <Text className="text-lg font-extrabold text-ink mb-2">No products yet</Text>
              <Subtitle className="text-center">Tap + to create your first product.</Subtitle>
            </View>
          ) : null}
        </ScrollView>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8 gap-3">
          <Text className="text-lg font-extrabold text-ink">No products in this category</Text>
          <Button
            label="Add products here"
            className="w-auto px-5"
            onPress={() => openPicker('assign')}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerClassName="p-3.5 pb-24"
          columnWrapperClassName="justify-between"
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              currency={store?.currency}
              onPress={() => router.push(`/(store)/products/${item.id}` as Href)}
            />
          )}
        />
      )}

      <Pressable
        className="absolute right-5 bottom-6 w-14 h-14 rounded-full bg-brand-primary items-center justify-center shadow-lg shadow-ink/25 active:scale-95"
        onPress={() => setProductModalOpen(true)}
      >
        <FontAwesome name="plus" size={22} color={Colors.brand.onPrimary} />
      </Pressable>

      {store?.id ? (
        <>
          <CreateProductModal
            visible={productModalOpen}
            storeId={store.id}
            categories={categories}
            initialCategoryId={selectedCategoryId ?? undefined}
            onClose={() => setProductModalOpen(false)}
            onCreated={loadData}
          />
          <CreateCategoryModal
            visible={categoryModalOpen}
            storeId={store.id}
            onClose={() => setCategoryModalOpen(false)}
            onCreated={() => {
              showSuccess('Category created')
              loadData()
            }}
          />
          {selectedCategory ? (
            <CategoryProductPickerModal
              visible={pickerOpen}
              mode={pickerMode}
              storeId={store.id}
              categoryId={selectedCategory.id}
              categoryName={selectedCategory.name}
              allProducts={products}
              onClose={() => setPickerOpen(false)}
              onSaved={loadData}
            />
          ) : null}
        </>
      ) : null}
    </SafeAreaView>
  )
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      className={cn(
        'border rounded-full px-4 py-2 mr-1 active:opacity-90',
        active ? 'bg-brand-primary border-ink' : 'bg-surface border-gray-200'
      )}
      onPress={onPress}
    >
      <Text
        className={cn('text-[13px] font-bold', active ? 'text-brand-on-primary' : 'text-gray-600')}
      >
        {label}
      </Text>
    </Pressable>
  )
}
