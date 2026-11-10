import { Button } from "@/components/ui/Button";
import { Caption, Muted } from "@/components/ui/Typography";
import {
  deleteCustomDomain,
  fetchCustomDomain,
  saveCustomDomain,
  setPublicLinkHost,
  verifyCustomDomain,
  type CustomDomainStatus,
  type CustomDomainView,
} from "@src/api/stores";
import { getErrorMessage } from "@src/lib/api-error";
import { useStore } from "@src/contexts/store-context";
import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-xl border border-gray-200 bg-surface px-3 py-2.5">
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </Text>
        <Text className="font-mono text-[14px] font-semibold text-ink" numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Pressable
        className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5"
        onPress={() => {
          void Clipboard.setStringAsync(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
      >
        <Text className="text-[12px] font-semibold text-ink">{copied ? "Copied" : "Copy"}</Text>
      </Pressable>
    </View>
  );
}

function DomainSteps({
  dnsType,
  dnsName,
  dnsValue,
}: {
  dnsType: string;
  dnsName: string;
  dnsValue: string;
}) {
  const showParked = dnsType === "A" && dnsName === "@";
  const steps = [
    "Open the place where you bought the domain.",
    ...(showParked ? ["Delete the row that says A, @, Parked. Leave every other row."] : []),
    "Add this record if it is not already there.",
    "Come back here and tap Verify.",
  ];
  return (
    <View className="mb-3 rounded-2xl border border-gray-200 bg-gray-100 px-4 py-4">
      {steps.map((text, index) => (
        <View key={text} className={`flex-row gap-3 ${index > 0 ? "mt-3" : ""}`}>
          <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-surface">
            <Text className="text-[11px] font-semibold text-ink">{index + 1}</Text>
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[13px] leading-5 text-ink">{text}</Text>
            {text.startsWith("Add this record") ? (
              <View className="mt-2 gap-2">
                <CopyRow label="Type" value={dnsType} />
                <CopyRow label="Name" value={dnsName} />
                <CopyRow label="Value" value={dnsValue} />
                <Muted className="text-[12px] leading-5">Leave TTL as it is.</Muted>
              </View>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const STEPS = ["Enter", "Save", "DNS", "Active"] as const;

type BusyAction = "save" | "verify" | "remove" | "link";

function statusLabel(status: CustomDomainStatus | undefined): string {
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

function statusChipClass(status: CustomDomainStatus | undefined): string {
  switch (status) {
    case "active":
      return "bg-success-bg border-success-border";
    case "pending":
      return "bg-warning-bg border-gray-200";
    case "failed":
      return "bg-danger-bg border-danger-border";
    default:
      return "bg-gray-100 border-gray-200";
  }
}

function statusTextClass(status: CustomDomainStatus | undefined): string {
  switch (status) {
    case "active":
      return "text-success";
    case "pending":
      return "text-warning";
    case "failed":
      return "text-danger";
    default:
      return "text-gray-600";
  }
}

function currentStepIndex(view: CustomDomainView | null, domainInput: string): number {
  if (view?.status === "active") return 3;
  if (!view?.custom_domain) return domainInput.trim() ? 1 : 0;
  return 2;
}

export function CustomDomainPanel() {
  const { store, refreshStore } = useStore();
  const storeId = store?.id;
  const [domainInput, setDomainInput] = useState("");
  const [view, setView] = useState<CustomDomainView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<"ok" | "warn">("ok");

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

  const run = async (
    action: BusyAction,
    fn: () => Promise<CustomDomainView>,
    success: string | ((data: CustomDomainView) => { text: string; tone: "ok" | "warn" })
  ) => {
    if (!storeId || busy) return;
    setBusy(action);
    setError(null);
    setNotice(null);
    try {
      const data = await fn();
      setView(data);
      if (data.custom_domain) setDomainInput(data.custom_domain);
      else setDomainInput("");
      const result =
        typeof success === "function" ? success(data) : { text: success, tone: "ok" as const };
      setNotice(result.text);
      setNoticeTone(result.tone);
      await refreshStore({ silent: true });
    } catch (err) {
      setError(getErrorMessage(err, "Domain update failed"));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <View className="px-5 py-4">
        <Muted className="text-[13px]">Loading domain settings…</Muted>
      </View>
    );
  }

  const step = currentStepIndex(view, domainInput);
  const isActive = view?.status === "active";
  const savedDomain = view?.custom_domain ?? "";
  const inputChanged = domainInput.trim().toLowerCase() !== savedDomain.toLowerCase();
  const showSave = !isActive && (!savedDomain || inputChanged);
  const showVerify = Boolean(savedDomain) && !isActive && !inputChanged;

  return (
    <View className="px-5 pb-5 pt-4">
      <View className="flex-row gap-2">
        {STEPS.map((label, index) => {
          const done = index < step || isActive;
          const current = index === step && !isActive;
          return (
            <View key={label} className="min-w-0 flex-1">
              <View
                className={`h-1 rounded-full ${
                  done || current ? "bg-brand-primary" : "bg-gray-200"
                }`}
              />
              <Text
                className={`mt-2 text-[11px] font-semibold uppercase tracking-wide ${
                  current ? "text-ink" : done ? "text-brand-primary" : "text-gray-400"
                }`}
                numberOfLines={1}
              >
                {index + 1}. {label}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="mt-4 flex-row flex-wrap items-center justify-between gap-2">
        <Text className="text-[17px] font-semibold text-ink">{STEPS[step]}</Text>
        <View className={`rounded-full border px-3 py-1 ${statusChipClass(view?.status)}`}>
          <Text className={`text-[12px] font-semibold ${statusTextClass(view?.status)}`}>
            {statusLabel(view?.status)}
          </Text>
        </View>
      </View>

      {error ? (
        <View className="mt-3 rounded-xl border border-danger-border bg-danger-bg px-4 py-3">
          <Text className="text-[13px] text-danger">{error}</Text>
        </View>
      ) : null}
      {notice ? (
        <View
          className={`mt-3 rounded-xl border px-4 py-3 ${
            noticeTone === "warn"
              ? "border-gray-200 bg-warning-bg"
              : "border-success-border bg-success-bg"
          }`}
        >
          <Text className={`text-[13px] ${noticeTone === "warn" ? "text-warning" : "text-success"}`}>
            {notice}
          </Text>
        </View>
      ) : null}

      {isActive && view?.custom_domain ? (
        <View className="mt-4 rounded-2xl border border-success-border bg-success-bg px-4 py-4">
          <Text className="text-[13px] font-medium text-success">Your store is live at</Text>
          <Text className="mt-1 text-[16px] font-semibold text-success">
            https://{view.custom_domain}
          </Text>
          <Muted className="mt-2 text-[13px] leading-5">
            Your AiShopy subdomain still works as a backup.
          </Muted>
          <Caption className="mb-2 mt-4 text-[11px] uppercase tracking-widest text-gray-400">
            Link to share
          </Caption>
          <View className="flex-row gap-1 rounded-xl bg-gray-100 p-1">
            {(
              [
                ["custom", "Custom domain"],
                ["subdomain", "AiShopy link"],
              ] as const
            ).map(([value, label]) => {
              const selected = (view.public_link_host ?? "custom") === value;
              return (
                <Pressable
                  key={value}
                  disabled={Boolean(busy) || selected}
                  onPress={() =>
                    void run(
                      "link",
                      () => setPublicLinkHost(storeId!, value),
                      value === "custom"
                        ? "Share links now use your custom domain."
                        : "Share links now use your AiShopy link."
                    )
                  }
                  className={`flex-1 items-center rounded-lg px-3 py-2.5 ${
                    selected ? "bg-ink" : ""
                  }`}
                >
                  <Text
                    className={`text-center text-[13px] font-semibold ${
                      selected ? "text-brand-on-primary" : "text-ink"
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Muted className="mt-2 text-[13px] leading-5">
            {(view.public_link_host ?? "custom") === "subdomain"
              ? `https://${view.custom_domain} still opens your store.`
              : `${view.subdomain} still opens your store.`}
          </Muted>
        </View>
      ) : (
        <View className="mt-4">
          <Caption className="mb-1.5 text-[11px] uppercase tracking-widest text-gray-400">
            Your domain
          </Caption>
          <TextInput
            value={domainInput}
            onChangeText={setDomainInput}
            placeholder="shop.yourbrand.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            className="rounded-xl border border-gray-200 bg-surface px-4 py-3 text-[15px] text-ink"
          />
        </View>
      )}

      {view?.custom_domain && !isActive ? (
        <View className="mt-4">
          <DomainSteps
            dnsType={view.dns_type ?? "CNAME"}
            dnsName={view.dns_name ?? view.cname_host}
            dnsValue={view.dns_value ?? view.cname_target}
          />
        </View>
      ) : null}

      <View className="mt-4 gap-2">
        {showSave ? (
          <Button
            label="Save domain"
            loading={busy === "save"}
            disabled={Boolean(busy) || !domainInput.trim()}
            onPress={() =>
              void run(
                "save",
                () => saveCustomDomain(storeId!, domainInput.trim()),
                "Domain saved. Add the record below, then verify."
              )
            }
          />
        ) : null}
        {showVerify ? (
          <Button
            label="Verify domain"
            loading={busy === "verify"}
            disabled={Boolean(busy)}
            onPress={() =>
              void run("verify", () => verifyCustomDomain(storeId!), (data) =>
                data.status === "active"
                  ? { text: "Your domain is live.", tone: "ok" }
                  : {
                      text: "The DNS record was not found yet. Add it, then verify again.",
                      tone: "warn",
                    }
              )
            }
          />
        ) : null}
        {view?.custom_domain ? (
          <Button
            label="Remove domain"
            loading={busy === "remove"}
            disabled={Boolean(busy)}
            className="border-[#E11D48] bg-[#E11D48]"
            labelClassName="text-white"
            onPress={() =>
              void run("remove", () => deleteCustomDomain(storeId!), "Custom domain removed")
            }
          />
        ) : null}
      </View>
    </View>
  );
}
