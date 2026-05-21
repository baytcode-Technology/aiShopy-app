import { useCallback, useMemo, useState } from 'react'
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
import { CategoryProductPickerModal } from '@/components/store/CategoryProductPickerModal'
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Catalog</Text>
          <Text style={styles.subtitle}>{products.length} products · {categories.length} categories</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          onPress={() => setCategoryModalOpen(true)}
        >
          <FontAwesome name="folder-open-o" size={14} color={theme.black} />
          <Text style={styles.headerBtnText}>Category</Text>
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <FontAwesome name="search" size={15} color={theme.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search catalog..."
          placeholderTextColor={theme.gray400}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsRow}
      >
        <Pressable
          style={({ pressed }) => [
            styles.chip,
            !selectedCategoryId && styles.chipActive,
            pressed && styles.chipPressed,
          ]}
          onPress={() => setSelectedCategoryId(null)}
        >
          <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextActive]}>All</Text>
        </Pressable>
        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length
          return (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                styles.chip,
                selectedCategoryId === cat.id && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text
                style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}
              >
                {cat.name} ({count})
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {selectedCategoryId && selectedCategory ? (
        <View style={styles.categoryBar}>
          <Text style={styles.categoryBarTitle}>{selectedCategory.name}</Text>
          <View style={styles.categoryBarActions}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
              onPress={() => openPicker('assign')}
            >
              <FontAwesome name="plus" size={12} color={theme.white} />
              <Text style={styles.actionBtnTextLight}>Add products</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtnOutline, pressed && styles.pressed]}
              onPress={() => openPicker('edit')}
            >
              <Text style={styles.actionBtnText}>Edit products</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.black} />
        </View>
      ) : !selectedCategoryId ? (
        <ScrollView contentContainerStyle={styles.sections} showsVerticalScrollIndicator={false}>
          {categories.map((cat) => {
            const catProducts = products.filter(
              (p) =>
                p.category_id === cat.id &&
                p.name.toLowerCase().includes(search.trim().toLowerCase())
            )
            if (catProducts.length === 0) return null
            return (
              <View key={cat.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{cat.name}</Text>
                  <Pressable onPress={() => setSelectedCategoryId(cat.id)}>
                    <Text style={styles.sectionLink}>View all</Text>
                  </Pressable>
                </View>
                <View style={styles.sectionGrid}>
                  {catProducts.slice(0, 4).map((item) => (
                    <View key={item.id} style={styles.gridItem}>
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uncategorized</Text>
              <View style={styles.sectionGrid}>
                {uncategorized.map((item) => (
                  <View key={item.id} style={styles.gridItem}>
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
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No products yet</Text>
              <Text style={styles.emptyText}>Tap + to create your first product.</Text>
            </View>
          ) : null}
        </ScrollView>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No products in this category</Text>
          <Pressable style={styles.actionBtn} onPress={() => openPicker('assign')}>
            <Text style={styles.actionBtnTextLight}>Add products here</Text>
          </Pressable>
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

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setProductModalOpen(true)}
      >
        <FontAwesome name="plus" size={22} color={theme.white} />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.gray100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 14,
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.black, letterSpacing: -0.6 },
  subtitle: { fontSize: 13, color: theme.gray600, marginTop: 4, fontWeight: '500' },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.gray200,
    backgroundColor: theme.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  headerBtnText: { fontSize: 12, fontWeight: '700', color: theme.black },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, color: theme.black, fontWeight: '500' },
  chipsScroll: { maxHeight: 46, marginBottom: 12 },
  chipsRow: { paddingHorizontal: 24, gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 4,
    backgroundColor: theme.white,
  },
  chipActive: { backgroundColor: theme.black, borderColor: theme.black },
  chipPressed: { opacity: 0.88 },
  chipText: { fontSize: 13, fontWeight: '700', color: theme.gray600 },
  chipTextActive: { color: theme.white },
  categoryBar: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.gray200,
    backgroundColor: theme.white,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryBarTitle: { fontSize: 16, fontWeight: '800', color: theme.black, letterSpacing: -0.2 },
  categoryBarActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.black,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnOutline: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.black,
    backgroundColor: theme.white,
  },
  actionBtnTextLight: { fontSize: 12, fontWeight: '700', color: theme.white },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: theme.black },
  pressed: { opacity: 0.9 },
  sections: { paddingHorizontal: 14, paddingBottom: 100 },
  section: { marginBottom: 26 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.black, letterSpacing: -0.3 },
  sectionLink: { fontSize: 13, fontWeight: '700', color: theme.gray600 },
  sectionGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '50%' },
  list: { padding: 14, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: theme.black, marginBottom: 8 },
  emptyText: { fontSize: 14, color: theme.gray600, textAlign: 'center', lineHeight: 20 },
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  fabPressed: { transform: [{ scale: 0.96 }] },
})
