import { Caption } from "@/components/ui/Typography";
import { cn } from "@src/lib/cn";
import type { SupportMessage } from "@src/types/support";
import { Text, View } from "react-native";

type Props = {
  message: SupportMessage;
};

export function SupportMessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const isAdmin = message.role === "admin";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <View className="mb-3 w-full px-2">
        <View className="rounded-full bg-gray-100 border border-gray-200 px-4 py-2 self-center max-w-[95%]">
          <Text className="text-[12px] text-gray-600 text-center leading-4">
            {message.content}
          </Text>
        </View>
        <Caption className="text-center text-gray-400 mt-1">{message.time}</Caption>
      </View>
    );
  }

  return (
    <View
      className={cn("mb-3 max-w-[82%]", isUser ? "self-end" : "self-start")}
    >
      {isAdmin ? (
        <Caption className="text-[10px] uppercase tracking-wider text-brand-green mb-1 ml-1">
          AiShopy team
        </Caption>
      ) : null}
      <View
        className={cn(
          "rounded-2xl px-3.5 py-2.5 gap-1",
          isUser
            ? "bg-brand-green"
            : "bg-surface border border-gray-200",
        )}
      >
        <Text
          className={cn(
            "text-[15px] leading-[21px]",
            isUser ? "text-brand-on-primary" : "text-ink",
          )}
        >
          {message.content}
        </Text>
        <Caption className="self-end text-gray-400">{message.time}</Caption>
      </View>
    </View>
  );
}
