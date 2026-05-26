import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type KeyboardEvent,
  type LayoutChangeEvent,
} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { DisplayBrand, Heading, Subtitle } from '@/components/ui/Typography'
import { palette } from '@src/theme/palette'
import { AuthKeyboardContext } from './auth-keyboard-context'

const KEYBOARD_ANIM_MS = 280

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
  },
  android: {
    elevation: 14,
  },
  default: {},
})

type Props = {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const [cardHeight, setCardHeight] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const translateY = useSharedValue(0)

  const windowH = Dimensions.get('window').height
  const safeH = windowH - insets.top - insets.bottom
  const cardOverflows = cardHeight > safeH - 40

  const onCardLayout = useCallback((e: LayoutChangeEvent) => {
    setCardHeight(e.nativeEvent.layout.height)
  }, [])

  const computeShift = useCallback(
    (kbHeight: number) => {
      if (kbHeight <= 0 || cardHeight <= 0) return 0

      const available = safeH - kbHeight
      const cardCenterY = safeH / 2
      const cardBottom = cardCenterY + cardHeight / 2
      const margin = 24
      const overlap = cardBottom - (available - margin)

      const maxShift = Math.max(0, cardCenterY - insets.top - 20 - cardHeight / 2)
      return Math.min(Math.max(0, overlap), maxShift)
    },
    [cardHeight, safeH, insets.top]
  )

  const animateShift = useCallback(
    (kbHeight: number) => {
      const shift = computeShift(kbHeight)
      translateY.value = withTiming(-shift, {
        duration: KEYBOARD_ANIM_MS,
        easing: Easing.out(Easing.cubic),
      })
    },
    [computeShift, translateY]
  )

  useEffect(() => {
    if (keyboardHeight > 0) {
      animateShift(keyboardHeight)
    }
  }, [cardHeight, keyboardHeight, animateShift])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const onShow = (e: KeyboardEvent) => {
      const kb = e.endCoordinates.height
      setKeyboardHeight(kb)
      animateShift(kb)
      if (computeShift(kb) > 0) {
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true })
        }, KEYBOARD_ANIM_MS + 40)
      }
    }

    const onHide = () => {
      setKeyboardHeight(0)
      translateY.value = withTiming(0, {
        duration: KEYBOARD_ANIM_MS,
        easing: Easing.out(Easing.cubic),
      })
    }

    const subShow = Keyboard.addListener(showEvent, onShow)
    const subHide = Keyboard.addListener(hideEvent, onHide)

    return () => {
      subShow.remove()
      subHide.remove()
    }
  }, [animateShift, translateY, computeShift])

  const notifyInputFocus = useCallback(() => {
    if (keyboardHeight <= 0) return
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true })
    })
  }, [keyboardHeight])

  const keyboardContext = useMemo(
    () => ({ notifyInputFocus }),
    [notifyInputFocus]
  )

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const scrollPaddingBottom = keyboardHeight > 0 ? Math.max(24, keyboardHeight * 0.25) : 0

  return (
    <AuthKeyboardContext.Provider value={keyboardContext}>
      <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'bottom']}>
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={[
            styles.scrollContent,
            cardOverflows && !keyboardHeight ? styles.scrollContentTop : null,
            { paddingBottom: 32 + scrollPaddingBottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={keyboardHeight > 0 || cardOverflows}
        >
          <Animated.View
            onLayout={onCardLayout}
            style={[animatedCardStyle, cardShadow, styles.card]}
          >
            <DisplayBrand className="mb-8">Katlogue</DisplayBrand>
            <Heading className="text-[30px] mb-2 tracking-tight">{title}</Heading>
            <Subtitle className="text-[15px] leading-[22px] text-gray-500 mb-7">
              {subtitle}
            </Subtitle>

            <View className="gap-5 w-full">{children}</View>

            {footer ? (
              <View className="mt-7 pt-6 border-t border-gray-100 items-center w-full">
                {footer}
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </AuthKeyboardContext.Provider>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  scrollContentTop: {
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  card: {
    width: '100%',
    backgroundColor: palette.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: palette.gray200,
    padding: 28,
  },
})
