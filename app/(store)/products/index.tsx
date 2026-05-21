import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { fetchProducts } from '@src/api/products'
import { fetchCategories } from '@src/api/categories'
import { useStore } from '@src/contexts/store-context'
import { showError, showSuccess } from '@src/lib/toast'
import type { Product } from '@src/types/product'
import type { Category } from '@src/types/category'
import { theme } from '@src/theme/colors'

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
  const [createCategoryId, setCreateCategoryId] = useState<string | undefined>()

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

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.trim().toLowerCase())
    const matchesCategory =
      !selectedCategoryId || p.category_id === selectedCategoryId
    return matchesSearch && matchesCategory
  })

  const openCreateProduct = (categoryId?: string) => {
    setCreateCategoryId(categoryId)
    setProductModalOpen(true)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <Pressable style={styles.categoryBtn} onPress={() => setCategoryModalOpen(true)}>
          <Text style={styles.categoryBtnText}>+ Category</Text>
        </Pressable>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <FontAwesome name="search" size={16} color={theme.gray400} style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder="Search products..."
            placeholderTextColor={theme.gray400}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryRow}
        >
          <Pressable
            style={[styles.chip, !selectedCategoryId && styles.chipActive]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextActive]}>All</Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[styles.chip, selectedCategoryId === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategoryId(cat.id)}
              onLongPress={() => openCreateProduct(cat.id)}
            >
              <Text
                style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {selectedCategoryId ? (
        <View style={styles.categoryActions}>
          <Text style={styles.categoryHint}>
            {categories.find((c) => c.id === selectedCategoryId)?.name ?? 'Category'}
          </Text>
          <Pressable style={styles.addToCategoryBtn} onPress={() => openCreateProduct(selectedCategoryId)}>
            <Text style={styles.addToCategoryText}>+ Add product here</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.black} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No products available</Text>
          <Text style={styles.emptyText}>Tap + to add your first product.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              currency={store?.currency}
              onPress={() => router.push(`/(store)/products/${item.id}` as Href)}
            />
          )}
        />
      )}

      <Pressable style={styles.fab} onPress={() => openCreateProduct(selectedCategoryId ?? undefined)}>
        <FontAwesome name="plus" size={22} color={theme.white} />
      </Pressable>

      {store?.id ? (
        <>
          <CreateProductModal
            visible={productModalOpen}
            storeId={store.id}
            categories={categories}
            initialCategoryId={createCategoryId}
            onClose={() => {
              setProductModalOpen(false)
              setCreateCategoryId(undefined)
            }}
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
        </>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.gray100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.black },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  searchWrap: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 14, top: 14, zIndex: 1 },
  search: {
    backgroundColor: theme.gray100,
    borderRadius: 10,
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 15,
    color: theme.black,
  },
  categoryBtn: {
    borderWidth: 1,
    borderColor: theme.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBtnText: { fontSize: 12, fontWeight: '600', color: theme.black },
  categoryScroll: { maxHeight: 48, backgroundColor: theme.white },
  categoryRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipActive: { backgroundColor: theme.black, borderColor: theme.black },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.gray600 },
  chipTextActive: { color: theme.white },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  categoryHint: { fontSize: 13, color: theme.gray600 },
  addToCategoryBtn: {
    borderWidth: 1,
    borderColor: theme.black,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addToCategoryText: { fontSize: 12, fontWeight: '600', color: theme.black },
  list: { padding: 10, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.black, marginBottom: 8 },
  emptyText: { fontSize: 14, color: theme.gray600, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.black,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})
