import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'
import {
  findNodeHandle,
  Keyboard,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { cn } from '@src/lib/cn'
import { useKeyboardInset } from '@src/hooks/useKeyboardInset'

type ScrollFieldContextValue = {
  scrollFieldIntoView: (field: View) => void
}

const ScrollFieldContext = createContext<ScrollFieldContextValue | null>(null)

export function useScrollFieldIntoView(): ScrollFieldContextValue | null {
  return useContext(ScrollFieldContext)
}

type Props = ViewProps & {
  children: ReactNode
  edges?: Edge[]
  /** White canvas instead of gray shell */
  variant?: 'canvas' | 'shell'
}

export function Screen({ children, className, edges = ['top'], variant = 'shell', ...props }: Props) {
  return (
    <SafeAreaView
      className={cn('flex-1', variant === 'canvas' ? 'bg-surface' : 'bg-gray-100', className)}
      edges={edges}
      {...props}
    >
      {children}
    </SafeAreaView>
  )
}

export function ScreenBody({ children, className, ...props }: ViewProps) {
  return (
    <View className={cn('flex-1', className)} {...props}>
      {children}
    </View>
  )
}

type ScreenScrollBodyProps = ScrollViewProps & {
  children: ReactNode
  className?: string
  contentContainerClassName?: string
}

/** Scrollable body for settings / card pages that can overflow on small screens. */
export function ScreenScrollBody({
  children,
  className,
  contentContainerClassName,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
  contentContainerStyle,
  ...props
}: ScreenScrollBodyProps) {
  const keyboardHeight = useKeyboardInset()
  const scrollRef = useRef<ScrollView>(null)
  const focusedField = useRef<View | null>(null)

  const scrollFieldIntoView = useCallback((field: View) => {
    focusedField.current = field
    const scrollNode = findNodeHandle(scrollRef.current)
    if (scrollNode == null) return
    field.measureLayout(
      scrollNode,
      (_x, y) => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true })
      },
      () => {},
    )
  }, [])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvent, () => {
      const field = focusedField.current
      if (!field) return
      requestAnimationFrame(() => scrollFieldIntoView(field))
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      focusedField.current = null
    })
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [scrollFieldIntoView])

  return (
    <ScrollFieldContext.Provider value={{ scrollFieldIntoView }}>
      <ScrollView
        ref={scrollRef}
        className={cn('flex-1', className)}
        contentContainerClassName={cn(
          'grow px-5 pt-2',
          keyboardHeight > 0 ? '' : 'pb-8',
          contentContainerClassName,
        )}
        contentContainerStyle={[
          contentContainerStyle,
          keyboardHeight > 0 ? { paddingBottom: keyboardHeight + 24 } : null,
        ]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        automaticallyAdjustKeyboardInsets
        {...props}
      >
        {children}
      </ScrollView>
    </ScrollFieldContext.Provider>
  )
}
