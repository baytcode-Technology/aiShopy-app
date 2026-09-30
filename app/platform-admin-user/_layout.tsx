import { Stack } from "expo-router";
import Colors from "@src/theme/colors";

export default function PlatformAdminUserLayout() {
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
