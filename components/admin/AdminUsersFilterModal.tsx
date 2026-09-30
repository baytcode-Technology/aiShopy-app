import { useState, type ReactNode } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import {
  EMPTY_ADMIN_USERS_FILTERS,
  hasActiveAdminUsersFilters,
  hasStoreLabel,
  planLabel,
  signedAfterLabel,
  type AdminUsersFilters,
} from '@src/lib/admin-users-filters'
import type {
  AdminHasStoreFilter,
  AdminPlanFilter,
  AdminSignedAfterFilter,
} from '@src/types/platform-admin-users'
import Colors from '@src/theme/colors'

type Props = {
  visible: boolean
  filters: AdminUsersFilters
  onClose: () => void
  onApply: (filters: AdminUsersFilters) => void
}

type Section = 'hasStore' | 'plan' | 'signedAfter'

const HAS_STORE_OPTIONS: AdminHasStoreFilter[] = ['yes', 'no']
const PLAN_OPTIONS: AdminPlanFilter[] = ['starter', 'business', 'enterprise']
const SIGNED_OPTIONS: AdminSignedAfterFilter[] = ['7d', '30d', '90d']

export function AdminUsersFilterModal({ visible, filters, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets()
  const [draft, setDraft] = useState<AdminUsersFilters>(filters)
  const [expanded, setExpanded] = useState<Section | null>('hasStore')

  const open = () => {
    setDraft(filters)
    setExpanded('hasStore')
  }

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  const handleClear = () => {
    setDraft(EMPTY_ADMIN_USERS_FILTERS)
    onApply(EMPTY_ADMIN_USERS_FILTERS)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={open}
    >
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Pressable onPress={onClose} hitSlop={10} className="w-10 h-10 items-center justify-center">
            <FontAwesome name="times" size={20} color={Colors.text.primary} />
          </Pressable>
          <Text className="text-[17px] font-bold text-ink">Filter users</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-2"
          showsVerticalScrollIndicator={false}
        >
          <FilterSection
            title="Store created"
            open={expanded === 'hasStore'}
            onToggle={() => setExpanded(expanded === 'hasStore' ? null : 'hasStore')}
          >
            {HAS_STORE_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                label={hasStoreLabel(option)}
                active={draft.hasStore === option}
                onPress={() =>
                  setDraft((prev) => ({
                    ...prev,
                    hasStore: prev.hasStore === option ? null : option,
                  }))
                }
              />
            ))}
          </FilterSection>

          <FilterSection
            title="Plan"
            open={expanded === 'plan'}
            onToggle={() => setExpanded(expanded === 'plan' ? null : 'plan')}
          >
            {PLAN_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                label={planLabel(option)}
                active={draft.plan === option}
                onPress={() =>
                  setDraft((prev) => ({
                    ...prev,
                    plan: prev.plan === option ? null : option,
                  }))
                }
              />
            ))}
          </FilterSection>

          <FilterSection
            title="Signed up"
            open={expanded === 'signedAfter'}
            onToggle={() => setExpanded(expanded === 'signedAfter' ? null : 'signedAfter')}
          >
            {SIGNED_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                label={signedAfterLabel(option)}
                active={draft.signedAfter === option}
                onPress={() =>
                  setDraft((prev) => ({
                    ...prev,
                    signedAfter: prev.signedAfter === option ? null : option,
                  }))
                }
              />
            ))}
          </FilterSection>
        </ScrollView>

        <View
          className="px-4 pt-3 border-t border-gray-200 gap-2"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          {hasActiveAdminUsersFilters(draft) ? (
            <Pressable onPress={handleClear} className="py-2 items-center">
              <Text className="text-[14px] font-semibold text-gray-500">Clear filters</Text>
            </Pressable>
          ) : null}
          <Button label="Apply filters" onPress={handleApply} />
        </View>
      </View>
    </Modal>
  )
}

function FilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <View className="border-b border-gray-100">
      <Pressable onPress={onToggle} className="flex-row items-center justify-between py-4">
        <Text className="text-[16px] font-semibold text-ink">{title}</Text>
        <FontAwesome name={open ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.text.muted} />
      </Pressable>
      {open ? <View className="gap-2.5 pb-4">{children}</View> : null}
    </View>
  )
}

function OptionButton({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl border px-4 py-3.5 ${
        active ? 'border-ink bg-gray-50' : 'border-gray-200 bg-surface'
      }`}
    >
      <Text className={`text-[15px] ${active ? 'font-semibold text-ink' : 'font-medium text-gray-500'}`}>
        {label}
      </Text>
    </Pressable>
  )
}
