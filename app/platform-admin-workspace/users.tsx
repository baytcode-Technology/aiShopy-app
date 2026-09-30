import { AdminUserCard } from "@/components/admin/AdminUserCard";
import { AdminUsersFilterChips } from "@/components/admin/AdminUsersFilterChips";
import { AdminUsersFilterModal } from "@/components/admin/AdminUsersFilterModal";
import { OrderSearchBar } from "@/components/store/order-create/OrderSearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { OrderRowSkeleton } from "@/components/ui/Skeleton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { fetchPlatformAdminUsers } from "@src/api/platform-admin-users";
import {
  EMPTY_ADMIN_USERS_FILTERS,
  formatRelativeTime,
  hasActiveAdminUsersFilters,
  type AdminUsersFilters,
} from "@src/lib/admin-users-filters";
import { getApiErrorCode, getErrorMessage } from "@src/lib/api-error";
import Colors from "@src/theme/colors";
import type { PlatformAdminUserCard } from "@src/types/platform-admin-users";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

const PAGE_SIZE = 20;

export default function PlatformAdminWorkspaceUsersScreen() {
  const goBack = () => router.replace("/platform-admin" as Href);
  const [searchDraft, setSearchDraft] = useState("");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<AdminUsersFilters>(EMPTY_ADMIN_USERS_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<PlatformAdminUserCard[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = searchDraft.trim();
      setQ((prev) => {
        if (prev === next) return prev;
        setPage(1);
        return next;
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [searchDraft]);

  const loadUsers = useCallback(async (_opts?: { silent?: boolean }) => {
    setError(null);
    try {
      const res = await fetchPlatformAdminUsers({
        q: q || undefined,
        hasStore: filters.hasStore ?? undefined,
        plan: filters.plan ?? undefined,
        signedAfter: filters.signedAfter ?? undefined,
        page,
        limit: PAGE_SIZE,
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (e) {
      if (getApiErrorCode(e) === "FORBIDDEN") {
        router.replace("/platform-admin" as Href);
        return;
      }
      setError(getErrorMessage(e, "Could not load users"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.hasStore, filters.plan, filters.signedAfter, page, q]);

  useFocusEffect(
    useCallback(() => {
      void loadUsers()
    }, [loadUsers]),
  )

  const filtersActive = hasActiveAdminUsersFilters(filters);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Screen>
      <ScreenHeader
        title="Users"
        subtitle="Signed-in merchants and their stores"
        onBack={goBack}
        showSettings={false}
      />
      <View className="flex-row items-start gap-2.5 px-5 py-1">
        <View className="flex-1">
          <OrderSearchBar
            value={searchDraft}
            onChangeText={setSearchDraft}
            placeholder="Search email, store, or phone"
          />
        </View>
        <Pressable
          onPress={() => setFilterOpen(true)}
          accessibilityLabel="Filter users"
          className={`h-12 w-12 items-center justify-center rounded-2xl border ${
            filtersActive ? "border-ink bg-gray-100" : "border-gray-200 bg-gray-50"
          }`}
        >
          <FontAwesome
            name="filter"
            size={16}
            color={filtersActive ? Colors.text.primary : Colors.text.muted}
          />
        </Pressable>
      </View>
      <AdminUsersFilterChips
        filters={filters}
        onRemove={(key) => {
          setFilters((prev) => ({ ...prev, [key]: null }));
          setPage(1);
        }}
        onClearAll={() => {
          setFilters(EMPTY_ADMIN_USERS_FILTERS);
          setPage(1);
        }}
      />
      <ScreenBody>
        {loading ? (
          <View className="px-5 pt-2">
            {[0, 1, 2, 3].map((index) => (
              <OrderRowSkeleton key={index} />
            ))}
          </View>
        ) : error ? (
          <EmptyState title="Could not load users" description={error} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-5 pt-1 pb-8 gap-3"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  void loadUsers({ silent: true });
                }}
              />
            }
            ListHeaderComponent={
              users.length > 0 ? (
                <Text className="text-[12px] font-semibold text-gray-400">
                  {total} user{total === 1 ? "" : "s"}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                icon="search"
                title="No users match"
                description="Try a different search or clear filters."
              />
            }
            renderItem={({ item }) => (
              <AdminUserCard
                user={item}
                relativeSignup={formatRelativeTime(item.created_at)}
                onPress={() =>
                  router.push({
                    pathname: "/platform-admin-user/[id]",
                    params: { id: item.id },
                  } as Href)
                }
              />
            )}
            ListFooterComponent={
              totalPages > 1 ? (
                <View className="mt-2 flex-row items-center justify-between px-1">
                  <Pressable
                    disabled={page <= 1}
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                    className={page <= 1 ? "opacity-40" : ""}
                  >
                    <Text className="text-[13px] font-semibold text-gray-500">Previous</Text>
                  </Pressable>
                  <Text className="text-[12px] font-medium text-gray-400">
                    Page {page} of {totalPages}
                  </Text>
                  <Pressable
                    disabled={page >= totalPages}
                    onPress={() => setPage((p) => p + 1)}
                    className={page >= totalPages ? "opacity-40" : ""}
                  >
                    <Text className="text-[13px] font-semibold text-gray-500">Next</Text>
                  </Pressable>
                </View>
              ) : null
            }
          />
        )}
      </ScreenBody>
      <AdminUsersFilterModal
        visible={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />
    </Screen>
  );
}
