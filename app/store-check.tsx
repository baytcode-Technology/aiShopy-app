import { AppLogo } from "@/components/brand/AppLogo";
import { AnimatedFadeIn } from "@/components/ui/AnimatedFadeIn";
import { Button } from "@/components/ui/Button";
import { Muted } from "@/components/ui/Typography";
import { useAuth } from "@src/contexts/auth-context";
import { useStore } from "@src/contexts/store-context";
import { fetchSupportAdminStatus } from "@src/api/support";
import { getErrorMessage } from "@src/lib/api-error";
import Colors from "@src/theme/colors";
import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function StoreCheckScreen() {
  const { isAuthenticated } = useAuth();
  const { refreshStores, switchStore } = useStore();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const hasRoutedRef = useRef(false);
  const isRunningRef = useRef(false);
  const refreshStoresRef = useRef(refreshStores);
  const switchStoreRef = useRef(switchStore);

  refreshStoresRef.current = refreshStores;
  switchStoreRef.current = switchStore;

  useEffect(() => {
    hasRoutedRef.current = false;
    isRunningRef.current = false;
  }, [retryKey]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    if (hasRoutedRef.current || isRunningRef.current) return;
    isRunningRef.current = true;

    let cancelled = false;

    void (async () => {
      try {
        setLoadError(null);
        const [list, adminRes] = await Promise.all([
          refreshStoresRef.current(),
          fetchSupportAdminStatus().catch(() => ({
            data: { isAdmin: false as boolean },
          })),
        ]);

        if (cancelled || hasRoutedRef.current) return;

        const isAdmin = adminRes.data.isAdmin;
        hasRoutedRef.current = true;

        if (list.length === 0) {
          if (isAdmin) {
            router.replace("/platform-admin" as Href);
          } else {
            router.replace("/create-store");
          }
          return;
        }

        if (list.length === 1) {
          await switchStoreRef.current(list[0].store.id);
          router.replace("/(store)/chats" as Href);
          return;
        }

        router.replace("/select-store" as Href);
      } catch (e) {
        if (cancelled) return;
        hasRoutedRef.current = false;
        setLoadError(getErrorMessage(e, "Could not load your store"));
      } finally {
        isRunningRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, retryKey]);

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 gap-6 px-8">
      <AnimatedFadeIn className="items-center">
        <AppLogo variant="wordmark" align="center" className="mb-8" />
        {loadError ? (
          <View className="items-center gap-4 w-full max-w-sm">
            <Muted className="text-center text-gray-600">{loadError}</Muted>
            <Button
              label="Try again"
              onPress={() => setRetryKey((key) => key + 1)}
            />
          </View>
        ) : (
          <>
            <ActivityIndicator size="large" color={Colors.brand.primary} />
            <Muted className="font-semibold tracking-wide mt-5 text-gray-500">
              Preparing your workspace…
            </Muted>
          </>
        )}
      </AnimatedFadeIn>
    </View>
  );
}
