import { Button } from '@/components/ui/Button'
import { Caption, Heading, Muted } from '@/components/ui/Typography'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { cn } from '@src/lib/cn'
import { shadows } from '@src/lib/shadows'
import Colors from '@src/theme/colors'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

type Props = {
  emoji: string
  title: string
  price: string
  subtitle?: string
  features: readonly string[]
  isCurrent?: boolean
  highlight?: boolean
  footer?: ReactNode
  className?: string
}

export function PlanCard({
  emoji,
  title,
  price,
  subtitle,
  features,
  isCurrent = false,
  highlight = false,
  footer,
  className,
}: Props) {
  return (
    <View
      className={cn(
        'rounded-[28px] border bg-surface overflow-hidden',
        highlight || isCurrent ? 'border-brand-primary' : 'border-gray-200',
        className
      )}
      style={shadows.card}
    >
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-2xl mb-2">{emoji}</Text>
            <Heading className="text-xl tracking-tight">{title}</Heading>
            <Text className="text-2xl font-extrabold text-ink mt-2">{price}</Text>
            {subtitle ? (
              <Muted className="mt-1.5 text-[13px] leading-5">{subtitle}</Muted>
            ) : null}
          </View>
          {isCurrent ? (
            <View className="rounded-full bg-brand-primary/10 px-3 py-1.5">
              <Caption className="text-[10px] uppercase tracking-widest text-brand-primary font-bold">
                Current
              </Caption>
            </View>
          ) : null}
        </View>
      </View>

      <View className="px-6 pb-2">
        {features.map((feature) => (
          <View key={feature} className="flex-row items-start gap-3 py-2">
            <FontAwesome
              name="check"
              size={12}
              color={Colors.brand.primary}
              style={{ marginTop: 3 }}
            />
            <Text className="flex-1 text-[14px] leading-5 text-ink">{feature}</Text>
          </View>
        ))}
      </View>

      {footer ? <View className="px-6 pb-6 pt-2">{footer}</View> : null}
    </View>
  )
}
