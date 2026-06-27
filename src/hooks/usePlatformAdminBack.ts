import { useStore } from "@src/contexts/store-context";
import { usePlatformAdmin } from "@src/hooks/usePlatformAdmin";
import { router, type Href } from "expo-router";
import { useCallback } from "react";

/** Back to Admin home when platform admin has no store; otherwise router.back(). */
export function usePlatformAdminBack() {
  const { store } = useStore();
  const { isPlatformAdmin } = usePlatformAdmin();

  return useCallback(() => {
    if (isPlatformAdmin && !store) {
      router.replace("/platform-admin" as Href);
      return;
    }
    router.back();
  }, [isPlatformAdmin, store]);
}
