import { Text, View, type ViewProps } from 'react-native'
import { cn } from '@src/lib/cn'

type Tone = 'default' | 'emphasis' | 'muted' | 'outline' | 'active' | 'inactive'

type Props = ViewProps & {
  label: string
  tone?: Tone
  className?: string
}

const toneClasses: Record<Tone, { wrap: string; text: string }> = {
  default: { wrap: 'bg-gray-100 border-gray-200', text: 'text-ink' },
  emphasis: { wrap: 'bg-brand-primary border-brand-primary', text: 'text-brand-on-primary' },
  active: { wrap: 'bg-brand-primary border-brand-primary', text: 'text-brand-on-primary' },
  muted: { wrap: 'bg-gray-50 border-gray-200', text: 'text-gray-600' },
  inactive: { wrap: 'bg-gray-50 border-gray-200', text: 'text-gray-600' },
  outline: { wrap: 'bg-surface border-ink', text: 'text-ink' },
}

export function Badge({ label, tone = 'default', className, ...props }: Props) {
  const t = toneClasses[tone] ?? toneClasses.default

  return (
    <View className={cn('px-2.5 py-1 rounded-full border', t.wrap, className)} {...props}>
      <Text className={cn('text-[10px] font-bold uppercase tracking-wide', t.text)}>
        {label}
      </Text>
    </View>
  )
}
