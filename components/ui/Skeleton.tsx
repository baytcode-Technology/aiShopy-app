import { useEffect } from 'react'
import { View, type ViewProps } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { cn } from '@src/lib/cn'
import { shadows } from '@src/lib/shadows'

type Props = ViewProps & {
  className?: string
}

function ShimmerBox({ className, style, ...props }: Props) {
  const opacity = useSharedValue(0.38)

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.72, { duration: 950, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    )
  }, [opacity])

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      className={cn('rounded-2xl bg-gray-200', className)}
      style={[style, animated]}
      {...props}
    />
  )
}

export function Skeleton(props: Props) {
  return <ShimmerBox {...props} />
}

export function ProductCardSkeleton() {
  return (
    <View className="w-full">
      <View style={{ aspectRatio: 0.82 }} className="w-full rounded-[26px] overflow-hidden">
        <Skeleton className="w-full h-full rounded-[26px]" />
      </View>
      <View className="mt-3 px-1 gap-2">
        <Skeleton className="h-3.5 w-[85%] rounded-md" />
        <Skeleton className="h-3 w-[45%] rounded-md" />
      </View>
    </View>
  )
}

export function CategoryCardSkeleton() {
  return (
    <View className="w-full">
      <View style={{ aspectRatio: 0.95 }} className="w-full rounded-[26px] overflow-hidden">
        <Skeleton className="w-full h-full rounded-[26px]" />
      </View>
    </View>
  )
}

export function CatalogSkeletonGrid() {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-5 px-1 pt-2">
      {[0, 1, 2, 3].map((k) => (
        <View key={k} className="w-[48%]">
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  )
}

export function ProductListRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 py-3.5 border-b border-gray-200">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-3.5 w-[70%] rounded-md" />
        <Skeleton className="h-3 w-[45%] rounded-md" />
      </View>
      <Skeleton className="h-6 w-14 rounded-full" />
    </View>
  )
}

export function ProductListSkeleton() {
  return (
    <View className="pt-1">
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <ProductListRowSkeleton key={k} />
      ))}
    </View>
  )
}

export function OrderRowSkeleton() {
  return (
    <View
      className="mb-4 rounded-[22px] border border-gray-200 bg-surface p-5"
      style={shadows.sm}
    >
      <View className="flex-row justify-between mb-4">
        <Skeleton className="h-4 w-[42%] rounded-md" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </View>
      <Skeleton className="h-3 w-[55%] rounded-md mb-5" />
      <View className="flex-row justify-between items-center">
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-6 w-28 rounded-md" />
      </View>
    </View>
  )
}

export function OrdersSkeletonList() {
  return (
    <View className="pt-2">
      {[0, 1, 2, 3].map((i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </View>
  )
}

function NotificationToggleRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between gap-3 py-3">
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-[38%] rounded-md" />
        <Skeleton className="h-3 w-[72%] rounded-md" />
      </View>
      <Skeleton className="h-8 w-[52px] rounded-full" />
    </View>
  )
}

export function NotificationSettingsSkeleton() {
  return (
    <View className="gap-4">
      <Skeleton className="h-10 w-full rounded-md" />
      <View
        className="w-full rounded-[28px] border border-gray-200 bg-surface px-4 py-5 gap-1"
        style={shadows.card}
      >
        <Skeleton className="h-5 w-16 rounded-md mb-3" />
        {[0, 1, 2].map((i) => (
          <NotificationToggleRowSkeleton key={i} />
        ))}
      </View>
      <View
        className="w-full rounded-[28px] border border-gray-200 bg-surface px-4 py-5 gap-3"
        style={shadows.card}
      >
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </View>
    </View>
  )
}
