import { Pressable, Text, View } from 'react-native'
import { planLabel } from '@src/lib/admin-users-filters'
import { shadows } from '@src/lib/shadows'
import type { AdminStorePlan, PlatformAdminUserCard } from '@src/types/platform-admin-users'

function planBadgeClass(plan: AdminStorePlan | null, premiumActive: boolean): string {
  if (!plan) return 'bg-gray-100'
  if (plan === 'enterprise') return 'bg-ink'
  if (plan === 'business') {
    return premiumActive ? 'bg-[#E8F8EC]' : 'bg-amber-50'
  }
  return 'bg-gray-100'
}

function planBadgeTextClass(plan: AdminStorePlan | null, premiumActive: boolean): string {
  if (!plan) return 'text-gray-600'
  if (plan === 'enterprise') return 'text-white'
  if (plan === 'business') {
    return premiumActive ? 'text-brand-green' : 'text-amber-800'
  }
  return 'text-gray-600'
}

type Props = {
  user: PlatformAdminUserCard
  relativeSignup: string
  onPress: () => void
}

export function AdminUserCard({ user, relativeSignup, onPress }: Props) {
  const storeLine = user.has_store
    ? [user.primary_store_name, user.primary_store_phone].filter(Boolean).join(' · ')
    : 'No store yet'

  return (
    <Pressable
      onPress={onPress}
      className="w-full rounded-[22px] border border-gray-200 bg-surface px-5 py-4 active:opacity-90"
      style={shadows.sm}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
            {user.email ?? 'No email'}
          </Text>
          <Text className="mt-0.5 text-[13px] text-gray-500" numberOfLines={1}>
            {user.phone ?? 'No phone'}
          </Text>
          <Text className="mt-2 text-[13px] leading-5 text-gray-500" numberOfLines={1}>
            {storeLine}
          </Text>
        </View>
        <View className="shrink-0 items-end gap-1.5">
          <View className={`rounded-full px-2 py-0.5 ${planBadgeClass(user.rollup_plan, user.premium_active)}`}>
            <Text
              className={`text-[10px] font-bold uppercase ${planBadgeTextClass(
                user.rollup_plan,
                user.premium_active,
              )}`}
            >
              {user.has_store ? planLabel(user.rollup_plan) : 'No store'}
            </Text>
          </View>
          <Text className="text-xs font-medium text-gray-400">{relativeSignup}</Text>
          {user.store_count > 1 ? (
            <Text className="text-[10px] font-medium text-gray-400">{user.store_count} stores</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}
