import FontAwesome from "@expo/vector-icons/FontAwesome";
import { cn } from "@src/lib/cn";
import { shadows } from "@src/lib/shadows";
import Colors from "@src/theme/colors";
import type { ReactNode } from "react";
import { Pressable, View, type PressableProps } from "react-native";

type FabVariant = "default" | "brand";

type Props = Omit<PressableProps, "style"> & {
  className?: string;
  children?: ReactNode;
  iconSize?: number;
  variant?: FabVariant;
};

/** Floating action — default: ink circle; brand: logo-green circle. */
export function Fab({
  className,
  children,
  iconSize = 22,
  variant = "default",
  ...props
}: Props) {
  const isBrand = variant === "brand";

  return (
    <View
      className={cn("absolute right-5 bottom-6 z-10", className)}
      pointerEvents="box-none"
    >
      <Pressable accessibilityRole="button" {...props}>
        {({ pressed }) => (
          <View
            className={cn(
              "w-[60px] h-[60px] rounded-full items-center justify-center border",
              isBrand
                ? "bg-brand-green border-brand-green"
                : "bg-brand-primary border-brand-primary",
            )}
            style={[
              shadows.lg,
              pressed
                ? { opacity: 0.92, transform: [{ scale: 0.96 }] }
                : undefined,
            ]}
          >
            {children ?? (
              <FontAwesome
                name="plus"
                size={iconSize}
                color={Colors.brand.onPrimary}
              />
            )}
          </View>
        )}
      </Pressable>
    </View>
  );
}

/** Alias for semantic naming in catalog screens. */
export const FloatingButton = Fab;
