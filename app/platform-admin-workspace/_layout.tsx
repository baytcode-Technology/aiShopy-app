import { AdminWorkspaceTabBar } from "@/components/admin/AdminWorkspaceTabBar";
import { Tabs } from "expo-router";

export default function PlatformAdminWorkspaceLayout() {
  return (
    <Tabs
      initialRouteName="support"
      tabBar={(props) => <AdminWorkspaceTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="support" options={{ title: "Inbox" }} />
      <Tabs.Screen name="users" options={{ title: "Users" }} />
    </Tabs>
  );
}
