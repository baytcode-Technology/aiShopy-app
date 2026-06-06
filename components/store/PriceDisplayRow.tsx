import { Text, View } from 'react-native'

type Props = {
  currencySymbol: string
  price: number
  compareAtPrice?: number | null
  size?: 'md' | 'lg'
  className?: string
}

export function PriceDisplayRow({
  currencySymbol,
  price,
  compareAtPrice,
  size = 'md',
  className,
}: Props) {
  const mainSize = size === 'lg' ? 'text-[18px]' : 'text-[13px]'
  const compareSize = size === 'lg' ? 'text-[16px]' : 'text-[12px]'

  return (
    <View className={`flex-row items-baseline gap-2.5 ${className ?? ''}`}>
      {compareAtPrice != null && compareAtPrice > 0 ? (
        <Text className={`${compareSize} font-bold text-gray-400 line-through`}>
          {currencySymbol}
          {compareAtPrice}
        </Text>
      ) : null}
      <Text className={`${mainSize} font-extrabold text-ink tracking-tight`}>
        {currencySymbol}
        {price}
      </Text>
    </View>
  )
}
