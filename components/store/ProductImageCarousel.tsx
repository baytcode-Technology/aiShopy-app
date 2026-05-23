import { useEffect, useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Caption } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'

type Props = {
  images: string[]
  initialUri?: string | null
  className?: string
}

export function ProductImageCarousel({ images, initialUri, className }: Props) {
  const gallery = useMemo(() => {
    const list = images.filter(Boolean)
    if (list.length === 0) return []
    return list
  }, [images])

  const initialIndex = useMemo(() => {
    if (gallery.length === 0) return 0
    if (initialUri) {
      const idx = gallery.indexOf(initialUri)
      if (idx >= 0) return idx
    }
    return 0
  }, [gallery, initialUri])

  const [selectedIndex, setSelectedIndex] = useState(initialIndex)

  useEffect(() => {
    setSelectedIndex(initialIndex)
  }, [initialIndex, gallery.join('|')])

  const safeIndex = gallery.length > 0 ? Math.min(selectedIndex, gallery.length - 1) : 0
  const currentUri = gallery[safeIndex]
  const canNavigate = gallery.length > 1

  const goPrev = () => {
    if (!canNavigate) return
    setSelectedIndex((i) => (i <= 0 ? gallery.length - 1 : i - 1))
  }

  const goNext = () => {
    if (!canNavigate) return
    setSelectedIndex((i) => (i >= gallery.length - 1 ? 0 : i + 1))
  }

  if (gallery.length === 0) {
    return (
      <View
        className={cn(
          'h-[300px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 items-center justify-center',
          className
        )}
      >
        <Caption className="text-base font-semibold">No image</Caption>
      </View>
    )
  }

  return (
    <View className={cn('gap-3', className)}>
      <View className="h-[300px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
        <Image source={{ uri: currentUri }} className="w-full h-full" resizeMode="cover" />
        {canNavigate ? (
          <>
            <Pressable
              className="absolute top-1/2 -mt-[22px] left-3"
              onPress={goPrev}
              accessibilityLabel="Previous image"
            >
              {({ pressed }) => (
                <View
                  className={cn(
                    'w-11 h-11 rounded-full bg-ink-soft items-center justify-center border border-white/25',
                    pressed && 'opacity-85'
                  )}
                >
                  <FontAwesome name="chevron-left" size={18} color={Colors.brand.onPrimary} />
                </View>
              )}
            </Pressable>
            <Pressable
              className="absolute top-1/2 -mt-[22px] right-3"
              onPress={goNext}
              accessibilityLabel="Next image"
            >
              {({ pressed }) => (
                <View
                  className={cn(
                    'w-11 h-11 rounded-full bg-ink-soft items-center justify-center border border-white/25',
                    pressed && 'opacity-85'
                  )}
                >
                  <FontAwesome name="chevron-right" size={18} color={Colors.brand.onPrimary} />
                </View>
              )}
            </Pressable>
            <View className="absolute bottom-3 self-center left-1/2 -ml-9 w-[72px] bg-ink-counter py-1 px-2.5 rounded-[14px] items-center">
              <Text className="text-brand-on-primary text-xs font-bold">
                {safeIndex + 1} / {gallery.length}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {gallery.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5 py-1">
          {gallery.map((uri, index) => {
            const selected = index === safeIndex
            return (
              <Pressable key={`${uri}-${index}`} onPress={() => setSelectedIndex(index)}>
                <View
                  className={cn(
                    'w-[72px] h-[72px] rounded-[10px] overflow-hidden border-2',
                    selected ? 'border-ink' : 'border-transparent'
                  )}
                >
                  <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      ) : null}
    </View>
  )
}
