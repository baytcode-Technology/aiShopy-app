import { AppLogo } from "@/components/brand/AppLogo";
import { AnimatedFadeIn } from "@/components/ui/AnimatedFadeIn";
import { Muted } from "@/components/ui/Typography";
import { useAuth } from "@src/contexts/auth-context";
import { useStore } from "@src/contexts/store-context";
import { getErrorMessage } from "@src/lib/api-error";
import { showError } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import { router, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function StoreCheckScreen() {
  const { isAuthenticated } = useAuth();
  const { refreshStore } = useStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { hasStore } = await refreshStore();
        if (cancelled) return;

        if (hasStore) {
          router.replace("/(store)/chats" as Href);
        } else {
          router.replace("/create-store");
        }
      } catch (e) {
        if (cancelled) return;
        showError(e, getErrorMessage(e, "Could not load your store"));
        router.replace("/(auth)/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshStore]);

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 gap-6 px-8">
      <AnimatedFadeIn className="items-center">
        <AppLogo variant="wordmark" align="center" className="mb-8" />
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Muted className="font-semibold tracking-wide mt-5 text-gray-500">
          Preparing your workspace…
        </Muted>
      </AnimatedFadeIn>
    </View>
  );
}
