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

import { cn } from '@src/lib/cn'

import { Heading, Subtitle } from './Typography'

import type { ScrollView as RNScrollView } from 'react-native'

import type { RefObject } from 'react'



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

}



export function SleekModal({

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

}: Props) {

  const { height: windowHeight } = useWindowDimensions()

  const usesSheetSizing = minHeightRatio != null || maxHeightRatio != null

  const sheetMinHeight = minHeightRatio != null ? windowHeight * minHeightRatio : undefined

  const sheetMaxHeight =

    maxHeightRatio != null ? windowHeight * maxHeightRatio : windowHeight * 0.92



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

    chromeHeight,

    footerHeight,

    contentHeight,

    sheetMaxHeight,

    sheetMinHeight,

  ])



  return (

    <RNModal

      visible={isOpen}

      animationType="slide"

      transparent

      presentationStyle="overFullScreen"

      statusBarTranslucent

      onRequestClose={onClose}

    >

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

              contentContainerStyle={

                usesSheetSizing && bodyHeight != null && !scrollable

                  ? { minHeight: bodyHeight }

                  : undefined

              }

              onContentSizeChange={usesSheetSizing ? (_, h) => setContentHeight(h) : undefined}

              scrollEnabled={usesSheetSizing ? scrollable : true}

              keyboardShouldPersistTaps="handled"

              automaticallyAdjustKeyboardInsets

              showsVerticalScrollIndicator={usesSheetSizing && scrollable}

            >

              {children}

            </ScrollView>



            {footer ? (

              <View

                className="px-6 pt-3 pb-7 border-t border-gray-100 bg-gray-50"

                onLayout={onFooterLayout}

              >

                {footer}

              </View>

            ) : null}

          </View>

        </KeyboardAvoidingView>

      </View>

    </RNModal>

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


