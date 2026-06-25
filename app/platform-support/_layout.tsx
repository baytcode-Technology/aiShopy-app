import { Stack } from "expo-router";
import Colors from "@src/theme/colors";

export default function PlatformSupportLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg.secondary },
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
