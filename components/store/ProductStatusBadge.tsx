import { Text, View } from 'react-native'
import { PRODUCT_STATUS_THEME } from '@src/lib/product-status'
import type { ProductStatus } from '@src/types/product'

type Props = {
  status: ProductStatus
}

export function ProductStatusBadge({ status }: Props) {
  const theme = PRODUCT_STATUS_THEME[status]
  return (
    <View
      className="px-2.5 py-1 rounded-full"
      style={{ backgroundColor: theme.badgeBg }}
    >
      <Text className="text-[12px] font-semibold" style={{ color: theme.badgeText }}>
        {theme.label}
      </Text>
    </View>
  )
}
