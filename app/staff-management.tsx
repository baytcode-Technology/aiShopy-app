import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Screen, ScreenScrollBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SleekModal } from "@/components/ui/Modal";
import { Caption, Muted } from "@/components/ui/Typography";
import {
  fetchStoreStaff,
  inviteStoreStaff,
  removeStoreStaff,
} from "@src/api/stores";
import { useStore } from "@src/contexts/store-context";
import { showError, showSuccess } from "@src/lib/toast";
import { shadows } from "@src/lib/shadows";
import Colors from "@src/theme/colors";
import type { StoreStaffMember } from "@src/types/store";

function RoleBadge({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-1">
      <Caption className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
        {label}
      </Caption>
    </View>
  );
}

export default function StaffManagementScreen() {
  const { store, role } = useStore();
  const [members, setMembers] = useState<StoreStaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removeTarget, setRemoveTarget] = useState<StoreStaffMember | null>(null);

  const isOwner = role === "owner";

  const loadStaff = useCallback(async () => {
    if (!store?.id || !isOwner) {
      setMembers([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetchStoreStaff(store.id);
      setMembers(res.data.members);
    } catch (e: unknown) {
      showError(e, "Failed to load staff");
    } finally {
      setIsLoading(false);
    }
  }, [store?.id, isOwner]);

  useFocusEffect(
    useCallback(() => {
      void loadStaff();
    }, [loadStaff]),
  );

  const handleInvite = async () => {
    if (!store?.id || isSubmitting) return;
    const trimmed = email.trim();
    if (!trimmed) {
      showError("Email is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await inviteStoreStaff(store.id, trimmed);
      showSuccess(
        res.message,
        res.data.staff.status === "pending"
          ? "They will get access when they sign up."
          : undefined,
      );
      setEmail("");
      setModalOpen(false);
      await loadStaff();
    } catch (e: unknown) {
      showError(e, "Failed to add staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (staffId: number) => {
    if (!store?.id || removingId != null) return;
    setRemovingId(staffId);
    try {
      await removeStoreStaff(store.id, staffId);
      showSuccess("Staff removed");
      setRemoveTarget(null);
      await loadStaff();
    } catch (e: unknown) {
      showError(e, "Failed to remove staff");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Staff management"
        subtitle="Team access for this store"
        onBack={() => router.back()}
        showSettings={false}
      />
      <ScreenScrollBody contentContainerClassName="gap-4">
        {!isOwner ? (
          <View
            className="rounded-2xl border border-gray-200 bg-surface p-5"
            style={shadows.card}
          >
            <Muted className="text-[15px] leading-6">
              Only the store owner can invite and manage staff for this store.
            </Muted>
          </View>
        ) : (
          <>
            <Muted className="text-[14px] leading-5">
              Invite teammates by email. They can help with products, orders, and
              chats once they join.
            </Muted>

            <Button
              label="Add staff"
              onPress={() => setModalOpen(true)}
              className="self-start"
            />

            {isLoading ? (
              <ActivityIndicator color={Colors.brand.green} className="mt-6" />
            ) : (
              <View
                className="rounded-[28px] border border-gray-200 bg-surface overflow-hidden"
                style={shadows.card}
              >
                {members.map((member, index) => (
                  <View
                    key={`${member.email}-${member.role}`}
                    className={`px-5 py-4 flex-row items-center gap-3 ${
                      index < members.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                      <FontAwesome
                        name={member.role === "owner" ? "star" : "user"}
                        size={16}
                        color={Colors.text.muted}
                      />
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text
                        className="text-[15px] font-semibold text-ink"
                        numberOfLines={1}
                      >
                        {member.email}
                      </Text>
                      <Caption className="text-gray-400 mt-0.5 capitalize">
                        {member.status === "owner"
                          ? "Store creator"
                          : member.status === "pending"
                            ? "Invite pending"
                            : "Active staff"}
                      </Caption>
                    </View>
                    <RoleBadge
                      label={
                        member.role === "owner"
                          ? "Owner"
                          : member.status === "pending"
                            ? "Pending"
                            : "Staff"
                      }
                    />
                    {member.role === "staff" && member.id != null ? (
                      <Pressable
                        onPress={() => setRemoveTarget(member)}
                        disabled={removingId === member.id}
                        hitSlop={8}
                        className="p-2"
                      >
                        {removingId === member.id ? (
                          <ActivityIndicator size="small" color={Colors.text.muted} />
                        ) : (
                          <FontAwesome
                            name="trash-o"
                            size={16}
                            color={Colors.text.muted}
                          />
                        )}
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScreenScrollBody>

      <SleekModal
        isOpen={modalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setModalOpen(false);
            setEmail("");
          }
        }}
        title="Add staff"
        subtitle="Enter their AiShopy account email"
        minHeightRatio={0.42}
        footer={
          <View style={modalFooterStyles.row}>
            <View style={modalFooterStyles.buttonSlot}>
              <Button
                label="Cancel"
                variant="outline"
                onPress={() => {
                  if (!isSubmitting) {
                    setModalOpen(false);
                    setEmail("");
                  }
                }}
                disabled={isSubmitting}
              />
            </View>
            <View style={modalFooterStyles.buttonSlot}>
              <Button
                label={isSubmitting ? "Adding…" : "Add"}
                onPress={() => void handleInvite()}
                disabled={isSubmitting}
              />
            </View>
          </View>
        }
      >
        <View className="gap-2">
          <Caption className="text-gray-500 uppercase tracking-widest text-[10px]">
            Email
          </Caption>
          <TextInput
            className="min-h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-[16px] text-ink"
            placeholder="teammate@example.com"
            placeholderTextColor={Colors.text.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!isSubmitting}
          />
        </View>
      </SleekModal>

      <ConfirmDialog
        visible={removeTarget != null}
        title="Remove staff?"
        message={
          removeTarget
            ? `Remove ${removeTarget.email} from this store? They will lose access to products, orders, and chats.`
            : ""
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        loading={removingId != null}
        onCancel={() => {
          if (removingId == null) setRemoveTarget(null);
        }}
        onConfirm={() => {
          if (removeTarget?.id != null) {
            void handleRemove(removeTarget.id);
          }
        }}
      />
    </Screen>
  );
}

const modalFooterStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    gap: 12,
  },
  buttonSlot: {
    flex: 1,
    minWidth: 0,
  },
});
