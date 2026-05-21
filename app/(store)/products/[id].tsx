import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { EditProductModal } from '@/components/store/EditProductModal'
import { ProductImageCarousel } from '@/components/store/ProductImageCarousel'
import { fetchProduct } from '@src/api/products'
import { fetchCategories } from '@src/api/categories'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import type { Category } from '@src/types/category'
import type { Product, ProductVariant } from '@src/types/product'
import { theme } from '@src/theme/colors'

export default function ProductDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>()
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  const router = useRouter()
  const { store } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [res, cats] = await Promise.all([
        fetchProduct(id, store?.id),
        store?.id ? fetchCategories(store.id) : Promise.resolve(null),
      ])
      setProduct(res.data.product)
      setVariants(res.data.variants)
      if (cats) setCategories(cats.data.categories)
    } catch (e) {
      showError(e, 'Could not load product')
    } finally {
      setLoading(false)
    }
  }, [id, store?.id])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const symbol = store?.currency === 'INR' ? '₹' : '$'
  const categoryName =
    categories.find((c) => c.id === product?.category_id)?.name ?? 'Uncategorized'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={18} color={theme.black} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product?.name ?? 'Product'}
        </Text>
        <Pressable
          style={styles.iconBtn}
          onPress={() => setEditOpen(true)}
          disabled={!product}
        >
          <FontAwesome name="pencil" size={18} color={theme.black} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.black} />
        </View>
      ) : !product ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Product not found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {(() => {
            const galleryImages =
              product.images.length > 0
                ? product.images
                : product.thumbnail_url
                  ? [product.thumbnail_url]
                  : []
            return galleryImages.length > 0 ? (
              <ProductImageCarousel
                images={galleryImages}
                initialUri={product.thumbnail_url}
                style={styles.carousel}
              />
            ) : (
              <View style={styles.heroPlaceholder}>
                <Text style={styles.heroLetter}>{product.name.slice(0, 1)}</Text>
              </View>
            )
          })()}

          <View style={styles.badgeRow}>
            <View style={[styles.badge, product.is_active ? styles.badgeOn : styles.badgeOff]}>
              <Text style={[styles.badgeText, product.is_active && styles.badgeTextOn]}>
                {product.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{categoryName}</Text>
            </View>
          </View>

          <Text style={styles.price}>
            {symbol}
            {product.base_price}
          </Text>
          {product.compare_at_price ? (
            <Text style={styles.compare}>
              Compare {symbol}
              {product.compare_at_price}
            </Text>
          ) : null}

          <View style={styles.statsRow}>
            <StatCard label="Stock" value={product.track_inventory ? String(product.stock_qty) : '—'} />
            <StatCard label="SKU" value={product.sku ?? '—'} />
            <StatCard label="Variants" value={String(variants.length)} />
          </View>

          {product.description ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>About</Text>
              <Text style={styles.bodyText}>{product.description}</Text>
            </View>
          ) : null}

          {variants.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Variants · {variants.length}</Text>
              {variants.map((v) => {
                const optionLabels = Object.entries(v.options ?? {})
                  .map(([k, val]) => `${k}: ${val}`)
                  .join(' · ')
                return (
                  <View key={v.id} style={styles.variantCard}>
                    <View style={styles.variantTop}>
                      <Text style={styles.variantName}>{v.name}</Text>
                      <Text style={v.is_active ? styles.variantOn : styles.variantOff}>
                        {v.is_active ? 'Active' : 'Off'}
                      </Text>
                    </View>
                    {optionLabels ? (
                      <Text style={styles.variantOptions}>{optionLabels}</Text>
                    ) : null}
                    <View style={styles.variantStats}>
                      <Text style={styles.variantStat}>
                        Price {symbol}
                        {Number(product.base_price) + Number(v.price_delta)}
                      </Text>
                      <Text style={styles.variantStat}>Stock {v.stock_qty}</Text>
                      {v.sku ? <Text style={styles.variantStat}>SKU {v.sku}</Text> : null}
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Variants</Text>
              <Text style={styles.muted}>No variants — single SKU product.</Text>
            </View>
          )}

        </ScrollView>
      )}

      <EditProductModal
        visible={editOpen}
        product={product}
        variants={variants}
        categories={categories}
        onClose={() => setEditOpen(false)}
        onSaved={load}
      />
    </SafeAreaView>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: theme.black,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 16, color: theme.gray600 },
  body: { padding: 20, paddingBottom: 48 },
  carousel: { marginBottom: 16 },
  heroPlaceholder: {
    height: 280,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.gray100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.gray200,
  },
  heroLetter: { fontSize: 64, fontWeight: '800', color: theme.gray400 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.black,
  },
  badgeOn: { backgroundColor: theme.black },
  badgeOff: { backgroundColor: theme.white },
  badgeText: { fontSize: 11, fontWeight: '700', color: theme.black },
  badgeTextOn: { color: theme.white },
  price: { fontSize: 32, fontWeight: '800', color: theme.black, letterSpacing: -0.5 },
  compare: { fontSize: 14, color: theme.gray600, marginTop: 4, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.gray100,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.gray600,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  statValue: { fontSize: 15, fontWeight: '700', color: theme.black },
  block: { marginBottom: 24 },
  blockTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  bodyText: { fontSize: 15, color: theme.gray600, lineHeight: 24 },
  muted: { fontSize: 14, color: theme.gray600 },
  variantCard: {
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: theme.white,
  },
  variantTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  variantName: { fontSize: 16, fontWeight: '700', color: theme.black, flex: 1 },
  variantOn: { fontSize: 11, fontWeight: '700', color: theme.success },
  variantOff: { fontSize: 11, fontWeight: '700', color: theme.gray400 },
  variantOptions: { fontSize: 12, color: theme.gray600, marginBottom: 8 },
  variantStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  variantStat: { fontSize: 13, fontWeight: '600', color: theme.black },
})
