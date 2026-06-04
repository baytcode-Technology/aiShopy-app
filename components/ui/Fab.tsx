import FontAwesome from "@expo/vector-icons/FontAwesome";
import { cn } from "@src/lib/cn";
import { shadows } from "@src/lib/shadows";
import Colors from "@src/theme/colors";
import type { ReactNode } from "react";
import { Pressable, View, type PressableProps } from "react-native";

type Props = Omit<PressableProps, "style"> & {
  className?: string;
  children?: ReactNode;
  iconSize?: number;
};

/** Floating action — white circle, logo-green plus icon. */
export function Fab({ className, children, iconSize = 22, ...props }: Props) {
  return (
    <View
      className={cn("absolute right-5 bottom-6 z-10", className)}
      pointerEvents="box-none"
    >
      <Pressable accessibilityRole="button" {...props}>
        {({ pressed }) => (
          <View
            className="w-[60px] h-[60px] rounded-full bg-brand-primary items-center justify-center border border-brand-primary"
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
