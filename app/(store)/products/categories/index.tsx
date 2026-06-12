import { CategoryTreeRow } from "@/components/store/CategoryTreeRow";
import { CreateCategoryModal } from "@/components/store/CreateCategoryModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Fab } from "@/components/ui/Fab";
import { PillTab } from "@/components/ui/PillTab";
import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { ProductListSkeleton } from "@/components/ui/Skeleton";
import { fetchCategories } from "@src/api/categories";
import { fetchProducts } from "@src/api/products";
import { useStore } from "@src/contexts/store-context";
import {
  buildCategoryTree,
  defaultExpandedIds,
  filterCategoriesForTree,
  flattenCategoryTree,
  getCategoryBreadcrumb,
} from "@src/lib/category-tree";
import { showError } from "@src/lib/toast";
import type { Category } from "@src/types/category";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";

type StatusFilter = "all" | "active" | "unlisted";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "unlisted", label: "Unlisted" },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { store } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetchCategories(store.id),
        fetchProducts(store.id),
      ]);
      const products = productsRes.data.products;
      const counts = new Map<string, number>();
      for (const p of products) {
        if (p.category_id) {
          counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
        }
      }
      const withCounts = categoriesRes.data.categories.map((c) => ({
        ...c,
        product_count: counts.get(c.id) ?? c.product_count ?? 0,
      }));
      setCategories(withCounts);
      const roots = buildCategoryTree(withCounts);
      setExpandedIds(defaultExpandedIds(roots));
    } catch (e) {
      showError(e, "Could not load categories");
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filteredCategories = useMemo(
    () =>
      filterCategoriesForTree(categories, {
        search,
        status: statusFilter,
      }),
    [categories, search, statusFilter],
  );

  const isSearching = search.trim().length > 0 || statusFilter !== "all";

  const tree = useMemo(
    () => buildCategoryTree(filteredCategories),
    [filteredCategories],
  );

  const flatItems = useMemo(() => {
    if (isSearching) {
      return filteredCategories
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((category) => ({
          category,
          depth: 0,
          hasChildren: false,
          childCount: 0,
          breadcrumb: getCategoryBreadcrumb(category.id, categories),
        }));
    }
    return flattenCategoryTree(tree, expandedIds).map((item) => ({
      ...item,
      breadcrumb: undefined as string | undefined,
    }));
  }, [isSearching, filteredCategories, tree, expandedIds, categories]);

  const rootCount = useMemo(
    () => categories.filter((c) => !c.parent_id).length,
    [categories],
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const listHeader = (
    <View className="pb-2">
      <SearchBar
        placeholder="Search categories…"
        value={search}
        onChangeText={setSearch}
        className="mt-1 mb-3"
      />
      <View className="flex-row items-center gap-1 mb-1 px-1 flex-wrap">
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <PillTab
              key={tab.key}
              selected={active}
              onPress={() => setStatusFilter(tab.key)}
              accessibilityLabel={tab.label}
              style={{
                marginRight: 4,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text
                className={`text-[14px] font-semibold ${
                  active ? "text-ink" : "text-gray-500"
                }`}
              >
                {tab.label}
              </Text>
            </PillTab>
          );
        })}
      </View>
    </View>
  );

  return (
    <Screen>
      <ScreenHeader
        title="Categories"
        subtitle={`${rootCount} top-level · ${categories.length} total`}
        onBack={() => router.back()}
        variant="tab"
        large={false}
      />

      <ScreenBody className="flex-1">
        {loading ? (
          <View className="flex-1 px-5 pt-2">
            {listHeader}
            <ProductListSkeleton />
          </View>
        ) : categories.length === 0 ? (
          <View className="flex-1">
            {listHeader}
            <View className="flex-1 px-2 pb-28">
              <EmptyState
                icon="folder-open-o"
                title="No categories yet"
                description="Create Men or Women first, then add Shirt, Pant, and more under them."
              />
            </View>
          </View>
        ) : flatItems.length === 0 ? (
          <View className="flex-1">
            {listHeader}
            <View className="flex-1 px-2 pb-28">
              <EmptyState
                icon="search"
                title="No matches"
                description="Try a different search or status filter."
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={flatItems}
            keyExtractor={(item) => item.category.id}
            ListHeaderComponent={listHeader}
            contentContainerClassName="px-5 pb-32 pt-1"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CategoryTreeRow
                category={item.category}
                depth={isSearching ? 0 : item.depth}
                hasChildren={item.hasChildren}
                childCount={item.childCount}
                expanded={expandedIds.has(item.category.id)}
                onToggleExpand={
                  isSearching || !item.hasChildren
                    ? undefined
                    : () => toggleExpand(item.category.id)
                }
                breadcrumb={item.breadcrumb}
                onPress={() =>
                  router.push(
                    `/(store)/products/categories/${item.category.id}` as Href,
                  )
                }
              />
            )}
          />
        )}

        <Fab onPress={() => setModalOpen(true)} />

        {store?.id ? (
          <CreateCategoryModal
            visible={modalOpen}
            storeId={store.id}
            categories={categories}
            onClose={() => setModalOpen(false)}
            onCreated={() => loadData()}
          />
        ) : null}
      </ScreenBody>
    </Screen>
  );
}
