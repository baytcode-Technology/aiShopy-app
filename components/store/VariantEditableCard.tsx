import { PriceDisplayRow } from "@/components/store/PriceDisplayRow";
import { ProductStatusBadge } from "@/components/store/ProductStatusBadge";
import { VariantImageActionsModal } from "@/components/store/VariantImageActionsModal";
import { VariantImagePreviewModal } from "@/components/store/VariantImagePreviewModal";
import {
  pickVariantImageFromGallery,
  VariantImageTile,
  type PickedVariantImage,
} from "@/components/store/VariantImageTile";
import { VariantEditModal } from "@/components/store/VariantEditModal";
import { uploadProductImages } from "@src/api/uploads";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";
import { Caption } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { deleteProductVariant, updateProductVariant } from "@src/api/products";
import {
  getVariantAvailabilityLabel,
  getVariantCardInventoryFlags,
} from "@src/lib/product-inventory";
import { showError, showSuccess } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import type { Product, ProductVariant } from "@src/types/product";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

type Props = {
  variant: ProductVariant;
  product: Product;
  currencySymbol: string;
  onUpdated: (variant: ProductVariant) => void;
  onDeleted?: (variantId: number) => void;
};

export function VariantEditableCard({
  variant,
  product,
  currencySymbol,
  onUpdated,
  onDeleted,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [optimisticActive, setOptimisticActive] = useState<boolean | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageActionsOpen, setImageActionsOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const displayActive = optimisticActive ?? variant.is_active;
  const status = displayActive ? "active" : "unlisted";
  const cardLocked = busy || deleteLoading || imageBusy;

  const unitPrice = Number(product.base_price) + Number(variant.price_delta);
  const availabilityLabel = getVariantAvailabilityLabel(product, variant);
  const { showSoldOut, showNonInventory } = getVariantCardInventoryFlags(
    product,
    variant,
  );
  const optionLabels = Object.entries(variant.options ?? {})
    .map(([k, val]) => `${k}: ${val}`)
    .join(" · ");

  const toggleActive = async () => {
    if (cardLocked) return;
    const next = !variant.is_active;
    setBusy(true);
    setOptimisticActive(next);
    try {
      const res = await updateProductVariant(product.id, variant.id, {
        is_active: next,
      });
      onUpdated(res.data.variant);
      showSuccess(next ? "Variant is active" : "Variant is unlisted");
    } catch (e) {
      setOptimisticActive(null);
      showError(e, "Could not update variant status");
    } finally {
      setOptimisticActive(null);
      setBusy(false);
    }
  };

  const handlePickImage = async (file: PickedVariantImage) => {
    if (cardLocked) return;
    setImageBusy(true);
    try {
      const urls = await uploadProductImages(product.store_id, [file]);
      const image_url = urls[0];
      if (!image_url) throw new Error("Upload failed");
      const res = await updateProductVariant(product.id, variant.id, {
        image_url,
      });
      onUpdated(res.data.variant);
      showSuccess("Variant image updated");
    } catch (e) {
      showError(e, "Could not update variant image");
    } finally {
      setImageBusy(false);
    }
  };

  const handleReplaceImage = async () => {
    if (cardLocked) return;
    const file = await pickVariantImageFromGallery();
    if (file) await handlePickImage(file);
  };

  const handleRemoveImage = async () => {
    if (cardLocked) return;
    setImageBusy(true);
    try {
      const res = await updateProductVariant(product.id, variant.id, {
        image_url: null,
      });
      onUpdated(res.data.variant);
      showSuccess("Variant image removed");
    } catch (e) {
      showError(e, "Could not remove variant image");
    } finally {
      setImageBusy(false);
    }
  };

  const runDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteProductVariant(product.id, variant.id);
      setDeleteOpen(false);
      onDeleted?.(variant.id);
      showSuccess("Variant deleted");
    } catch (e) {
      showError(e, "Could not delete variant");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Card className="relative mt-3 p-4 overflow-hidden">
        {busy || imageBusy ? (
          <View
            className="absolute inset-0 z-20 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.62)" }}
            pointerEvents="auto"
          >
            <ActivityIndicator size="small" color={Colors.brand.primary} />
          </View>
        ) : null}

        <View className="flex-row items-start gap-2.5 mb-2">
          <VariantImageTile
            imageUri={variant.image_url}
            size={44}
            loading={imageBusy}
            disabled={cardLocked}
            onPick={handlePickImage}
            onImagePress={
              variant.image_url ? () => setImageActionsOpen(true) : undefined
            }
          />
          <Text className="flex-1 text-base font-extrabold text-ink pr-2 pt-0.5">
            {variant.name}
          </Text>
          <View className="items-end shrink-0 gap-1">
            <View className="flex-row items-center gap-1.5">
              <ProductStatusBadge status={status} />
              <IconButton
                size="sm"
                onPress={toggleActive}
                disabled={cardLocked}
                accessibilityLabel={
                  displayActive ? "Disable variant" : "Enable variant"
                }
              >
                <FontAwesome
                  name={displayActive ? "toggle-on" : "toggle-off"}
                  size={20}
                  color={
                    displayActive ? Colors.brand.primary : Colors.text.muted
                  }
                />
              </IconButton>
            </View>
            {showSoldOut || showNonInventory ? (
              <View className="items-end gap-0.5">
                {showSoldOut ? (
                  <Text className="text-[11px] font-bold text-[#991B1B]">
                    Sold out
                  </Text>
                ) : null}
                {showNonInventory ? (
                  <Text
                    className="text-[11px] font-bold"
                    style={{ color: Colors.brand.green }}
                  >
                    Non inventory
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
        {optionLabels ? (
          <Caption className="mb-3">{optionLabels}</Caption>
        ) : null}

        <View className="flex-row flex-wrap items-center gap-3 pr-[4.75rem]">
          <PriceDisplayRow
            currencySymbol={currencySymbol}
            price={unitPrice}
            compareAtPrice={variant.compare_at_price}
          />
          {availabilityLabel ? (
            <Text
              className={`text-[13px] font-bold ${
                availabilityLabel.tone === "danger"
                  ? "text-[#991B1B]"
                  : "text-gray-600"
              }`}
            >
              {availabilityLabel.text}
            </Text>
          ) : null}
        </View>

        <View className="absolute bottom-3 right-3 flex-row items-center gap-2">
          <IconButton
            size="sm"
            onPress={() => setEditOpen(true)}
            disabled={cardLocked}
            accessibilityLabel="Edit variant"
          >
            <FontAwesome name="pencil" size={14} color={Colors.brand.primary} />
          </IconButton>
          <IconButton
            size="sm"
            onPress={() => setDeleteOpen(true)}
            disabled={cardLocked}
            accessibilityLabel="Delete variant"
          >
            <FontAwesome name="trash-o" size={14} color="#EF4444" />
          </IconButton>
        </View>
      </Card>

      <VariantImageActionsModal
        visible={imageActionsOpen}
        onClose={() => setImageActionsOpen(false)}
        onView={() => setImagePreviewOpen(true)}
        onReplace={handleReplaceImage}
        onRemove={handleRemoveImage}
      />

      <VariantImagePreviewModal
        visible={imagePreviewOpen}
        imageUri={variant.image_url}
        title={variant.name}
        onClose={() => setImagePreviewOpen(false)}
      />

      <VariantEditModal
        visible={editOpen}
        variant={variant}
        product={product}
        currencySymbol={currencySymbol}
        onClose={() => setEditOpen(false)}
        onUpdated={onUpdated}
      />

      <ConfirmDialog
        visible={deleteOpen}
        title="Delete variant"
        message={`Remove "${variant.name}" from this product? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        onCancel={() => {
          if (!deleteLoading) setDeleteOpen(false);
        }}
        onConfirm={runDelete}
      />
    </>
  );
}
