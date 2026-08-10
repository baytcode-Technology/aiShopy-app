import { Text, View } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = {
  label: string
  variant?: 'inline' | 'sticky'
}

export function ChatDateSeparator({ label, variant = 'inline' }: Props) {
  const pill = (
    <View
      className={cn(
        'px-3 py-1.5 rounded-full border border-gray-200 shadow-sm',
        variant === 'sticky' ? 'bg-white/95' : 'bg-white/90',
      )}
    >
      <Text className="text-xs font-semibold text-gray-600">{label}</Text>
    </View>
  )

  if (variant === 'sticky') {
    return <View className="items-center">{pill}</View>
  }

  return <View className="items-center my-3">{pill}</View>
}
