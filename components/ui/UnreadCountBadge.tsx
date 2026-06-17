import { Text, View, type ViewStyle } from 'react-native'
import Colors from '@src/theme/colors'

type Props = {
  count: number
  style?: ViewStyle
  className?: string
}

function formatCount(count: number): string {
  if (count > 99) return '99+'
  return String(count)
}

export function UnreadCountBadge({ count, style, className }: Props) {
  if (count <= 0) return null

  const label = formatCount(count)
  const isWide = label.length > 1

  return (
    <View
      className={className}
      style={[
        {
          minWidth: isWide ? 20 : 18,
          height: 18,
          paddingHorizontal: isWide ? 5 : 0,
          borderRadius: 9,
          backgroundColor: Colors.status.danger,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 11,
          fontWeight: '700',
          lineHeight: 13,
        }}
      >
        {label}
      </Text>
    </View>
  )
}
