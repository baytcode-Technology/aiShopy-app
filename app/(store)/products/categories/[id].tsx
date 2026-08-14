import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CategoryActiveBadge } from '@/components/store/CategoryActiveBadge'
import { CategoryDetailCover } from '@/components/store/CategoryDetailCover'
import { CategoryInfoEditBlock } from '@/components/store/CategoryInfoEditBlock'
import { EditCategoryModal } from '@/components/store/EditCategoryModal'
import { CategorySubcategoriesSection } from '@/components/store/CategorySubcategoriesSection'
import { CategoryProductsSection } from '@/components/store/CategoryProductsSection'
import { CreateCategoryModal } from '@/components/store/CreateCategoryModal'
import { CategoryProductPickerModal } from '@/components/store/CategoryProductPickerModal'
import { CategoryTreeModal } from '@/components/store/CategoryTreeModal'
import { CreateProductModal } from '@/components/store/CreateProductModal'
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Fab } from '@/components/ui/Fab'
import { DetailScreenHeader } from '@/components/navigation/DetailScreenHeader'
import { IconButton } from '@/components/ui/IconButton'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { Muted } from '@/components/ui/Typography'
import { deleteCategory, fetchCategories, updateCategory } from '@src/api/categories'
import { fetchProducts } from '@src/api/products'
import { useStore } from '@src/contexts/store-context'
import {
  getAttachableCategories,
  getCategoryBreadcrumb,
  getDirectChildren,
} from '@src/lib/category-tree'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Category } from '@src/types/category'
import type { Product } from '@src/types/product'

export default function CategoryDetailScreen() {
  const router = useRouter()
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>()
  const categoryIdRaw = Array.isArray(idParam) ? idParam[0] : idParam ?? ''
  const categoryId = Number(categoryIdRaw)
  const { store } = useStore()

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [mainEditOpen, setMainEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false)
  const [attachExistingOpen, setAttachExistingOpen] = useState(false)
  const [removingChildId, setRemovingChildId] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    if (!store?.id || !Number.isFinite(categoryId)) return
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

  const attachExisting = async (childId: number | null) => {
    if (!childId || childId === categoryId) return
    try {
      await updateCategory(childId, { parent_id: categoryId })
      showSuccess('Subcategory added')
      setAttachExistingOpen(false)
      await loadData()
    } catch (e) {
      showError(e, 'Could not add subcategory')
    }
  }

  const detachChild = async (childId: number) => {
    setRemovingChildId(childId)
    try {
      await updateCategory(childId, { parent_id: null })
      showSuccess('Removed from this category')
      await loadData()
    } catch (e) {
      showError(e, 'Could not remove subcategory')
    } finally {
      setRemovingChildId(null)
    }
  }

  const attachableCategories = getAttachableCategories(categoryId, categories)

  return (
    <Screen variant="canvas" edges={['top']}>
      <DetailScreenHeader
        title={category?.name ?? 'Category'}
        onBack={() => router.back()}
        rightActions={
          <>
            <IconButton
              variant="ghost"
              onPress={() => setMainEditOpen(true)}
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
          </>
        }
      />

      {loading ? (
        <ScreenBody className="items-center justify-center flex-1">
          <ActivityIndicator color={Colors.brand.primary} size="large" />
        </ScreenBody>
      ) : !category ? (
        <ScreenBody className="items-center justify-center flex-1">
          <Muted className="text-base font-semibold">Category not found</Muted>
        </ScreenBody>
      ) : !store?.id ? null : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pt-5"
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
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
              />

              {category.parent_id ? (
                <Text className="text-[13px] text-gray-500 mb-4">
                  {getCategoryBreadcrumb(category.id, categories)}
                </Text>
              ) : null}

              <CategorySubcategoriesSection
                children={getDirectChildren(categoryId, categories).map((child) => ({
                  ...child,
                  product_count: allProducts.filter((p) => p.category_id === child.id).length,
                }))}
                onPressChild={(childId) =>
                  router.push(`/(store)/products/categories/${childId}` as Href)
                }
                onAddSubcategory={() => setSubcategoryModalOpen(true)}
                onAddExisting={() => setAttachExistingOpen(true)}
                onRemoveChild={detachChild}
                removingChildId={removingChildId}
              />

              <CategoryProductsSection
                products={products}
                onPressProduct={(productId) =>
                  router.push(`/(store)/products/${productId}` as Href)
                }
                onAddRemove={() => setPickerOpen(true)}
              />
            </AnimatedFadeIn>
          </ScrollView>

          <Fab onPress={() => setProductModalOpen(true)} />

          <CreateProductModal
            visible={productModalOpen}
            storeId={store.id}
            categories={categories}
            initialCategoryId={categoryId}
            onClose={() => setProductModalOpen(false)}
            onCreated={loadData}
          />
          <CreateCategoryModal
            visible={subcategoryModalOpen}
            storeId={store.id}
            categories={categories}
            defaultParentId={categoryId}
            onClose={() => setSubcategoryModalOpen(false)}
            onCreated={loadData}
          />
          <CategoryTreeModal
            isOpen={attachExistingOpen}
            onClose={() => setAttachExistingOpen(false)}
            categories={attachableCategories}
            selectedId={null}
            onSelect={attachExisting}
            title="Add existing category"
            subtitle="Nest another category under this one"
            showNoneOption={false}
          />
          <EditCategoryModal
            visible={mainEditOpen}
            category={category}
            storeId={store.id}
            productCount={products.length}
            onClose={() => setMainEditOpen(false)}
            onUpdated={setCategory}
            onManageProducts={() => setPickerOpen(true)}
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
