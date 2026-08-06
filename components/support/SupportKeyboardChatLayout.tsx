import { ReactNode, useEffect, useState } from "react";
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
  onKeyboardShow?: () => void;
  children: ReactNode;
  composer: ReactNode;
  footer?: ReactNode;
};

function ComposerBar({
  composer,
  paddingBottom,
}: {
  composer: ReactNode;
  paddingBottom: number;
}) {
  return (
    <View
      className="bg-surface border-t border-gray-200"
      style={{ paddingBottom }}
    >
      {composer}
    </View>
  );
}

export function SupportKeyboardChatLayout<T = unknown>({
  listRef,
  onKeyboardShow,
  children,
  composer,
  footer,
}: Props<T>) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      requestAnimationFrame(() => {
        if (onKeyboardShow) {
          onKeyboardShow();
        } else {
          listRef?.current?.scrollToEnd({ animated: true });
        }
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [listRef, onKeyboardShow]);

  const composerPaddingBottom =
    Platform.OS === "android" && keyboardHeight > 0
      ? Math.max(keyboardHeight - insets.bottom, 0) + 26
      : Math.max(insets.bottom, 26);

  if (Platform.OS === "android") {
    return (
      <View className="flex-1">
        <View className="flex-1">{children}</View>
        {footer}
        <ComposerBar
          composer={composer}
          paddingBottom={composerPaddingBottom}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior="padding"
      keyboardVerticalOffset={insets.top}
    >
      <View className="flex-1">{children}</View>
      {footer}
      <ComposerBar
        composer={composer}
        paddingBottom={Math.max(insets.bottom, 26)}
      />
    </KeyboardAvoidingView>
  );
}
