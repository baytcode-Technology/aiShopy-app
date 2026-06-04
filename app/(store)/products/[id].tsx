import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { EditProductModal } from '@/components/store/EditProductModal'
import { ProductDetailMediaSection } from '@/components/store/product-media/ProductDetailMediaSection'
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { Muted, SectionTitle } from '@/components/ui/Typography'
import { ProductInfoEditBlock } from '@/components/store/ProductInfoEditBlock'
import { ProductStatusBadge } from '@/components/store/ProductStatusBadge'
import { ProductStatusPicker } from '@/components/store/ProductStatusPicker'
import { VariantEditableCard } from '@/components/store/VariantEditableCard'
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
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <AnimatedFadeIn>
              {store?.id ? (
                <ProductDetailMediaSection
                  product={product}
                  storeId={store.id}
                  onProductUpdated={setProduct}
                />
              ) : null}

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

              <ProductInfoEditBlock
                product={product}
                variantCount={variants.length}
                currencySymbol={symbol}
                onUpdated={setProduct}
              />

              {variants.length > 0 ? (
                <View className="mb-8">
                  <SectionTitle className="mb-4">Variants · {variants.length}</SectionTitle>
                  {variants.map((v) => (
                    <VariantEditableCard
                      key={v.id}
                      variant={v}
                      product={product}
                      currencySymbol={symbol}
                      onUpdated={(updated) => {
                        setVariants((prev) =>
                          prev.map((item) => (item.id === updated.id ? updated : item))
                        )
                      }}
                      onDeleted={(variantId) => {
                        setVariants((prev) => prev.filter((item) => item.id !== variantId))
                      }}
                    />
                  ))}
                </View>
              ) : (
                <View className="mb-8">
                  <SectionTitle className="mb-3">Variants</SectionTitle>
                  <Muted>No variants — single SKU product.</Muted>
                </View>
              )}
            </AnimatedFadeIn>
          </ScrollView>
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

