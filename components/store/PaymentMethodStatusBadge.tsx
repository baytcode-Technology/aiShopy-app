import { Text, View } from 'react-native'
import { PRODUCT_STATUS_THEME } from '@src/lib/product-status'
import type { RazorpayMode } from '@src/types/payment-config'

type Props = {
  enabled: boolean
  mode?: RazorpayMode
}

function StatusPill({
  label,
  badgeBg,
  badgeText,
}: {
  label: string
  badgeBg: string
  badgeText: string
}) {
  return (
    <View
      className="px-2.5 py-1 rounded-full"
      style={{ backgroundColor: badgeBg }}
    >
      <Text className="text-[12px] font-semibold" style={{ color: badgeText }}>
        {label}
      </Text>
    </View>
  )
}

export function PaymentMethodStatusBadge({ enabled, mode }: Props) {
  const theme = enabled
    ? PRODUCT_STATUS_THEME.active
    : PRODUCT_STATUS_THEME.unlisted

  const modeLabel =
    mode === 'live' ? 'Live mode' : mode === 'test' ? 'Test mode' : null

  return (
    <View className="flex-row items-center gap-2 flex-wrap">
      <StatusPill
        label={enabled ? 'Enabled' : 'Disabled'}
        badgeBg={theme.badgeBg}
        badgeText={theme.badgeText}
      />
      {enabled && modeLabel ? (
        <StatusPill
          label={modeLabel}
          badgeBg={PRODUCT_STATUS_THEME.active.badgeBg}
          badgeText={PRODUCT_STATUS_THEME.active.badgeText}
        />
      ) : null}
    </View>
  )
}
