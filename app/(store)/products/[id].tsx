import { useCallback, useState } from "react";

import { ActivityIndicator, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { EditProductModal } from "@/components/store/EditProductModal";

import { ProductCategoryRow } from "@/components/store/ProductCategoryRow";

import { ProductInventoryFlagsBlock } from "@/components/store/ProductInventoryFlagsBlock";

import { ProductDetailMediaSection } from "@/components/store/product-media/ProductDetailMediaSection";

import { DetailSection } from "@/components/store/detail/DetailSection";

import { AnimatedFadeIn } from "@/components/ui/AnimatedFadeIn";

import { DetailScreenHeader } from "@/components/navigation/DetailScreenHeader";

import { IconButton } from "@/components/ui/IconButton";

import { Screen, ScreenBody } from "@/components/ui/Screen";

import { Muted } from "@/components/ui/Typography";

import { ProductInfoEditBlock } from "@/components/store/ProductInfoEditBlock";

import { ProductStatusPicker } from "@/components/store/ProductStatusPicker";

import { ProductVariantsSection } from "@/components/store/ProductVariantsSection";

import { fetchProduct, updateProduct } from "@src/api/products";

import { getProductStatus } from "@src/lib/product-status";

import { showError, showSuccess } from "@src/lib/toast";

import type { ProductStatus } from "@src/types/product";

import { fetchCategories } from "@src/api/categories";

import { useStore } from "@src/contexts/store-context";

import type { Category } from "@src/types/category";

import type { Product, ProductVariant } from "@src/types/product";

import Colors from "@src/theme/colors";

export default function ProductDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>();

  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idRaw != null ? Number(idRaw) : NaN;

  const router = useRouter();

  const { store } = useStore();

  const [product, setProduct] = useState<Product | null>(null);

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);

  const [savingStatus, setSavingStatus] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) return;

    setLoading(true);

    try {
      const [res, cats] = await Promise.all([
        fetchProduct(id, store?.id),

        store?.id ? fetchCategories(store.id) : Promise.resolve(null),
      ]);

      setProduct(res.data.product);

      setVariants(res.data.variants);

      if (cats) setCategories(cats.data.categories);
    } catch (e) {
      showError(e, "Could not load product");
    } finally {
      setLoading(false);
    }
  }, [id, store?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const symbol = store?.currency === "INR" ? "₹" : "$";

  const onStatusChange = async (next: ProductStatus) => {
    if (!product || getProductStatus(product) === next) return;

    setSavingStatus(true);

    try {
      const res = await updateProduct(product.id, { status: next });

      setProduct(res.data);

      showSuccess("Status updated");
    } catch (e) {
      showError(e, "Could not update status");
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <Screen variant="shell" edges={["top"]}>
      <DetailScreenHeader
        title={product?.name ?? "Product"}
        onBack={() => router.back()}
        rightActions={
          <IconButton
            variant="ghost"
            onPress={() => setEditOpen(true)}
            disabled={!product}
            accessibilityLabel="Edit product"
          >
            <FontAwesome name="pencil" size={16} color={Colors.brand.primary} />
          </IconButton>
        }
      />

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
            contentContainerClassName="px-5 pt-4 gap-3"
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <AnimatedFadeIn className="flex-1 gap-2">
              {store?.id ? (
                <ProductDetailMediaSection
                  product={product}
                  storeId={store.id}
                  onProductUpdated={setProduct}
                />
              ) : null}

              {store?.id ? (
                <ProductCategoryRow
                  product={product}
                  storeId={store.id}
                  categories={categories}
                  onUpdated={setProduct}
                  onCategoriesChange={setCategories}
                />
              ) : null}

              <DetailSection className="p-3">
                <ProductStatusPicker
                  value={getProductStatus(product)}
                  onChange={onStatusChange}
                  disabled={savingStatus}
                  compact
                />
              </DetailSection>

              <ProductInfoEditBlock
                product={product}
                variantCount={variants.length}
                currencySymbol={symbol}
                onUpdated={setProduct}
              />

              {variants.length === 0 ? (
                <ProductInventoryFlagsBlock
                  product={product}
                  onUpdated={setProduct}
                />
              ) : null}

              <ProductVariantsSection
                product={product}
                variants={variants}
                currencySymbol={symbol}
                onVariantUpdated={(updated) => {
                  setVariants((prev) =>
                    prev.map((item) =>
                      item.id === updated.id ? updated : item,
                    ),
                  );
                }}
                onVariantDeleted={(variantId) => {
                  setVariants((prev) =>
                    prev.filter((item) => item.id !== variantId),
                  );
                }}
              />
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
  );
}
