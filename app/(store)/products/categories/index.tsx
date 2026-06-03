import { useCallback, useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useFocusEffect, useRouter, type Href } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { CategoryGrid } from '@/components/store/CategoryGrid'
import { CreateCategoryModal } from '@/components/store/CreateCategoryModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CategoryCardSkeleton } from '@/components/ui/Skeleton'
import { fetchCategories } from '@src/api/categories'
import { fetchProducts } from '@src/api/products'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import type { Category } from '@src/types/category'

function CategoriesSkeleton() {
  return (
    <View className="flex-row flex-wrap -mx-1.5">
      {[0, 1, 2, 3].map((i) => (
        <View key={i} className="w-1/2 px-1.5 mb-5">
          <CategoryCardSkeleton />
        </View>
      ))}
    </View>
  )
}

export default function CategoriesScreen() {
  const router = useRouter()
  const { store } = useStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetchCategories(store.id),
        fetchProducts(store.id),
      ])
      const products = productsRes.data.products
      const counts = new Map<string, number>()
      for (const p of products) {
        if (p.category_id) {
          counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1)
        }
      }
      setCategories(
        categoriesRes.data.categories.map((c) => ({
          ...c,
          product_count: counts.get(c.id) ?? c.product_count ?? 0,
        }))
      )
    } catch (e) {
      showError(e, 'Could not load categories')
    } finally {
      setLoading(false)
    }
  }, [store?.id])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const headerAction = useMemo(
    () => (
      <Button
        label="New category"
        size="md"
        className="px-5 py-3 min-h-0 rounded-full self-start"
        onPress={() => setModalOpen(true)}
      />
    ),
    []
  )

  return (
    <Screen>
      <ScreenHeader
        title="Categories"
        subtitle={`${categories.length} collections`}
        onBack={() => router.back()}
      />
      <ScreenBody className="flex-1 px-5 pt-1">
        {loading ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-12">
            <SectionHeader title="Your categories" className="mt-2 mb-5" />
            <CategoriesSkeleton />
          </ScrollView>
        ) : categories.length === 0 ? (
          <EmptyState
            icon="folder-open-o"
            title="No categories yet"
            description="Create a category with a cover image, then assign products to it."
            action={headerAction}
          />
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-12"
            showsVerticalScrollIndicator={false}
          >
            <SectionHeader
              large
              title="Your categories"
              subtitle="Tap a card to manage products"
              right={headerAction}
              className="mt-2 mb-1"
            />
            <CategoryGrid
              variant="hero"
              categories={categories}
              onPressCategory={(cat) =>
                router.push(`/(store)/products/categories/${cat.id}` as Href)
              }
            />
          </ScrollView>
        )}

        {store?.id ? (
          <CreateCategoryModal
            visible={modalOpen}
            storeId={store.id}
            categories={categories}
            onClose={() => setModalOpen(false)}
            onCreated={loadData}
          />
        ) : null}
      </ScreenBody>
    </Screen>
  )
}
