import { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'
import { cn } from '@src/lib/cn'
import { Heading, Subtitle } from './Typography'
import type { ScrollView as RNScrollView } from 'react-native'
import type { RefObject } from 'react'

/** Matches tailwind `pb-7` — minimum footer padding on gesture-navigation devices. */
const FOOTER_PADDING_MIN = 28

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  scrollClassName?: string
  /** Sheet min height as a fraction of screen height (e.g. 0.5 = 50%). */
  minHeightRatio?: number
  /** Sheet max height as a fraction of screen height (e.g. 0.8 = 80%). */
  maxHeightRatio?: number
  /**
   * Optional ref to the internal ScrollView so forms can auto-scroll to
   * validation errors.
   */
  scrollViewRef?: RefObject<RNScrollView | null>
  /** When false, body is a flex View (for FlatList / VirtualizedList children). */
  bodyScroll?: boolean
}

export function SleekModal(props: Props) {
  return (
    <RNModal
      visible={props.isOpen}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={props.onClose}
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SleekModalSheet {...props} />
      </SafeAreaProvider>
    </RNModal>
  )
}

function SleekModalSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  scrollClassName,
  minHeightRatio,
  maxHeightRatio,
  scrollViewRef,
  bodyScroll = true,
}: Props) {
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const usesSheetSizing = minHeightRatio != null || maxHeightRatio != null
  const sheetMinHeight = minHeightRatio != null ? windowHeight * minHeightRatio : undefined
  const sheetMaxHeight =
    maxHeightRatio != null ? windowHeight * maxHeightRatio : windowHeight * 0.92

  const footerBottomPadding = Math.max(insets.bottom, FOOTER_PADDING_MIN)
  const scrollExtraBottomPadding = footer ? 0 : Math.max(insets.bottom, 0)

  const [chromeHeight, setChromeHeight] = useState(0)
  const [footerHeight, setFooterHeight] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setChromeHeight(0)
      setFooterHeight(0)
      setContentHeight(0)
    }
  }, [isOpen])

  const onChromeLayout = (e: LayoutChangeEvent) => {
    setChromeHeight(e.nativeEvent.layout.height)
  }

  const onFooterLayout = (e: LayoutChangeEvent) => {
    setFooterHeight(e.nativeEvent.layout.height)
  }

  const { sheetHeight, bodyHeight, scrollable } = useMemo(() => {
    if (!usesSheetSizing) {
      return { sheetHeight: undefined, bodyHeight: undefined, scrollable: false }
    }

    if (!bodyScroll) {
      const fixedHeight = sheetMinHeight ?? sheetMaxHeight
      const clamped = Math.min(sheetMaxHeight, Math.max(sheetMinHeight ?? fixedHeight, fixedHeight))
      const body = Math.max(0, clamped - chromeHeight - footerHeight)
      return {
        sheetHeight: clamped,
        bodyHeight: body,
        scrollable: false,
      }
    }

    const naturalHeight = chromeHeight + footerHeight + contentHeight
    const clamped = Math.min(
      sheetMaxHeight,
      Math.max(sheetMinHeight ?? naturalHeight, naturalHeight)
    )
    const body = Math.max(0, clamped - chromeHeight - footerHeight)

    return {
      sheetHeight: clamped,
      bodyHeight: body,
      scrollable: naturalHeight > sheetMaxHeight,
    }
  }, [
    usesSheetSizing,
    bodyScroll,
    chromeHeight,
    footerHeight,
    contentHeight,
    sheetMaxHeight,
    sheetMinHeight,
  ])

  const scrollContentContainerStyle = useMemo(() => {
    const base =
      usesSheetSizing && bodyHeight != null && !scrollable
        ? { minHeight: bodyHeight }
        : {}

    if (scrollExtraBottomPadding <= 0) {
      return Object.keys(base).length > 0 ? base : undefined
    }

    return {
      ...base,
      paddingBottom: 20 + scrollExtraBottomPadding,
    }
  }, [usesSheetSizing, bodyHeight, scrollable, scrollExtraBottomPadding])

  return (
    <View className="flex-1 justify-end">
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityLabel="Close modal"
      >
        <View className="flex-1 bg-ink-overlay" />
      </Pressable>
      <KeyboardAvoidingView
        style={[styles.sheetHost, { maxHeight: sheetMaxHeight }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        <View
          className="bg-surface rounded-t-[32px] border border-gray-200 border-b-0 overflow-hidden"
          style={[
            styles.sheet,
            usesSheetSizing && sheetHeight != null
              ? { height: sheetHeight, maxHeight: sheetMaxHeight }
              : { maxHeight: sheetMaxHeight },
          ]}
        >
          <View onLayout={onChromeLayout}>
            <View className="self-center w-10 h-1 rounded-full bg-gray-200 mt-3" />
            <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <View className="flex-1 pr-4">
                <Heading className="text-[22px]">{title}</Heading>
                {subtitle ? (
                  <Subtitle className="mt-1 text-sm text-gray-500">{subtitle}</Subtitle>
                ) : null}
              </View>
              <Pressable onPress={onClose} hitSlop={12}>
                <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-base font-bold text-ink">✕</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {bodyScroll ? (
            <ScrollView
              ref={scrollViewRef}
              className={cn(!usesSheetSizing && 'max-h-[560px]', scrollClassName)}
              style={
                usesSheetSizing && bodyHeight != null
                  ? scrollable
                    ? { height: bodyHeight }
                    : { minHeight: bodyHeight }
                  : undefined
              }
              contentContainerClassName="px-6 py-5 gap-5"
              contentContainerStyle={scrollContentContainerStyle}
              onContentSizeChange={usesSheetSizing ? (_, h) => setContentHeight(h) : undefined}
              scrollEnabled={usesSheetSizing ? scrollable : true}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              showsVerticalScrollIndicator={usesSheetSizing && scrollable}
            >
              {children}
            </ScrollView>
          ) : (
            <View
              className="px-6 py-5 flex-1"
              style={
                usesSheetSizing && bodyHeight != null ? { height: bodyHeight, flex: 1 } : { flex: 1 }
              }
            >
              {children}
            </View>
          )}

          {footer ? (
            <View
              className="px-6 pt-3 border-t border-gray-100 bg-gray-50"
              style={{ paddingBottom: footerBottomPadding }}
              onLayout={onFooterLayout}
            >
              {footer}
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  sheetHost: {
    width: '100%',
  },
  sheet: {
    width: '100%',
    flexDirection: 'column',
  },
})
