import { fetchSupportAdminSummary } from "@src/api/support";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import type { SupportAdminSummary } from "@src/types/support";

const POLL_MS = 5000;

export function useSupportAdminSummary(enabled: boolean) {
  const [summary, setSummary] = useState<SupportAdminSummary>({
    escalated_count: 0,
    unread_messages: 0,
    awaiting_manual_count: 0,
  });

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetchSupportAdminSummary();
      setSummary(res.data);
    } catch {
      // Keep last known counts.
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setSummary({
        escalated_count: 0,
        unread_messages: 0,
        awaiting_manual_count: 0,
      });
      return;
    }

    void refresh();
    const interval = setInterval(() => void refresh(), POLL_MS);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [enabled, refresh]);

  return { summary, refresh };
}
