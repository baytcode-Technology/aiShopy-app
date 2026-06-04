import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryActiveBadge } from '@/components/store/CategoryActiveBadge'
import { CategoryDetailCover } from '@/components/store/CategoryDetailCover'
import { CategoryInfoEditBlock } from '@/components/store/CategoryInfoEditBlock'
import { CategoryProductPickerModal } from '@/components/store/CategoryProductPickerModal'
import { CreateProductModal } from '@/components/store/CreateProductModal'
import { EditCategoryModal } from '@/components/store/EditCategoryModal'
import { ProductListRow } from '@/components/store/ProductListRow'
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Fab } from '@/components/ui/Fab'
import { IconButton } from '@/components/ui/IconButton'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Muted } from '@/components/ui/Typography'
import { deleteCategory, fetchCategories } from '@src/api/categories'
import { fetchProducts } from '@src/api/products'
import { useStore } from '@src/contexts/store-context'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'
import type { Product } from '@src/types/product'

export default function CategoryDetailScreen() {
  const router = useRouter()
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>()
  const categoryId = Array.isArray(idParam) ? idParam[0] : idParam ?? ''
  const { store } = useStore()

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [infoEditing, setInfoEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      const inCategory = all.filter((p) => p.category_id === categoryId)
      setCategory({
        ...found,
        product_count: inCategory.length,
      })
      setCategories(cats)
      setAllProducts(all)
      setProducts(inCategory)
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

  const runDelete = async () => {
    if (!category) return
    setDeleteLoading(true)
    try {
      await deleteCategory(category.id)
      setDeleteOpen(false)
      showSuccess('Category deleted. Products were uncategorized.')
      router.back()
    } catch (e) {
      showError(e, 'Could not delete category')
    } finally {
      setDeleteLoading(false)
    }
  }

  const renderListHeader = () => {
    if (!category || !store?.id) return null
    return (
      <AnimatedFadeIn>
        <CategoryDetailCover
          category={category}
          storeId={store.id}
          onUpdated={setCategory}
        />

        <View className="flex-row flex-wrap gap-2 mb-4">
          <CategoryActiveBadge isActive={category.is_active} />
        </View>

        <CategoryInfoEditBlock
          category={category}
          productCount={products.length}
          onUpdated={setCategory}
          onEditingChange={setInfoEditing}
        />

        <SectionHeader
          title={`Products · ${products.length}`}
          className="mb-2"
          right={
            <Pressable
              onPress={() => setPickerOpen(true)}
              className="flex-row items-center gap-1.5 rounded-full border border-gray-200 bg-surface px-3.5 py-2"
              hitSlop={6}
            >
              <FontAwesome name="exchange" size={12} color={Colors.brand.primary} />
              <Text className="text-[12px] font-bold text-ink">Add / remove</Text>
            </Pressable>
          }
        />
      </AnimatedFadeIn>
    )
  }

  return (
    <Screen variant="canvas" edges={['top']}>
      <View className="flex-row items-center px-5 py-3.5 bg-surface border-b border-gray-100">
        <IconButton variant="ghost" onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={18} color={Colors.brand.primary} />
        </IconButton>
        <Text
          className="flex-1 text-[17px] font-extrabold text-ink text-center mx-2 tracking-tight"
          numberOfLines={1}
        >
          {category?.name ?? 'Category'}
        </Text>
        <View className="flex-row items-center gap-0.5 shrink-0">
          <IconButton
            variant="ghost"
            onPress={() => setEditModalOpen(true)}
            disabled={!category}
            accessibilityLabel="Edit category"
          >
            <FontAwesome name="pencil" size={16} color={Colors.brand.primary} />
          </IconButton>
          <IconButton
            variant="ghost"
            onPress={() => setDeleteOpen(true)}
            disabled={!category || deleteLoading}
            accessibilityLabel="Delete category"
          >
            <FontAwesome name="trash-o" size={16} color="#EF4444" />
          </IconButton>
        </View>
      </View>

      {loading ? (
        <ScreenBody className="items-center justify-center flex-1">
          <ActivityIndicator color={Colors.brand.primary} size="large" />
        </ScreenBody>
      ) : !category ? (
        <ScreenBody className="items-center justify-center flex-1">
          <Muted className="text-base font-semibold">Category not found</Muted>
        </ScreenBody>
      ) : (
        <>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={<View className="px-5 pt-5">{renderListHeader()}</View>}
            extraData={`${category.id}-${infoEditing}-${products.length}-${category.name}`}
            ListEmptyComponent={
              <View className="px-5 pb-8">
                <Muted className="text-center text-[15px]">
                  No products in this category. Use Add / remove or tap + below.
                </Muted>
              </View>
            }
            contentContainerClassName="pb-32"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="px-5">
                <ProductListRow
                  product={item}
                  onPress={() =>
                    router.push(`/(store)/products/${item.id}` as Href)
                  }
                />
              </View>
            )}
          />

          <Fab onPress={() => setProductModalOpen(true)} />

          <EditCategoryModal
            visible={editModalOpen}
            category={category}
            onClose={() => setEditModalOpen(false)}
            onSaved={setCategory}
          />

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
                mode="edit"
                storeId={store.id}
                categoryId={categoryId}
                categoryName={category.name}
                allProducts={allProducts}
                onClose={() => setPickerOpen(false)}
                onSaved={loadData}
              />
            </>
          ) : null}

          <ConfirmDialog
            visible={deleteOpen}
            title="Delete category"
            message={`Delete "${category.name}"? Products in this category will be removed from it (not deleted).`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            loading={deleteLoading}
            onCancel={() => {
              if (!deleteLoading) setDeleteOpen(false)
            }}
            onConfirm={runDelete}
          />
        </>
      )}
    </Screen>
  )
}
