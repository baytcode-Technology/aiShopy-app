import { Text, View } from "react-native";
import type { SupportConversation } from "@src/types/support";

type Props = {
  conversation: SupportConversation | null;
};

/** Only shown while a ticket is open (escalated). */
export function SupportStatusStrip({ conversation }: Props) {
  if (!conversation || conversation.status !== "escalated") return null;

  const code = conversation.ticket_code;
  let label = code ? `${code} · Ticket raised` : "Ticket raised";

  if (conversation.reply_mode === "manual") {
    label = code ? `${code} · Support team responding` : "Support team responding";
  }

  return (
    <View
      className="w-full px-4 py-2 border-b bg-[#E8F8EC] border-brand-green/20"
      style={{ minHeight: 36 }}
    >
      <Text
        className="text-center text-[12px] font-semibold text-brand-green"
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
