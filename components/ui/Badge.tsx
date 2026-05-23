import { Text, View, type ViewProps } from 'react-native'
import { cn } from '@src/lib/cn'

type Tone = 'default' | 'active' | 'inactive' | 'success' | 'warning' | 'danger'

type Props = ViewProps & {
  label: string
  tone?: Tone
  className?: string
}

const toneClasses: Record<Tone, { wrap: string; text: string }> = {
  default: { wrap: 'border-ink bg-surface', text: 'text-ink' },
  active: { wrap: 'border-ink bg-brand-primary', text: 'text-brand-on-primary' },
  inactive: { wrap: 'border-ink bg-surface', text: 'text-ink' },
  success: { wrap: 'border-success bg-success-bg', text: 'text-success' },
  warning: { wrap: 'border-warning bg-warning-bg', text: 'text-warning' },
  danger: { wrap: 'border-danger bg-danger-bg', text: 'text-danger' },
}

export function Badge({ label, tone = 'default', className, ...props }: Props) {
  const t = toneClasses[tone]
  return (
    <View className={cn('px-2.5 py-1 rounded-full border', t.wrap, className)} {...props}>
      <Text className={cn('text-[11px] font-bold', t.text)}>{label}</Text>
    </View>
  )
}
