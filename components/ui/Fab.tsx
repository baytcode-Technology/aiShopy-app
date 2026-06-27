import FontAwesome from "@expo/vector-icons/FontAwesome";
import { UnreadCountBadge } from "@/components/ui/UnreadCountBadge";
import { cn } from "@src/lib/cn";
import { shadows } from "@src/lib/shadows";
import Colors from "@src/theme/colors";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type PressableProps } from "react-native";

type FabVariant = "default" | "brand";

type Props = Omit<PressableProps, "style"> & {
  className?: string;
  children?: ReactNode;
  iconSize?: number;
  variant?: FabVariant;
  badgeCount?: number;
};

/** Floating action — default: ink circle; brand: logo-green circle. */
export function Fab({
  className,
  children,
  iconSize = 22,
  variant = "default",
  badgeCount,
  ...props
}: Props) {
  const isBrand = variant === "brand";

  return (
    <View
      className={cn("absolute right-5 bottom-6 z-10", className)}
      pointerEvents="box-none"
    >
      <View style={styles.wrap}>
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
        {badgeCount != null && badgeCount > 0 ? (
          <View style={styles.badgeWrap} pointerEvents="none">
            <UnreadCountBadge count={badgeCount} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    width: 60,
    height: 60,
  },
  badgeWrap: {
    position: "absolute",
    top: -6,
    right: -10,
    zIndex: 10,
    elevation: 12,
  },
});

/** Alias for semantic naming in catalog screens. */
export const FloatingButton = Fab;
