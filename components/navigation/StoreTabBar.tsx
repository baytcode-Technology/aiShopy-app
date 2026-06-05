import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'
import { palette } from '@src/theme/palette'
import { shadows } from '@src/lib/shadows'

const icons: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
  chats: 'comments',
  products: 'th-large',
  orders: 'shopping-bag',
  dashboard: 'tachometer',
}

const labels: Record<string, string> = {
  chats: 'Chats',
  products: 'Products',
  orders: 'Orders',
  dashboard: 'Dashboard',
}

const VISIBLE_TAB_ROUTES = new Set(['chats', 'products', 'orders', 'dashboard'])

const TAB_PILL_RADIUS = 18

export function StoreTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const bottom = Math.max(insets.bottom, 10)

  return (
    <View className="px-5 pt-2" style={{ paddingBottom: bottom }}>
      <View
        className="flex-row items-center justify-between rounded-[26px] bg-surface px-2 py-2 border border-gray-200"
        style={shadows.card}
      >
        {state.routes
          .filter((route) => VISIBLE_TAB_ROUTES.has(route.name))
          .map((route) => {
            const routeIndex = state.routes.findIndex((r) => r.key === route.key)
            const focused = state.index === routeIndex
            const { options } = descriptors[route.key]
            const label =
              options.title !== undefined && options.title !== null
                ? String(options.title)
                : labels[route.name] ?? route.name

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

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              })
            }

            const iconName = icons[route.name] ?? 'circle'

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabPressable}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      styles.tabPill,
                      focused && styles.tabPillSelected,
                      pressed && !focused && styles.tabPillPressed,
                    ]}
                  >
                    <FontAwesome
                      name={iconName}
                      size={20}
                      color={focused ? Colors.brand.primary : Colors.text.muted}
                    />
                    <Text
                      className={cn(
                        'text-[10px] font-bold mt-1 tracking-wide',
                        focused ? 'text-ink' : 'text-gray-400'
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
  tabPillSelected: {
    backgroundColor: palette.gray100,
  },
  tabPillPressed: {
    opacity: 0.8,
  },
})
