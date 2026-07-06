import { AppLogo } from "@/components/brand/AppLogo";
import { StoreTabBar } from "@/components/navigation/StoreTabBar";
import { useAuth } from "@src/contexts/auth-context";
import { StoreUnreadProvider } from "@src/contexts/store-unread-context";
import { useStore } from "@src/contexts/store-context";
import Colors from "@src/theme/colors";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

export default function StoreLayout() {
  const { isLoading, isAuthenticated } = useAuth();
  const { store, isLoading: storeLoading, refreshStore } = useStore();
  const didInitialRefreshRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || didInitialRefreshRef.current) return;
    didInitialRefreshRef.current = true;
    void refreshStore({ silent: Boolean(store?.id) });
  }, [isAuthenticated, refreshStore, store?.id]);

  if (isLoading || (storeLoading && !store)) {
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
    <StoreUnreadProvider>
      <Tabs
        backBehavior="none"
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
    </StoreUnreadProvider>
  );
}
