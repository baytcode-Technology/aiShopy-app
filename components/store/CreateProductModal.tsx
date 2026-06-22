import { CategoryPicker } from "@/components/store/CategoryPicker";
import { FormModal } from "@/components/store/FormModal";
import {
  ProductImagePicker,
  type PickedImage,
} from "@/components/store/ProductImagePicker";
import { ProductStatusPicker } from "@/components/store/ProductStatusPicker";
import { ShopifyVariantEditor } from "@/components/store/ShopifyVariantEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createProduct } from "@src/api/products";
import { parseOptionalPrice } from "@src/lib/parse-optional-price";
import { uploadProductImages } from "@src/api/uploads";
import { showError, showSuccess } from "@src/lib/toast";
import type { GeneratedVariant, VariantOption } from "@src/lib/variant-options";
import {
  toCreateVariantPayload,
  uploadVariantImagesForCreate,
} from "@src/lib/variant-options";
import type { Category } from "@src/types/category";
import type { ProductStatus } from "@src/types/product";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LayoutChangeEvent, ScrollView } from "react-native";
import { View } from "react-native";

type Props = {
  visible: boolean;
  storeId: number;
  categories: Category[];
  initialCategoryId?: number;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateProductModal({
  visible,
  storeId,
  categories,
  initialCategoryId,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stockQty, setStockQty] = useState("0");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [status, setStatus] = useState<ProductStatus>("active");
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [variants, setVariants] = useState<GeneratedVariant[]>([]);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [thumbnailId, setThumbnailId] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [stockError, setStockError] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const fieldY = useRef<Record<string, number | undefined>>({});

  const registerFieldY = (key: string) => (e: LayoutChangeEvent) => {
    fieldY.current[key] = e.nativeEvent.layout.y;
  };

  const scrollToField = (key: string) => {
    const y = fieldY.current[key];
    if (typeof y !== "number") return;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
  };

  useEffect(() => {
    if (visible && initialCategoryId) {
      setCategoryId(initialCategoryId);
    }
  }, [visible, initialCategoryId]);

  const reset = () => {
    setName("");
    setBasePrice("");
    setCompareAtPrice("");
    setStockQty("0");
    setDescription("");
    setSku("");
    setCategoryId(null);
    setStatus("active");
    setVariantOptions([]);
    setVariants([]);
    setImages([]);
    setThumbnailId(null);
    setImageError("");
    setNameError("");
    setPriceError("");
    setStockError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const price = Number(basePrice);
    const stock = Number(stockQty);

    if (!trimmedName) {
      setNameError("This field is required");
      setPriceError("");
      setStockError("");
      scrollToField("name");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setPriceError(
        basePrice.trim() ? "Not a valid number" : "This field is required",
      );
      setNameError("");
      setStockError("");
      scrollToField("basePrice");
      return;
    }
    const compareNum = parseOptionalPrice(compareAtPrice);
    if (compareNum === undefined) {
      setPriceError("Compare at price is not valid");
      scrollToField("compareAtPrice");
      return;
    }
    if (variants.length === 0 && (!Number.isFinite(stock) || stock < 0)) {
      setStockError(
        stockQty.trim() ? "Not a valid number" : "This field is required",
      );
      setNameError("");
      setPriceError("");
      scrollToField("stockQty");
      return;
    }
    if (images.length === 0) {
      setImageError("At least one product image is required");
      scrollToField("images");
      return;
    }
    if (!thumbnailId) {
      setImageError("Select a thumbnail image");
      scrollToField("images");
      return;
    }

    setNameError("");
    setPriceError("");
    setStockError("");
    setImageError("");
    setLoading(true);

    try {
      const urls = await uploadProductImages(
        storeId,
        images.map((img) => ({ uri: img.uri, name: img.name, type: img.type })),
      );

      const thumbIndex = images.findIndex((img) => img.id === thumbnailId);
      const thumbnailUrl = urls[thumbIndex] ?? urls[0];
      if (!thumbnailUrl) {
        throw new Error("Thumbnail URL is required");
      }

      const hasVariants = variants.length > 0;

      const variantImageUrls = await uploadVariantImagesForCreate(
        storeId,
        variants,
        uploadProductImages,
      );

      await createProduct({
        store_id: storeId,
        name: trimmedName,
        base_price: price,
        compare_at_price: compareNum,
        stock_qty: hasVariants ? 0 : Number.isFinite(stock) ? stock : 0,
        track_inventory: hasVariants || stock > 0,
        description: description.trim() || undefined,
        sku: sku.trim() || undefined,
        category_id: categoryId ?? undefined,
        status,
        images: urls,
        thumbnail_url: thumbnailUrl,
        variants: variants.map((v, index) => ({
          ...toCreateVariantPayload(v, variantImageUrls.get(v.id)),
          sort_order: index,
        })),
      });
      reset();
      onCreated();
      onClose();
      showSuccess("Product created successfully");
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title="New product"
      onClose={handleClose}
      scrollViewRef={scrollViewRef}
      footer={
        <Button
          label="Create product"
          loading={loading}
          onPress={handleSubmit}
        />
      }
    >
      <FormImageSection onLayout={registerFieldY("images")}>
        <ProductImagePicker
          images={images}
          thumbnailId={thumbnailId}
          onChange={(nextImages, nextThumb) => {
            setImages(nextImages);
            setThumbnailId(nextThumb);
            if (nextImages.length > 0 && nextThumb) {
              setImageError("");
            }
          }}
          error={imageError}
        />
      </FormImageSection>
      <CategoryPicker
        categories={categories}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />
      <ProductStatusPicker value={status} onChange={setStatus} />
      <Input
        label="Product name *"
        value={name}
        onChangeText={setName}
        placeholder="Premium Headphones"
        error={nameError || undefined}
        containerOnLayout={registerFieldY("name")}
      />
      <Input
        label="Base price *"
        value={basePrice}
        onChangeText={setBasePrice}
        placeholder="299"
        keyboardType="decimal-pad"
        error={priceError || undefined}
        containerOnLayout={registerFieldY("basePrice")}
      />
      <Input
        label="Compare at price"
        value={compareAtPrice}
        onChangeText={setCompareAtPrice}
        placeholder="399 (optional)"
        keyboardType="decimal-pad"
        containerOnLayout={registerFieldY("compareAtPrice")}
      />
      {variants.length === 0 ? (
        <Input
          label="Stock quantity"
          value={stockQty}
          onChangeText={setStockQty}
          placeholder="0"
          keyboardType="number-pad"
          error={stockError || undefined}
          containerOnLayout={registerFieldY("stockQty")}
        />
      ) : null}
      <Input
        label="SKU"
        value={sku}
        onChangeText={setSku}
        placeholder="SKU-001"
        autoCapitalize="none"
      />
      <ShopifyVariantEditor
        options={variantOptions}
        variants={variants}
        onChange={(options, nextVariants) => {
          setVariantOptions(options);
          setVariants(nextVariants);
        }}
      />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Product details"
        multiline
        numberOfLines={3}
        inputClassName="min-h-20"
        style={{ textAlignVertical: "top" }}
      />
    </FormModal>
  );
}

function FormImageSection({
  onLayout,
  children,
}: {
  onLayout: (e: LayoutChangeEvent) => void;
  children: ReactNode;
}) {
  return <View onLayout={onLayout}>{children}</View>;
}
