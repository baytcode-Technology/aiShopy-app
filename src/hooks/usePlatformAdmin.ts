import { fetchSupportAdminStatus } from "@src/api/support";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function usePlatformAdmin() {
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const refresh = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetchSupportAdminStatus();
      setIsPlatformAdmin(res.data.isAdmin);
    } catch {
      setIsPlatformAdmin(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { isPlatformAdmin, isChecking, refresh };
}
