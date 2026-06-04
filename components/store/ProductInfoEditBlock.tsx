import { CancelSaveRow } from "@/components/ui/CancelSaveRow";
import { Caption, SectionTitle } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { updateProduct } from "@src/api/products";
import { showError, showSuccess } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import type { Product } from "@src/types/product";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  product: Product;
  variantCount: number;
  currencySymbol: string;
  onUpdated: (product: Product) => void;
};

export function ProductInfoEditBlock({
  product,
  variantCount,
  currencySymbol,
  onUpdated,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.base_price));
  const [stock, setStock] = useState(String(product.stock_qty));
  const [sku, setSku] = useState(product.sku ?? "");
  const [description, setDescription] = useState(product.description ?? "");

  useEffect(() => {
    if (!editing) {
      setName(product.name);
      setPrice(String(product.base_price));
      setStock(String(product.stock_qty));
      setSku(product.sku ?? "");
      setDescription(product.description ?? "");
    }
  }, [product, editing]);

  const resetDraft = () => {
    setName(product.name);
    setPrice(String(product.base_price));
    setStock(String(product.stock_qty));
    setSku(product.sku ?? "");
    setDescription(product.description ?? "");
  };

  const cancel = () => {
    resetDraft();
    setEditing(false);
  };

  const save = async () => {
    const trimmedName = name.trim();
    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (!trimmedName) {
      showError("Product name is required");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      showError("Enter a valid price");
      return;
    }
    if (
      !Number.isFinite(stockNum) ||
      stockNum < 0 ||
      !Number.isInteger(stockNum)
    ) {
      showError("Enter a valid stock quantity");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProduct(product.id, {
        name: trimmedName,
        base_price: priceNum,
        stock_qty: stockNum,
        track_inventory: true,
        sku: sku.trim() || null,
        description: description.trim() || null,
      });
      onUpdated(res.data);
      setEditing(false);
      showSuccess("Product updated");
    } catch (e) {
      showError(e, "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const stockDisplay = product.track_inventory
    ? String(product.stock_qty)
    : "—";

  return (
    <View className="mb-7 rounded-[20px] border border-gray-200 bg-surface p-4 relative">
      {!editing ? (
        <Pressable
          onPress={() => setEditing(true)}
          className="absolute top-3 right-3 z-10"
          hitSlop={8}
          accessibilityLabel="Edit product details"
        >
          <View className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 items-center justify-center">
            <FontAwesome name="pencil" size={14} color={Colors.brand.primary} />
          </View>
        </Pressable>
      ) : null}

      {editing ? (
        <View className="gap-4 pr-2">
          <Field label="Product name">
            <TextInput
              className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-lg font-bold text-ink"
              value={name}
              onChangeText={setName}
              selectionColor={Colors.brand.primary}
            />
          </Field>
          <Field label="Price">
            <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
              <Text className="text-xl font-bold text-ink mr-1">
                {currencySymbol}
              </Text>
              <TextInput
                className="flex-1 py-3 text-xl font-bold text-ink"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                selectionColor={Colors.brand.primary}
              />
            </View>
          </Field>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Stock">
                <TextInput
                  className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-base font-bold text-ink"
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="number-pad"
                  selectionColor={Colors.brand.primary}
                />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="SKU">
                <TextInput
                  className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-base font-bold text-ink"
                  value={sku}
                  onChangeText={setSku}
                  autoCapitalize="none"
                  selectionColor={Colors.brand.primary}
                />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="Variants">
                <View className="border border-gray-200 rounded-xl bg-gray-100 px-3 py-3">
                  <Text className="text-base font-extrabold text-ink text-center">
                    {variantCount}
                  </Text>
                </View>
              </Field>
            </View>
          </View>
          <Field label="Description">
            <TextInput
              className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-[15px] text-ink min-h-[88px]"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              selectionColor={Colors.brand.primary}
              placeholder="Add a description…"
              placeholderTextColor={Colors.text.muted}
            />
          </Field>
          <CancelSaveRow onCancel={cancel} onSave={save} saving={saving} />
        </View>
      ) : (
        <View className="pr-10">
          <Text className="text-[20px] font-extrabold text-ink tracking-tighter leading-tight mb-1">
            {product.name}
          </Text>
          <Text className="text-[18px] font-extrabold text-ink tracking-tighter mb-4">
            {currencySymbol}
            {product.base_price}
          </Text>
          {product.compare_at_price ? (
            <Caption className="line-through text-gray-400 mb-4 -mt-2">
              Compare {currencySymbol}
              {product.compare_at_price}
            </Caption>
          ) : null}

          <View className="flex-row gap-3 mb-4">
            <InfoStat label="Stock" value={stockDisplay} />
            <InfoStat label="SKU" value={product.sku ?? "—"} />
            <InfoStat label="Variants" value={String(variantCount)} />
          </View>

          <SectionTitle className="mb-2">About</SectionTitle>
          {product.description ? (
            <Text className="text-[15px] text-gray-600 leading-6">
              {product.description}
            </Text>
          ) : (
            <Text className="text-[15px] text-gray-400">No description</Text>
          )}
        </View>
      )}
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text className="text-[12px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </Text>
      {children}
    </View>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-[16px] p-3 bg-gray-50 border border-gray-100">
      <Caption className="uppercase tracking-widest mb-1 text-gray-400 text-[10px]">
        {label}
      </Caption>
      <Text className="text-base font-extrabold text-ink" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
