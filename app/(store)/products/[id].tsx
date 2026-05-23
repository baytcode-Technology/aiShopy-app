import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { EditProductModal } from '@/components/store/EditProductModal'
import { ProductImageCarousel } from '@/components/store/ProductImageCarousel'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Body, Caption, Heading, Muted, SectionTitle } from '@/components/ui/Typography'
import { fetchProduct } from '@src/api/products'
import { fetchCategories } from '@src/api/categories'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import type { Category } from '@src/types/category'
import type { Product, ProductVariant } from '@src/types/product'
import Colors from '@src/theme/colors'

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
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="flex-row items-center px-5 py-3.5 border-b border-gray-100">
        <IconButton className="bg-gray-100 border-0" onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={18} color={Colors.brand.primary} />
        </IconButton>
        <Text
          className="flex-1 text-lg font-extrabold text-ink text-center mx-2 tracking-tight"
          numberOfLines={1}
        >
          {product?.name ?? 'Product'}
        </Text>
        <IconButton
          className="bg-gray-100 border-0"
          onPress={() => setEditOpen(true)}
          disabled={!product}
        >
          <FontAwesome name="pencil" size={18} color={Colors.brand.primary} />
        </IconButton>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.brand.primary} />
        </View>
      ) : !product ? (
        <View className="flex-1 items-center justify-center">
          <Muted className="text-base font-semibold">Product not found</Muted>
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="p-6 pb-16"
          showsVerticalScrollIndicator={false}
        >
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
                className="mb-5"
              />
            ) : (
              <View className="h-[280px] rounded-2xl items-center justify-center bg-gray-100 mb-5 border border-gray-200">
                <Text className="text-6xl font-extrabold text-gray-400">
                  {product.name.slice(0, 1)}
                </Text>
              </View>
            )
          })()}

          <View className="flex-row gap-2 mb-4">
            <Badge
              label={product.is_active ? 'Active' : 'Inactive'}
              tone={product.is_active ? 'active' : 'inactive'}
            />
            <Badge label={categoryName} tone="default" />
          </View>

          <Heading className="text-[34px] tracking-tighter mb-1">
            {symbol}
            {product.base_price}
          </Heading>
          {product.compare_at_price ? (
            <Caption className="line-through mb-5">
              Compare {symbol}
              {product.compare_at_price}
            </Caption>
          ) : null}

          <View className="flex-row gap-2.5 mb-7">
            <StatCard
              label="Stock"
              value={product.track_inventory ? String(product.stock_qty) : '—'}
            />
            <StatCard label="SKU" value={product.sku ?? '—'} />
            <StatCard label="Variants" value={String(variants.length)} />
          </View>

          {product.description ? (
            <View className="mb-7">
              <SectionTitle className="mb-3.5">About</SectionTitle>
              <Body>{product.description}</Body>
            </View>
          ) : null}

          {variants.length > 0 ? (
            <View className="mb-7">
              <SectionTitle className="mb-3.5">Variants · {variants.length}</SectionTitle>
              {variants.map((v) => {
                const optionLabels = Object.entries(v.options ?? {})
                  .map(([k, val]) => `${k}: ${val}`)
                  .join(' · ')
                return (
                  <Card key={v.id} className="mb-3 shadow-sm shadow-ink/5">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="flex-1 text-base font-extrabold text-ink tracking-tight">
                        {v.name}
                      </Text>
                      <Badge
                        label={v.is_active ? 'Active' : 'Off'}
                        tone={v.is_active ? 'success' : 'inactive'}
                        className="ml-2"
                      />
                    </View>
                    {optionLabels ? (
                      <Caption className="mb-3 font-medium">{optionLabels}</Caption>
                    ) : null}
                    <View className="flex-row flex-wrap gap-3">
                      <Text className="text-[13px] font-bold text-ink">
                        Price {symbol}
                        {Number(product.base_price) + Number(v.price_delta)}
                      </Text>
                      <Text className="text-[13px] font-bold text-ink">Stock {v.stock_qty}</Text>
                      {v.sku ? (
                        <Text className="text-[13px] font-bold text-ink">SKU {v.sku}</Text>
                      ) : null}
                    </View>
                  </Card>
                )
              })}
            </View>
          ) : (
            <View className="mb-7">
              <SectionTitle className="mb-3.5">Variants</SectionTitle>
              <Muted>No variants — single SKU product.</Muted>
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
    <View className="flex-1 rounded-2xl p-4 bg-gray-100">
      <Caption className="uppercase tracking-widest mb-1.5">{label}</Caption>
      <Text className="text-base font-extrabold text-ink tracking-tight" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
