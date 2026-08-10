import { ReactNode, useEffect } from "react";
import { Keyboard, Platform, View, type FlatList } from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function closedComposerPadding(insetsBottom: number): number {
  if (Platform.OS !== "android") {
    return Math.max(insetsBottom, 8);
  }
  // Gesture nav usually reports a bottom inset; 3-button nav often reports 0.
  if (insetsBottom > 0) {
    return Math.max(insetsBottom, 12);
  }
  return 48;
}

type Props<T = unknown> = {
  listRef?: React.RefObject<FlatList<T> | null>;
  onKeyboardShow?: () => void;
  children: ReactNode;
  composer: ReactNode;
  footer?: ReactNode;
};

export function SupportKeyboardChatLayout<T = unknown>({
  listRef,
  onKeyboardShow,
  children,
  composer,
  footer,
}: Props<T>) {
  const insets = useSafeAreaInsets();
  const closedPadding = closedComposerPadding(insets.bottom);
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });

  const composerStyle = useAnimatedStyle(() => {
    const kbHeight = keyboard.height.value;
    const isKeyboardOpen = kbHeight > 0;

    return {
      // Only lift with the keyboard while it is open — leave open behavior as-is.
      transform: [{ translateY: isKeyboardOpen ? -kbHeight : 0 }],
      // When the keyboard is closed, pad above the system nav bar (3-button or gesture).
      paddingBottom: isKeyboardOpen ? 0 : closedPadding,
    };
  });

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const showSub = Keyboard.addListener(showEvent, () => {
      requestAnimationFrame(() => {
        if (onKeyboardShow) {
          onKeyboardShow();
        } else {
          listRef?.current?.scrollToEnd({ animated: true });
        }
      });
    });

    return () => {
      showSub.remove();
    };
  }, [listRef, onKeyboardShow]);

  return (
    <View className="flex-1">
      <View className="flex-1">{children}</View>
      {footer}
      <Animated.View
        style={composerStyle}
        className="bg-surface border-t border-gray-200"
      >
        {composer}
      </Animated.View>
    </View>
  );
}
