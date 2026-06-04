import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { EditProductModal } from '@/components/store/EditProductModal'
import { ProductImageCarousel } from '@/components/store/ProductImageCarousel'
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { StickyBottomBar } from '@/components/ui/StickyBottomBar'
import { Body, Caption, Heading, Muted, SectionTitle } from '@/components/ui/Typography'
import { ProductStatusBadge } from '@/components/store/ProductStatusBadge'
import { ProductStatusPicker } from '@/components/store/ProductStatusPicker'
import { fetchProduct, updateProduct } from '@src/api/products'
import { getProductStatus } from '@src/lib/product-status'
import { showError, showSuccess } from '@src/lib/toast'
import type { ProductStatus } from '@src/types/product'
import { fetchCategories } from '@src/api/categories'
import { useStore } from '@src/contexts/store-context'
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
  const [savingStatus, setSavingStatus] = useState(false)

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

  const onStatusChange = async (next: ProductStatus) => {
    if (!product || getProductStatus(product) === next) return
    setSavingStatus(true)
    try {
      const res = await updateProduct(product.id, { status: next })
      setProduct(res.data)
      showSuccess('Status updated')
    } catch (e) {
      showError(e, 'Could not update status')
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <Screen variant="canvas" edges={['top']}>
      <View className="flex-row items-center px-5 py-3.5 bg-surface border-b border-gray-100">
        <IconButton variant="ghost" onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={18} color={Colors.brand.primary} />
        </IconButton>
        <Text
          className="flex-1 text-[17px] font-extrabold text-ink text-center mx-3 tracking-tight"
          numberOfLines={1}
        >
          {product?.name ?? 'Product'}
        </Text>
        <IconButton variant="ghost" onPress={() => setEditOpen(true)} disabled={!product}>
          <FontAwesome name="pencil" size={16} color={Colors.brand.primary} />
        </IconButton>
      </View>

      {loading ? (
        <ScreenBody className="items-center justify-center">
          <ActivityIndicator color={Colors.brand.primary} size="large" />
        </ScreenBody>
      ) : !product ? (
        <ScreenBody className="items-center justify-center">
          <Muted className="text-base font-semibold">Product not found</Muted>
        </ScreenBody>
      ) : (
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pt-5"
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            <AnimatedFadeIn>
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
                    className="mb-7"
                  />
                ) : (
                  <View className="h-[300px] rounded-[28px] items-center justify-center bg-gray-100 mb-7 border border-gray-200">
                    <Text className="text-6xl font-extrabold text-gray-300">
                      {product.name.slice(0, 1)}
                    </Text>
                  </View>
                )
              })()}

              <View className="flex-row flex-wrap gap-2 mb-4">
                <ProductStatusBadge status={getProductStatus(product)} />
                <Badge label={categoryName} tone="outline" />
              </View>

              <Card className="p-4 mb-7">
                <ProductStatusPicker
                  value={getProductStatus(product)}
                  onChange={onStatusChange}
                  disabled={savingStatus}
                />
              </Card>

              <Heading className="text-[30px] tracking-tighter mb-2 leading-tight">{product.name}</Heading>
              <Text className="text-[32px] font-extrabold text-ink tracking-tighter mb-1">
                {symbol}
                {product.base_price}
              </Text>
              {product.compare_at_price ? (
                <Caption className="line-through mb-7 text-gray-400">
                  Compare {symbol}
                  {product.compare_at_price}
                </Caption>
              ) : (
                <View className="mb-7" />
              )}

              <View className="flex-row gap-3 mb-9">
                <StatCard
                  label="Stock"
                  value={product.track_inventory ? String(product.stock_qty) : '—'}
                />
                <StatCard label="SKU" value={product.sku ?? '—'} />
                <StatCard label="Variants" value={String(variants.length)} />
              </View>

              {product.description ? (
                <View className="mb-9">
                  <SectionTitle className="mb-3">About</SectionTitle>
                  <Body className="text-gray-600 leading-6">{product.description}</Body>
                </View>
              ) : null}

              {variants.length > 0 ? (
                <View className="mb-8">
                  <SectionTitle className="mb-4">Variants · {variants.length}</SectionTitle>
                  {variants.map((v) => {
                    const optionLabels = Object.entries(v.options ?? {})
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(' · ')
                    return (
                      <Card key={v.id} className="mb-3 p-4">
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="flex-1 text-base font-extrabold text-ink">{v.name}</Text>
                          <Badge
                            label={v.is_active ? 'Active' : 'Off'}
                            tone={v.is_active ? 'emphasis' : 'muted'}
                            className="ml-2"
                          />
                        </View>
                        {optionLabels ? <Caption className="mb-3">{optionLabels}</Caption> : null}
                        <View className="flex-row flex-wrap gap-3">
                          <Text className="text-[13px] font-bold text-ink">
                            {symbol}
                            {Number(product.base_price) + Number(v.price_delta)}
                          </Text>
                          <Text className="text-[13px] font-bold text-gray-600">
                            Stock {v.stock_qty}
                          </Text>
                          {v.sku ? (
                            <Text className="text-[13px] font-bold text-gray-600">SKU {v.sku}</Text>
                          ) : null}
                        </View>
                      </Card>
                    )
                  })}
                </View>
              ) : (
                <View className="mb-8">
                  <SectionTitle className="mb-3">Variants</SectionTitle>
                  <Muted>No variants — single SKU product.</Muted>
                </View>
              )}
            </AnimatedFadeIn>
          </ScrollView>

          <StickyBottomBar>
            <Button label="Edit product" size="lg" onPress={() => setEditOpen(true)} />
          </StickyBottomBar>
        </View>
      )}

      <EditProductModal
        visible={editOpen}
        product={product}
        variants={variants}
        categories={categories}
        onClose={() => setEditOpen(false)}
        onSaved={load}
      />
    </Screen>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-[20px] p-4 bg-surface border border-gray-200">
      <Caption className="uppercase tracking-widest mb-1.5 text-gray-400">{label}</Caption>
      <Text className="text-base font-extrabold text-ink tracking-tight" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
