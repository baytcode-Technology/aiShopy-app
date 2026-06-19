import { Caption, Heading, Muted } from '@/components/ui/Typography'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { cn } from '@src/lib/cn'
import { shadows } from '@src/lib/shadows'
import Colors from '@src/theme/colors'
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'

type PlanCardTone = 'default' | 'starter-limited' | 'trial-offer'

type Props = {
  emoji: string
  title: string
  price: string
  compareAtPrice?: string
  subtitle?: string
  features: readonly string[]
  isCurrent?: boolean
  selected?: boolean
  tone?: PlanCardTone
  onPress?: () => void
  footer?: ReactNode
  className?: string
}

export function PlanCard({
  emoji,
  title,
  price,
  compareAtPrice,
  subtitle,
  features,
  isCurrent = false,
  selected = false,
  tone = 'default',
  onPress,
  footer,
  className,
}: Props) {
  const isStarterLimited = tone === 'starter-limited'
  const isTrialOffer = tone === 'trial-offer' && !!compareAtPrice

  const card = (
    <View
      className={cn(
        'rounded-[28px] border bg-surface overflow-hidden',
        isStarterLimited
          ? selected
            ? 'border-[#EF4444] bg-[#FEF2F2]'
            : 'border-[#FECACA] bg-[#FEF2F2]'
          : isTrialOffer && selected
            ? 'border-brand-green bg-[#E8F8EC]'
            : selected
              ? 'border-brand-primary'
              : 'border-gray-200',
        className
      )}
      style={shadows.card}
    >
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-2xl mb-2">{emoji}</Text>
            <Heading className="text-xl tracking-tight">{title}</Heading>

            {isTrialOffer ? (
              <View className="mt-3">
                <Text className="text-[17px] font-semibold text-gray-500 line-through">
                  {compareAtPrice}
                </Text>
                <View className="flex-row items-center flex-wrap gap-2 mt-1">
                  <Text
                    className="text-[28px] font-extrabold leading-8"
                    style={{ color: Colors.brand.green }}
                  >
                    {price}
                  </Text>
                  <View className="rounded-full bg-brand-green/15 px-2.5 py-1">
                    <Caption className="text-[10px] uppercase tracking-widest text-brand-green font-bold">
                      1st month
                    </Caption>
                  </View>
                </View>
              </View>
            ) : (
              <Text className="text-2xl font-extrabold text-ink mt-2">{price}</Text>
            )}

            {subtitle ? (
              <Muted className="mt-1.5 text-[13px] leading-5">{subtitle}</Muted>
            ) : null}
          </View>

          {isStarterLimited && isCurrent ? (
            <View className="rounded-full bg-[#FEE2E2] px-3 py-1.5">
              <Caption className="text-[10px] uppercase tracking-widest text-[#EF4444] font-bold">
                Limited
              </Caption>
            </View>
          ) : isCurrent ? (
            <View
              className={cn(
                'rounded-full px-3 py-1.5',
                isStarterLimited ? 'bg-[#FEE2E2]' : 'bg-brand-primary/10'
              )}
            >
              <Caption
                className={cn(
                  'text-[10px] uppercase tracking-widest font-bold',
                  isStarterLimited ? 'text-[#EF4444]' : 'text-brand-primary'
                )}
              >
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
              color={isStarterLimited ? '#EF4444' : Colors.brand.primary}
              style={{ marginTop: 3 }}
            />
            <Text className="flex-1 text-[14px] leading-5 text-ink">{feature}</Text>
          </View>
        ))}
      </View>

      {footer ? <View className="px-6 pb-6 pt-2">{footer}</View> : null}
    </View>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {card}
      </Pressable>
    )
  }

  return card
}
