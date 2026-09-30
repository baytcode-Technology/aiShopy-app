import { Button } from "@/components/ui/Button";
import { Caption, Muted } from "@/components/ui/Typography";
import {
  deleteCustomDomain,
  fetchCustomDomain,
  saveCustomDomain,
  verifyCustomDomain,
  type CustomDomainView,
} from "@src/api/stores";
import { getErrorMessage } from "@src/lib/api-error";
import { useStore } from "@src/contexts/store-context";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

function statusLabel(status: CustomDomainView["status"]): string {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "Waiting for DNS";
    case "failed":
      return "Needs attention";
    default:
      return "Not connected";
  }
}

export function CustomDomainPanel() {
  const { store, refreshStore } = useStore();
  const storeId = store?.id;
  const [domainInput, setDomainInput] = useState("");
  const [view, setView] = useState<CustomDomainView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomDomain(storeId);
      setView(data);
      if (data.custom_domain) setDomainInput(data.custom_domain);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load domain settings"));
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (fn: () => Promise<CustomDomainView>, success: string) => {
    if (!storeId) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fn();
      setView(data);
      if (data.custom_domain) setDomainInput(data.custom_domain);
      else setDomainInput("");
      setNotice(success);
      await refreshStore({ silent: true });
    } catch (err) {
      setError(getErrorMessage(err, "Domain update failed"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View className="px-5 py-4">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="px-5 pb-4 pt-0">
      {error ? (
        <View className="mb-3 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-[13px] text-red-700">{error}</Text>
        </View>
      ) : null}
      {notice ? (
        <View className="mb-3 rounded-xl bg-emerald-50 px-4 py-3">
          <Text className="text-[13px] text-emerald-800">{notice}</Text>
        </View>
      ) : null}

      <Muted className="mb-3 text-[13px]">
        Status: {statusLabel(view?.status ?? "none")}
      </Muted>

      {view?.status === "active" && view.custom_domain ? (
        <Muted className="mb-3 text-[13px] leading-5">
          Customers can open your store at https://{view.custom_domain}. Your
          AiShopy subdomain still works as a backup.
        </Muted>
      ) : (
        <>
          <Caption className="text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
            Your domain
          </Caption>
          <TextInput
            value={domainInput}
            onChangeText={setDomainInput}
            placeholder="shop.yourbrand.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            className="mb-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-ink"
          />
        </>
      )}

      {view?.custom_domain && view.status !== "active" ? (
        <View className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <Text className="mb-1 text-[13px] font-semibold text-ink">
            Add this DNS record
          </Text>
          <Muted className="text-[13px] leading-5">
            Type CNAME{"\n"}
            Host {view.cname_host}
            {"\n"}
            Value {view.cname_target}
            {"\n\n"}
            Then tap Verify. SSL is issued automatically after DNS is correct.
          </Muted>
        </View>
      ) : null}

      <View className="gap-2">
        {view?.status !== "active" ? (
          <Button
            label={view?.custom_domain ? "Save domain" : "Connect domain"}
            loading={busy}
            onPress={() =>
              run(
                () => saveCustomDomain(storeId!, domainInput.trim()),
                "Domain saved. Add the CNAME, then verify."
              )
            }
          />
        ) : null}
        {view?.custom_domain && view.status !== "active" ? (
          <Button
            label="Verify DNS"
            variant="outline"
            loading={busy}
            onPress={() =>
              run(() => verifyCustomDomain(storeId!), "Checked DNS")
            }
          />
        ) : null}
        {view?.custom_domain ? (
          <Button
            label="Remove custom domain"
            variant="ghost"
            loading={busy}
            onPress={() =>
              run(() => deleteCustomDomain(storeId!), "Custom domain removed")
            }
          />
        ) : null}
      </View>
    </View>
  );
}
