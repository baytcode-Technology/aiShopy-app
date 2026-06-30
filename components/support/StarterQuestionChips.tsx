import { Muted } from "@/components/ui/Typography";
import { SUPPORT_STARTER_QUESTIONS } from "@src/lib/support-starter-questions";
import Colors from "@src/theme/colors";
import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  onSelect: (question: string) => void;
  disabled?: boolean;
};

export function StarterQuestionChips({ onSelect, disabled }: Props) {
  return (
    <View className="px-3 pt-2 pb-1 gap-2">
      <Muted className="text-[13px] px-1">Quick questions</Muted>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-1"
      >
        {SUPPORT_STARTER_QUESTIONS.map((question) => (
          <Pressable
            key={question}
            disabled={disabled}
            onPress={() => onSelect(question)}
            className="rounded-full border border-brand-green/30 bg-[#E8F8EC] px-3.5 py-2"
            style={{ opacity: disabled ? 0.6 : 1 }}
          >
            <Text
              className="text-[13px] font-medium"
              style={{ color: Colors.brand.green }}
            >
              {question}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
