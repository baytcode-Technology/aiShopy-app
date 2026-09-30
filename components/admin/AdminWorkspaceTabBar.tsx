import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { UnreadCountBadge } from '@/components/ui/UnreadCountBadge'
import { useSupportAdminSummary } from '@src/hooks/useSupportAdminSummary'
import { useAppTheme } from '@src/contexts/theme-context'
import { cn } from '@src/lib/cn'
import { getShadows } from '@src/lib/shadows'

const ICONS: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
  support: 'inbox',
  users: 'users',
}

const LABELS: Record<string, string> = {
  support: 'Inbox',
  users: 'Users',
}

const VISIBLE = new Set(['support', 'users'])
const TAB_PILL_RADIUS = 18

export function AdminWorkspaceTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const bottom = Math.max(insets.bottom, 10)
  const { colors } = useAppTheme()
  const cardShadow = getShadows(colors).card
  const { summary } = useSupportAdminSummary(true)
  const unreadOnTickets = summary.unread_messages

  return (
    <View className="px-5 pt-2" style={{ paddingBottom: bottom }}>
      <View
        className="flex-row items-center justify-between rounded-[26px] bg-surface px-2 py-2 border border-gray-200"
        style={cardShadow}
      >
        {state.routes
          .filter((route) => VISIBLE.has(route.name))
          .map((route) => {
            const routeIndex = state.routes.findIndex((r) => r.key === route.key)
            const focused = state.index === routeIndex
            const { options } = descriptors[route.key]
            const label = LABELS[route.name] ?? options.title ?? route.name
            const iconName = ICONS[route.name] ?? 'circle'
            const badgeCount = route.name === 'support' ? unreadOnTickets : 0

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params)
              }
            }

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={String(label)}
                onPress={onPress}
                style={styles.tabPressable}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      styles.tabPill,
                      focused && { backgroundColor: colors.bg.muted },
                      pressed && !focused && styles.tabPillPressed,
                    ]}
                  >
                    <View style={styles.iconWrap}>
                      <FontAwesome
                        name={iconName}
                        size={20}
                        color={focused ? colors.brand.primary : colors.text.muted}
                      />
                      {badgeCount > 0 ? (
                        <View style={styles.tabBadge}>
                          <UnreadCountBadge count={badgeCount} />
                        </View>
                      ) : null}
                    </View>
                    <Text
                      className={cn(
                        'text-[10px] font-bold mt-1 tracking-wide',
                        focused ? 'text-ink' : 'text-gray-400',
                      )}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  </View>
                )}
              </Pressable>
            )
          })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tabPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabPill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TAB_PILL_RADIUS,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 56,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  tabPillPressed: {
    opacity: 0.8,
  },
  iconWrap: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
  },
})
