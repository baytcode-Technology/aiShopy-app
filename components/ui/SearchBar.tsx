import FontAwesome from '@expo/vector-icons/FontAwesome'
import { TextInput, View, type TextInputProps } from 'react-native'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'
import { shadows } from '@src/lib/shadows'

type Props = TextInputProps & {
  className?: string
}

/** Premium catalog search — white pill, soft shadow. */
export function SearchBar({ className, ...props }: Props) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-3 mx-5 mb-1 px-4 py-3.5 bg-surface rounded-[22px] border border-gray-200',
        className
      )}
      style={shadows.sm}
    >
      <FontAwesome name="search" size={15} color={Colors.text.muted} />
      <TextInput
        className="flex-1 text-[16px] font-medium text-ink py-0.5"
        placeholderTextColor={Colors.text.muted}
        selectionColor={Colors.brand.primary}
        {...props}
      />
    </View>
  )
}
