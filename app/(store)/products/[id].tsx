import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { fetchProduct } from '@src/api/products'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import type { Product, ProductVariant } from '@src/types/product'
import { theme } from '@src/theme/colors'

export default function ProductDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>()
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  const router = useRouter()
  const { store } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetchProduct(id, store?.id)
      setProduct(res.data.product)
      setVariants(res.data.variants)
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <FontAwesome name="arrow-left" size={20} color={theme.black} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Product details
        </Text>
        <View style={{ width: 20 }} />
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
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.hero}>
            {product.thumbnail_url ? (
              <Image source={{ uri: product.thumbnail_url }} style={styles.heroImage} />
            ) : (
              <Text style={styles.heroPlaceholder}>{product.name.slice(0, 1)}</Text>
            )}
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>
            {symbol}
            {product.base_price}
          </Text>

          <View style={styles.metaRow}>
            <Meta label="SKU" value={product.sku ?? '—'} />
            <Meta
              label="Stock"
              value={product.track_inventory ? String(product.stock_qty) : 'Not tracked'}
            />
            <Meta label="Status" value={product.is_active ? 'Active' : 'Inactive'} />
          </View>

          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : null}

          {variants.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Variants ({variants.length})</Text>
              {variants.map((v) => (
                <View key={v.id} style={styles.variantRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.variantName}>{v.name}</Text>
                    <Text style={styles.variantMeta}>
                      {symbol}
                      {Number(product.base_price) + Number(v.price_delta)} · Stock {v.stock_qty}
                      {v.sku ? ` · ${v.sku}` : ''}
                    </Text>
                  </View>
                  <Text style={v.is_active ? styles.badgeActive : styles.badgeInactive}>
                    {v.is_active ? 'Active' : 'Off'}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {product.images.length > 1 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {product.images.map((uri) => (
                  <Image key={uri} source={{ uri }} style={styles.galleryThumb} />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.gray100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.black, flex: 1, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 16, color: theme.gray600 },
  body: { padding: 16, paddingBottom: 40 },
  hero: {
    height: 220,
    borderRadius: 12,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.gray200,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { fontSize: 48, fontWeight: '700', color: theme.gray400 },
  name: { fontSize: 24, fontWeight: '700', color: theme.black, marginBottom: 6 },
  price: { fontSize: 22, fontWeight: '700', color: theme.black, marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  meta: {
    flex: 1,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 10,
    padding: 12,
  },
  metaLabel: { fontSize: 11, color: theme.gray600, textTransform: 'uppercase', marginBottom: 4 },
  metaValue: { fontSize: 14, fontWeight: '600', color: theme.black },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.black, marginBottom: 10 },
  description: { fontSize: 15, color: theme.gray600, lineHeight: 22 },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  variantName: { fontSize: 15, fontWeight: '600', color: theme.black },
  variantMeta: { fontSize: 13, color: theme.gray600, marginTop: 2 },
  badgeActive: { fontSize: 11, fontWeight: '700', color: theme.success },
  badgeInactive: { fontSize: 11, fontWeight: '700', color: theme.gray400 },
  galleryThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: theme.gray200,
  },
})
