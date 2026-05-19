import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from 'expo-router'
import { ProductCard } from '@/components/store/ProductCard'
import { CreateProductModal } from '@/components/store/CreateProductModal'
import { CreateCategoryModal } from '@/components/store/CreateCategoryModal'
import { fetchProducts } from '@src/api/products'
import { useStore } from '@src/contexts/store-context'
import { showError, showSuccess } from '@src/lib/toast'
import type { Product } from '@src/types/product'
import { theme } from '@src/theme/colors'

export default function ProductsScreen() {
  const { store } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)

  const loadProducts = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const res = await fetchProducts(store.id)
      setProducts(res.data.products)
    } catch (e) {
      showError(e, 'Could not load products')
    } finally {
      setLoading(false)
    }
  }, [store?.id])

  useFocusEffect(
    useCallback(() => {
      loadProducts()
    }, [loadProducts])
  )

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <View style={styles.headerIcons}>
          <FontAwesome name="th" size={18} color={theme.gray400} />
        </View>
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
        <Pressable style={styles.categoryBtn} onPress={() => setCategoryModalOpen(true)}>
          <Text style={styles.categoryBtnText}>Create category</Text>
        </Pressable>
      </View>

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
            <ProductCard product={item} currency={store?.currency} />
          )}
        />
      )}

      <Pressable style={styles.fab} onPress={() => setProductModalOpen(true)}>
        <FontAwesome name="plus" size={22} color={theme.white} />
      </Pressable>

      {store?.id ? (
        <>
          <CreateProductModal
            visible={productModalOpen}
            storeId={store.id}
            onClose={() => setProductModalOpen(false)}
            onCreated={loadProducts}
          />
          <CreateCategoryModal
            visible={categoryModalOpen}
            storeId={store.id}
            onClose={() => setCategoryModalOpen(false)}
            onCreated={() => showSuccess('Category created')}
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
  headerIcons: { flexDirection: 'row', gap: 12 },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
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
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.black,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryBtnText: { fontSize: 13, fontWeight: '600', color: theme.black },
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
