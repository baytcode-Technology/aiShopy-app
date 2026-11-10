import { Caption } from "@/components/ui/Typography";
import { cn } from "@src/lib/cn";
import { FormattedMessageText } from "@src/lib/parse-inline-markdown";
import type { SupportMessage } from "@src/types/support";
import { Text, View } from "react-native";

type Props = {
  message: SupportMessage;
  viewer?: "owner" | "admin";
};

export function SupportMessageBubble({ message, viewer = "owner" }: Props) {
  const isUser = message.role === "user";
  const isAdmin = message.role === "admin";
  const isSystem = message.role === "system";
  const mine =
    viewer === "admin"
      ? message.role === "admin" || message.role === "assistant"
      : isUser;

  if (isSystem) {
    return (
      <View className="mb-3 w-full px-2">
        <View className="rounded-full bg-gray-100 border border-gray-200 px-4 py-2 self-center max-w-[95%]">
          <FormattedMessageText
            text={message.content}
            className="text-[12px] text-gray-600 text-center leading-4"
          />
        </View>
        <Caption className="text-center text-gray-400 mt-1">{message.time}</Caption>
      </View>
    );
  }

  return (
    <View
      className={cn("mb-3 max-w-[82%]", mine ? "self-end" : "self-start")}
    >
      {isAdmin ? (
        <Caption
          className={cn(
            "text-[10px] uppercase tracking-wider text-brand-green mb-1",
            mine ? "mr-1 text-right" : "ml-1",
          )}
        >
          AiShopy team
        </Caption>
      ) : null}
      <View
        className={cn(
          "rounded-2xl px-3.5 py-2.5 gap-1",
          mine ? "bg-brand-green" : "bg-surface border border-gray-200",
        )}
      >
        {isUser ? (
          <Text
            className={cn(
              "text-[15px] leading-[21px]",
              mine ? "text-brand-on-primary" : "text-ink",
            )}
          >
            {message.content}
          </Text>
        ) : (
          <FormattedMessageText
            text={message.content}
            className={cn(
              "text-[15px] leading-[21px]",
              mine ? "text-brand-on-primary" : "text-ink",
            )}
          />
        )}
        <Caption className="self-end text-gray-400">{message.time}</Caption>
      </View>
    </View>
  );
}
