import { DetailSection } from "@/components/store/detail/DetailSection";
import { VariantEditableCard } from "@/components/store/VariantEditableCard";
import { Muted, SectionTitle } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@src/theme/colors";
import type { Product, ProductVariant } from "@src/types/product";
import { useState } from "react";
import { Pressable, View } from "react-native";

type Props = {
  product: Product;
  variants: ProductVariant[];
  currencySymbol: string;
  onVariantUpdated: (variant: ProductVariant) => void;
  onVariantDeleted: (variantId: number) => void;
};

export function ProductVariantsSection({
  product,
  variants,
  currencySymbol,
  onVariantUpdated,
  onVariantDeleted,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  if (variants.length === 0) {
    return (
      <DetailSection className="p-3.5">
        <SectionTitle className="mb-1 text-[13px]">Variants</SectionTitle>
        <Muted className="text-[13px]">No variants — single SKU product.</Muted>
      </DetailSection>
    );
  }

  return (
    <DetailSection>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center justify-between px-3.5 py-2.5 active:opacity-90"
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <SectionTitle className="mb-0 text-[13px]">
          Variants · {variants.length}
        </SectionTitle>
        <FontAwesome
          name={expanded ? "chevron-down" : "chevron-right"}
          size={13}
          color={Colors.brand.primary}
        />
      </Pressable>

      {expanded ? (
        <View className="px-3.5 pb-3 bg-gray-100 border-t border-gray-200">
          {variants.map((v) => (
            <VariantEditableCard
              key={v.id}
              variant={v}
              product={product}
              currencySymbol={currencySymbol}
              onUpdated={onVariantUpdated}
              onDeleted={onVariantDeleted}
            />
          ))}
        </View>
      ) : null}
    </DetailSection>
  );
}
