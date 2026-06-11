import FontAwesome from "@expo/vector-icons/FontAwesome";
import { showSuccess } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import * as Clipboard from "expo-clipboard";
import { Linking, Pressable, Share, Text, View } from "react-native";

type Props = {
  /** Full URL with protocol, e.g. https://ghu.aishopy.io */
  url: string;
  /** Host only for display, e.g. ghu.aishopy.io */
  displayHost: string;
};

export function StorefrontUrlActions({ url, displayHost }: Props) {
  const openStorefront = () => {
    void Linking.openURL(url);
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(url);
    showSuccess("Store link copied");
  };

  const shareLink = async () => {
    try {
      await Share.share({
        message: `Visit my store: ${url}`,
        url,
        title: displayHost,
      });
    } catch {
      // User dismissed share sheet
    }
  };

  return (
    <View className="flex-row items-center mt-0 gap-2">
      <Pressable
        onPress={openStorefront}
        className="flex-1 min-w-0"
        hitSlop={4}
      >
        <Text
          className="text-[15px] font-semibold text-blue-500"
          numberOfLines={1}
        >
          {displayHost}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => void copyLink()}
        className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 items-center justify-center"
        accessibilityLabel="Copy store link"
        hitSlop={6}
      >
        <FontAwesome name="copy" size={14} color={Colors.brand.primary} />
      </Pressable>
      <Pressable
        onPress={() => void shareLink()}
        className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 items-center justify-center"
        accessibilityLabel="Share store link"
        hitSlop={6}
      >
        <FontAwesome name="share-alt" size={14} color={Colors.brand.primary} />
      </Pressable>
    </View>
  );
}
