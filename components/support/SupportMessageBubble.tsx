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
