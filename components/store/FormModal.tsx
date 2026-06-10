import type { ReactNode } from 'react'
import type { ScrollView } from 'react-native'
import { SleekModal } from '@/components/ui/Modal'
import type { RefObject } from 'react'

type Props = {
  visible: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  scrollViewRef?: RefObject<ScrollView | null>
}

export function FormModal({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
  scrollViewRef,
}: Props) {
  return (
    <SleekModal
      isOpen={visible}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={footer}
      scrollViewRef={scrollViewRef}
    >
      {children}
    </SleekModal>
  )
}
