import FontAwesome from '@expo/vector-icons/FontAwesome'
import { TextInput, View, type TextInputProps } from 'react-native'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'

type Props = TextInputProps & {
  className?: string
}

export function SearchField({ className, ...props }: Props) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-3 mx-6 mb-4 px-4 py-3.5 bg-surface rounded-2xl border border-gray-200',
        className
      )}
    >
      <FontAwesome name="search" size={16} color={Colors.text.muted} />
      <TextInput
        className="flex-1 text-[15px] font-medium text-ink"
        placeholderTextColor={Colors.text.muted}
        selectionColor={Colors.brand.primary}
        {...props}
      />
    </View>
  )
}
