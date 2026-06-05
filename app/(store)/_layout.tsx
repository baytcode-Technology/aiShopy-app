import { AppLogo } from "@/components/brand/AppLogo";
import { StoreTabBar } from "@/components/navigation/StoreTabBar";
import { useAuth } from "@src/contexts/auth-context";
import { ChatSocketProvider } from "@src/contexts/chat-socket-context";
import { useStore } from "@src/contexts/store-context";
import Colors from "@src/theme/colors";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function StoreLayout() {
  const { isLoading, isAuthenticated } = useAuth();
  const { store, isLoading: storeLoading } = useStore();

  if (isLoading || storeLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface gap-6">
        <AppLogo variant="wordmark" align="center" className="mb-6" />
        <ActivityIndicator color={Colors.brand.primary} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!store) {
    return <Redirect href="/store-check" />;
  }

  return (
    <ChatSocketProvider>
      <Tabs
        tabBar={(props) => <StoreTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="chats" options={{ title: "Chats" }} />
        <Tabs.Screen name="products" options={{ title: "Products" }} />
        <Tabs.Screen name="orders" options={{ title: "Orders" }} />
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      </Tabs>
    </ChatSocketProvider>
  );
}
