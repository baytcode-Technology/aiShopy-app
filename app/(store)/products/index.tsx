import { useCallback, useMemo, useState } from "react";

import { FlatList, Text, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import { AppPressable } from "@/components/ui/AppPressable";

import { Fab } from "@/components/ui/Fab";

import { EmptyState } from "@/components/ui/EmptyState";

import { Screen, ScreenBody } from "@/components/ui/Screen";

import { ScreenHeader } from "@/components/ui/ScreenHeader";

import { PillTab } from "@/components/ui/PillTab";
import { SearchBar } from "@/components/ui/SearchBar";

import { ProductListSkeleton } from "@/components/ui/Skeleton";

import Colors from "@src/theme/colors";

import { useFocusEffect, useRouter, type Href } from "expo-router";

import { CreateProductModal } from "@/components/store/CreateProductModal";

import { ProductListRow } from "@/components/store/ProductListRow";
import { getProductStatus } from "@src/lib/product-status";
import type { ProductStatus } from "@src/types/product";

import { fetchProducts } from "@src/api/products";

import { fetchCategories } from "@src/api/categories";

import { useStore } from "@src/contexts/store-context";

import { showError } from "@src/lib/toast";

import type { Product } from "@src/types/product";

import type { Category } from "@src/types/category";

type StatusFilter = "all" | ProductStatus;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "unlisted", label: "Unlisted" },
];

export default function ProductsScreen() {
  const router = useRouter();

  const { store } = useStore();

  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [productModalOpen, setProductModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!store?.id) return;

    setLoading(true);

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetchProducts(store.id),

        fetchCategories(store.id),
      ]);

      setProducts(productsRes.data.products);

      const counts = new Map<string, number>();

      for (const p of productsRes.data.products) {
        if (p.category_id) {
          counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
        }
      }

      setCategories(
        categoriesRes.data.categories.map((c) => ({
          ...c,

          product_count: counts.get(c.id) ?? c.product_count ?? 0,
        })),
      );
    } catch (e) {
      showError(e, "Could not load catalog");
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || getProductStatus(p) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const listHeader = (
    <View className="pb-2">
      <SearchBar
        placeholder="Search products…"
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
        showLogo
        variant="tab"
        title="Products"
        subtitle={`${products.length} products · ${categories.length} categories`}
        right={
          <AppPressable
            containerClassName="flex-row items-center gap-2 rounded-full border border-gray-200 bg-surface px-4 py-2.5"
            onPress={() => router.push("/(store)/products/categories" as Href)}
          >
            <FontAwesome
              name="th-large"
              size={13}
              color={Colors.brand.primary}
            />

            <Text className="text-[12px] font-bold text-ink tracking-wide">
              Categories
            </Text>
          </AppPressable>
        }
      />

      <ScreenBody className="flex-1">
        {loading ? (
          <View className="flex-1 px-5 pt-2">
            {listHeader}

            <ProductListSkeleton />
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1">
            {listHeader}

            <View className="flex-1 px-2 pb-28">
              <EmptyState
                icon="cube"
                title="No products yet"
                description="Tap + to add your first product to the catalog."
              />
            </View>
          </View>
        ) : filtered.length === 0 ? (
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
            data={filtered}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeader}
            contentContainerClassName="px-5 pb-32 pt-1"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductListRow
                product={item}
                onPress={() =>
                  router.push(`/(store)/products/${item.id}` as Href)
                }
              />
            )}
          />
        )}

        <Fab onPress={() => setProductModalOpen(true)} />

        {store?.id ? (
          <CreateProductModal
            visible={productModalOpen}
            storeId={store.id}
            categories={categories}
            onClose={() => setProductModalOpen(false)}
            onCreated={loadData}
          />
        ) : null}
      </ScreenBody>
    </Screen>
  );
}
