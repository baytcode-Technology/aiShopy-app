import { ReactNode } from 'react'
import { SleekModal } from '@/components/ui/Modal'

type Props = {
  visible: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function FormModal({ visible, title, subtitle, onClose, children, footer }: Props) {
  return (
    <SleekModal
      isOpen={visible}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={footer}
    >
      {children}
    </SleekModal>
  )
}
