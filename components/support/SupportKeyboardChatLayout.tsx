import { ReactNode, useEffect, useRef } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
  type FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props<T = unknown> = {
  listRef?: React.RefObject<FlatList<T> | null>;
  children: ReactNode;
  composer: ReactNode;
  footer?: ReactNode;
};

export function SupportKeyboardChatLayout<T = unknown>({
  listRef,
  children,
  composer,
  footer,
}: Props<T>) {
  const insets = useSafeAreaInsets();
  const keyboardVisibleRef = useRef(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        keyboardVisibleRef.current = true;
        requestAnimationFrame(() => {
          listRef?.current?.scrollToEnd({ animated: true });
        });
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        keyboardVisibleRef.current = false;
      },
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [listRef]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      <View className="flex-1">{children}</View>
      {footer}
      <View
        className="bg-surface border-t border-gray-200"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        {composer}
      </View>
    </KeyboardAvoidingView>
  );
}
