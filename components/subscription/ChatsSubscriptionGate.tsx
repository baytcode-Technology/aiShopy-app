import { Heading, Muted } from "@/components/ui/Typography";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useAppTheme } from "@src/contexts/theme-context";
import {
  CHAT_GATE_FEATURES,
  type ChatGateIcon,
} from "@src/lib/subscription";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

type Props = {
  onViewPlans: () => void;
};

const GREEN = "#3EB056";
const WHATSAPP = "#25D366";
const TILE = 42;

const IG_WORD: { letter: string; color: string }[] = [
  { letter: "I", color: "#833AB4" },
  { letter: "n", color: "#9B3498" },
  { letter: "s", color: "#C13584" },
  { letter: "t", color: "#D62976" },
  { letter: "a", color: "#E1306C" },
  { letter: "g", color: "#F04B45" },
  { letter: "r", color: "#F56040" },
  { letter: "a", color: "#F77737" },
  { letter: "m", color: "#FCAF45" },
];

function WhatsAppMark() {
  return (
    <Svg width={TILE} height={TILE} viewBox="0 0 42 42">
      <Rect width="42" height="42" rx="13" fill={WHATSAPP} />
      <Path
        d="M21 10.5c-5.2 0-9.4 4-9.4 9 0 1.6.5 3.1 1.3 4.4l-1.2 4.2 4.3-1.1c1.2.7 2.6 1 4 1 5.2 0 9.4-4 9.4-9s-4.2-8.5-9.4-8.5z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      <Path d="M14.6 27.2 12.4 31.2 16.8 28.4Z" fill="#FFFFFF" />
      <Path
        d="M17.1 17.2c.2-.4.4-.4.6-.4h.6c.2 0 .4.1.5.4.2.5.6 1.5.7 1.6.1.1.1.3 0 .4-.1.2-.2.3-.3.4l-.3.3c-.1.1-.2.2-.1.4.1.2.6 1 1.2 1.5.8.7 1.5 1 1.7 1.1.2.1.3.1.4-.1.1-.1.5-.6.6-.8.1-.2.3-.2.5-.1.2.1 1.1.5 1.3.6.2.1.3.2.4.3.1.2.1.6-.1 1.1-.2.5-1 .9-1.3 1-.4.1-.8.1-1.2 0-.3-.1-.7-.2-1.2-.4-1.9-.8-3.2-2.4-3.7-3-.5-.6-1.2-1.7-1.2-2.6 0-1 .5-1.4.6-1.6.2-.2.4-.3.6-.3z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function InstagramMark() {
  return (
    <Svg width={TILE} height={TILE} viewBox="0 0 42 42">
      <Defs>
        <LinearGradient id="igTile" x1="4" y1="40" x2="40" y2="2">
          <Stop offset="0" stopColor="#FCAF45" />
          <Stop offset="0.35" stopColor="#F77737" />
          <Stop offset="0.62" stopColor="#C13584" />
          <Stop offset="1" stopColor="#833AB4" />
        </LinearGradient>
      </Defs>
      <Rect width="42" height="42" rx="13" fill="url(#igTile)" />
      <Rect
        x="12"
        y="12"
        width="18"
        height="18"
        rx="5.5"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        fill="none"
      />
      <Circle cx="21" cy="21" r="4.2" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <Circle cx="26.4" cy="15.6" r="1.25" fill="#FFFFFF" />
    </Svg>
  );
}

function ChartMark() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      <Path d="M3 22V14h4.2v8H3Z" fill="#8BE3A4" />
      <Path d="M10.2 22V9h4.2v13h-4.2Z" fill={GREEN} />
      <Path d="M17.4 22V4.5H21.6V22h-4.2Z" fill={WHATSAPP} />
      <Path d="M14.2 7.2 19.4 2.2l1.6 1.6-5.2 5-1.6-1.6Z" fill={WHATSAPP} />
      <Path d="M16.2 2.2h5.2V7h-2.1V4.3h-3.1V2.2Z" fill={WHATSAPP} />
    </Svg>
  );
}

function HeroBubble() {
  return (
    <Svg width={52} height={52} viewBox="0 0 52 52">
      <Defs>
        <LinearGradient id="heroBubble" x1="6" y1="4" x2="46" y2="48">
          <Stop offset="0" stopColor="#8BE3A4" />
          <Stop offset="0.45" stopColor="#3EB056" />
          <Stop offset="1" stopColor="#1B7A34" />
        </LinearGradient>
      </Defs>
      <Path
        d="M10 6h28a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H28l-6 8 1.5-8H10a8 8 0 0 1-8-8V14a8 8 0 0 1 8-8z"
        fill="url(#heroBubble)"
      />
      <Path
        d="M12 9.5h24a5 5 0 0 1 5 5"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="18" cy="22" r="3.1" fill="#FFFFFF" />
      <Circle cx="26" cy="22" r="3.1" fill="#FFFFFF" />
      <Circle cx="34" cy="22" r="3.1" fill="#FFFFFF" />
    </Svg>
  );
}

function FeatureIcon({ name, isDark }: { name: ChatGateIcon; isDark: boolean }) {
  if (name === "whatsapp") return <WhatsAppMark />;
  if (name === "instagram") return <InstagramMark />;
  if (name === "robot") {
    return (
      <View
        className="items-center justify-center"
        style={{
          width: TILE,
          height: TILE,
          borderRadius: 13,
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6",
        }}
      >
        <FontAwesome5
          name="robot"
          solid
          size={24}
          color={isDark ? "#E4E4E7" : "#3F3F46"}
        />
      </View>
    );
  }
  return (
    <View
      className="items-center justify-center"
      style={{
        width: TILE,
        height: TILE,
        borderRadius: 13,
        backgroundColor: isDark ? "rgba(37,211,102,0.14)" : "#E9F9EF",
      }}
    >
      <ChartMark />
    </View>
  );
}

export function ChatsSubscriptionGate({ onViewPlans }: Props) {
  const { isDark } = useAppTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="flex-grow justify-center px-5 pb-28 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <View className="relative w-full items-center">
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: 999,
            backgroundColor: isDark
              ? "rgba(20, 90, 40, 0.55)"
              : "rgba(62, 176, 86, 0.16)",
            top: -30,
            right: -70,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: 999,
            backgroundColor: isDark
              ? "rgba(62, 176, 86, 0.12)"
              : "rgba(62, 176, 86, 0.1)",
            top: 80,
            left: -80,
          }}
        />
        {isDark ? null : (
          <View
            pointerEvents="none"
            style={{ position: "absolute", top: 8, right: 8, width: 54, height: 36 }}
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <View
                key={index}
                style={{
                  position: "absolute",
                  width: 3,
                  height: 3,
                  borderRadius: 99,
                  backgroundColor: "rgba(62, 176, 86, 0.45)",
                  top: Math.floor(index / 4) * 12,
                  left: (index % 4) * 12,
                }}
              />
            ))}
          </View>
        )}

        <View
          className="w-full items-center rounded-[28px] px-5 pb-6"
          style={{
            marginTop: 28,
            paddingTop: 52,
            backgroundColor: isDark
              ? "rgba(12, 14, 13, 0.88)"
              : "rgba(255, 255, 255, 0.82)",
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(62, 176, 86, 0.35)"
              : "rgba(255, 255, 255, 0.95)",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -36,
              width: 132,
              height: 52,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: isDark
                ? "rgba(62, 176, 86, 0.45)"
                : "rgba(62, 176, 86, 0.35)",
              transform: [{ rotate: "-18deg" }],
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -18,
              width: 96,
              height: 96,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(62, 176, 86, 0.22)",
            }}
          />

          <View
            className="absolute items-center justify-center"
            style={{
              top: -32,
              width: 68,
              height: 68,
              borderRadius: 20,
              backgroundColor: isDark ? "#101412" : "rgba(255,255,255,0.92)",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(62, 176, 86, 0.7)"
                : "rgba(62, 176, 86, 0.35)",
              shadowColor: GREEN,
              shadowOpacity: isDark ? 0.45 : 0.2,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <HeroBubble />
          </View>

          <Heading className="text-center text-[22px] leading-7">
            Unlock <Text style={{ color: WHATSAPP }}>WhatsApp</Text> &{"\n"}
            <Text>
              {IG_WORD.map((part) => (
                <Text key={part.letter + part.color} style={{ color: part.color }}>
                  {part.letter}
                </Text>
              ))}
            </Text>{" "}
            Inbox
          </Heading>
          <Muted className="mt-3 text-center text-[15px] leading-6">
            Upgrade to Business to manage customer conversations, automate
            replies, and grow sales from chat.
          </Muted>

          <View className="mt-6 w-full gap-2.5">
            {CHAT_GATE_FEATURES.map((feature) => (
              <View
                key={feature.label}
                className="flex-row items-center gap-3 rounded-full px-4 py-3"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.92)",
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(228,228,231,0.95)",
                }}
              >
                <FeatureIcon name={feature.icon} isDark={isDark} />
                <Text className="flex-1 text-[14px] leading-5 text-ink">
                  {feature.label}
                </Text>
                <View
                  className="items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: WHATSAPP,
                  }}
                >
                  <FontAwesome5 name="check" solid size={16} color="#FFFFFF" />
                </View>
              </View>
            ))}
          </View>

          <Pressable
            onPress={onViewPlans}
            accessibilityRole="button"
            accessibilityLabel="View plans"
            className="mt-6 w-full flex-row items-center justify-center gap-2 rounded-full bg-brand-green py-4"
          >
            <Text className="text-[16px] font-bold text-white">View plans</Text>
            <Text className="text-[16px] font-bold text-white">→</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
