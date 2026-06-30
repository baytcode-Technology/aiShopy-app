import { useStore } from "@src/contexts/store-context";
import { usePlatformAdmin } from "@src/hooks/usePlatformAdmin";
import { router, type Href } from "expo-router";
import { useCallback } from "react";

/** Prefer stack back; fall back to Admin home when platform admin has no store. */
export function usePlatformAdminBack(fallbackHref: Href = "/platform-admin") {
  const { store } = useStore();
  const { isPlatformAdmin } = usePlatformAdmin();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (isPlatformAdmin && !store) {
      router.replace(fallbackHref);
      return;
    }
    router.back();
  }, [isPlatformAdmin, store, fallbackHref]);
}
