import { useEffect, useMemo, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { theme } from '@src/theme/colors'

type Props = {
  images: string[]
  initialUri?: string | null
  style?: StyleProp<ViewStyle>
}

export function ProductImageCarousel({ images, initialUri, style }: Props) {
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
      <View style={[styles.hero, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>No image</Text>
      </View>
    )
  }

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.hero}>
        <Image source={{ uri: currentUri }} style={styles.heroImage} resizeMode="cover" />
        {canNavigate ? (
          <>
            <Pressable
              style={({ pressed }) => [styles.navBtn, styles.navLeft, pressed && styles.navPressed]}
              onPress={goPrev}
              accessibilityLabel="Previous image"
            >
              <FontAwesome name="chevron-left" size={18} color={theme.white} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.navBtn, styles.navRight, pressed && styles.navPressed]}
              onPress={goNext}
              accessibilityLabel="Next image"
            >
              <FontAwesome name="chevron-right" size={18} color={theme.white} />
            </Pressable>
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {safeIndex + 1} / {gallery.length}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {gallery.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.strip}
        >
          {gallery.map((uri, index) => {
            const selected = index === safeIndex
            return (
              <Pressable
                key={`${uri}-${index}`}
                onPress={() => setSelectedIndex(index)}
                style={({ pressed }) => [
                  styles.thumbWrap,
                  selected && styles.thumbWrapSelected,
                  pressed && styles.thumbPressed,
                ]}
              >
                <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
              </Pressable>
            )
          })}
        </ScrollView>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  hero: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.gray100,
    borderWidth: 1,
    borderColor: theme.gray200,
  },
  heroImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 16, color: theme.gray600, fontWeight: '600' },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  navLeft: { left: 12 },
  navRight: { right: 12 },
  navPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  counter: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -36,
    width: 72,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  counterText: { color: theme.white, fontSize: 12, fontWeight: '700' },
  strip: { gap: 10, paddingVertical: 4 },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbWrapSelected: { borderColor: theme.black },
  thumbPressed: { opacity: 0.9 },
  thumb: { width: '100%', height: '100%' },
})
