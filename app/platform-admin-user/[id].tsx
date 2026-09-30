import { DetailSection } from "@/components/store/detail/DetailSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen, ScreenScrollBody } from "@/components/ui/Screen";
import { OrderRowSkeleton } from "@/components/ui/Skeleton";
import { Subtitle } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { fetchPlatformAdminUser } from "@src/api/platform-admin-users";
import { usePlatformAdminBack } from "@src/hooks/usePlatformAdminBack";
import {
  formatDateTime,
  formatMoney,
  planLabel,
} from "@src/lib/admin-users-filters";
import { getApiErrorCode, getErrorMessage } from "@src/lib/api-error";
import Colors from "@src/theme/colors";
import type {
  PlatformAdminCheckoutSummary,
  PlatformAdminStoreSummary,
  PlatformAdminUserDetail,
} from "@src/types/platform-admin-users";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";

function UserDetailHeader({
  email,
  onBack,
}: {
  email?: string | null;
  onBack: () => void;
}) {
  return (
    <View className="bg-surface px-5 pb-3 pt-4">
      <Pressable
        onPress={onBack}
        className="-ml-1 mb-3 flex-row items-center gap-1.5 self-start py-1"
        hitSlop={10}
      >
        <FontAwesome name="chevron-left" size={13} color={Colors.text.secondary} />
        <Subtitle className="text-[13px] font-semibold text-gray-500">Back</Subtitle>
      </Pressable>
      <Text className="text-[22px] font-extrabold tracking-tight text-ink">User</Text>
      {email ? (
        <Text
          className="mt-1.5 text-[14px] font-medium text-gray-500"
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {email}
        </Text>
      ) : null}
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 border-b border-gray-100 px-5 py-3.5 last:border-b-0">
      <Text className="shrink-0 text-[13px] font-medium text-gray-400">{label}</Text>
      <Text className="min-w-0 flex-1 text-right text-[14px] font-semibold text-ink">
        {value}
      </Text>
    </View>
  );
}

function Chip({ label, on }: { label: string; on: boolean }) {
  return (
    <View className={`rounded-full px-2.5 py-1 ${on ? "bg-[#E8F8EC]" : "bg-gray-100"}`}>
      <Text className={`text-[11px] font-bold ${on ? "text-brand-green" : "text-gray-500"}`}>
        {label}
      </Text>
    </View>
  );
}

function latestPaidCheckout(
  storeId: number,
  subscriptions: PlatformAdminCheckoutSummary[],
): PlatformAdminCheckoutSummary | null {
  return (
    subscriptions.find((item) => item.store_id === storeId && item.status === "paid") ??
    subscriptions.find((item) => item.store_id === storeId) ??
    null
  );
}

function StoreCard({
  store,
  checkout,
}: {
  store: PlatformAdminStoreSummary;
  checkout: PlatformAdminCheckoutSummary | null;
}) {
  return (
    <DetailSection>
      <View className="border-b border-gray-100 px-5 py-4">
        <View className="flex-row items-start gap-3">
          {store.logo_url ? (
            <Image source={{ uri: store.logo_url }} className="h-12 w-12 rounded-xl" />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Text className="text-[13px] font-bold text-gray-500">
                {store.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="min-w-0 flex-1">
            <Text className="text-[16px] font-semibold text-ink" numberOfLines={1}>
              {store.name}
            </Text>
            <Pressable
              onPress={() => {
                if (store.storefront_url) void Linking.openURL(store.storefront_url);
              }}
            >
              <Text className="text-[13px] text-gray-500" numberOfLines={1}>
                {store.storefront_url}
              </Text>
            </Pressable>
          </View>
        </View>
        <View className="mt-3 flex-row flex-wrap gap-1.5">
          <Chip
            label={`WhatsApp ${store.whatsapp_connected ? "on" : "off"}`}
            on={store.whatsapp_connected}
          />
          <Chip
            label={`Instagram ${store.instagram_connected ? "on" : "off"}`}
            on={store.instagram_connected}
          />
          <Chip
            label={`AI ${store.ai_auto_reply_enabled ? "on" : "off"}`}
            on={store.ai_auto_reply_enabled}
          />
          <Chip
            label={store.premium_active ? "Premium active" : "Premium off"}
            on={store.premium_active}
          />
        </View>
      </View>
      <Fact label="Store phone" value={store.phone ?? "—"} />
      <Fact label="Country / currency" value={`${store.country} · ${store.currency}`} />
      <Fact label="Industry" value={store.industry ?? "—"} />
      <Fact label="Created" value={formatDateTime(store.created_at)} />
      <Fact label="Plan" value={planLabel(store.subscription_plan)} />
      <Fact label="Expires" value={store.subscription_expires_at ?? "—"} />
      <Fact
        label="Last paid plan"
        value={
          checkout?.paid_at
            ? `${planLabel(checkout.plan)} · ${formatDateTime(checkout.paid_at)} · ${formatMoney(
                checkout.amount,
                checkout.currency,
              )}`
            : "No paid checkout"
        }
      />
      <Fact label="Products" value={String(store.product_count)} />
      <Fact label="Orders" value={String(store.order_count)} />
      <Fact label="COD" value={store.payments.cod_enabled ? "Enabled" : "Off"} />
      <Fact
        label="Razorpay"
        value={
          store.payments.razorpay_enabled
            ? `On · ${store.payments.razorpay_mode}${
                store.payments.razorpay_key_id_masked
                  ? ` · ${store.payments.razorpay_key_id_masked}`
                  : ""
              }`
            : store.payments.razorpay_configured
              ? "Configured, disabled"
              : "Off"
        }
      />
      <Fact
        label="UPI"
        value={
          store.payments.upi_enabled
            ? `On${store.payments.upi_vpa_masked ? ` · ${store.payments.upi_vpa_masked}` : ""}`
            : "Off"
        }
      />
      {store.instagram_username ? (
        <Fact label="Instagram username" value={`@${store.instagram_username}`} />
      ) : null}
    </DetailSection>
  );
}

export default function PlatformAdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goBack = usePlatformAdminBack("/platform-admin-workspace/users" as Href);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<PlatformAdminUserDetail | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPlatformAdminUser(id);
      setDetail(res.data);
    } catch (e) {
      if (getApiErrorCode(e) === "FORBIDDEN") {
        router.replace("/platform-admin" as Href);
        return;
      }
      setError(getErrorMessage(e, "Could not load this user"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <UserDetailHeader email={detail?.user.email} onBack={goBack} />
      <ScreenScrollBody contentContainerClassName="gap-4">
        {loading ? (
          <View>
            <OrderRowSkeleton />
            <OrderRowSkeleton />
          </View>
        ) : error ? (
          <EmptyState title="Could not load user" description={error} />
        ) : !detail ? (
          <EmptyState title="User not found" />
        ) : (
          <>
            <DetailSection>
              <View className="border-b border-gray-100 px-5 py-4">
                <Text className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Account
                </Text>
                <Text
                  className="mt-2 text-[16px] font-semibold leading-5 text-ink"
                  selectable
                >
                  {detail.user.email ?? "No email"}
                </Text>
              </View>
              <Fact label="Phone" value={detail.user.phone ?? "—"} />
              <Fact label="Signed up" value={formatDateTime(detail.user.created_at)} />
              <Fact label="Last sign-in" value={formatDateTime(detail.user.last_sign_in_at)} />
              <Fact
                label="Auth providers"
                value={
                  detail.user.providers.length > 0 ? detail.user.providers.join(", ") : "—"
                }
              />
            </DetailSection>

            {detail.stores.length === 0 ? (
              <EmptyState
                className="py-10"
                title="No store yet"
                description="This signed-in user has not created a store."
              />
            ) : (
              detail.stores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  checkout={latestPaidCheckout(store.id, detail.subscriptions)}
                />
              ))
            )}
          </>
        )}
      </ScreenScrollBody>
    </Screen>
  );
}
