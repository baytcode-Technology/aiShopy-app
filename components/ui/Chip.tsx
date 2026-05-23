import { Pressable, Text, View } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = {
  label: string
  active?: boolean
  onPress: () => void
  className?: string
}

export function Chip({ label, active = false, onPress, className }: Props) {
  return (
    <Pressable onPress={onPress} className="mr-1">
      <View
        className={cn(
          'border rounded-full px-4 py-2',
          active ? 'bg-brand-primary border-brand-primary' : 'bg-surface border-gray-200',
          className
        )}
      >
        <Text
          className={cn(
            'text-[13px] font-bold',
            active ? 'text-brand-on-primary' : 'text-gray-600'
          )}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  )
}
