import { TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@src/theme/colors'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function OrderSearchBar({ value, onChangeText, placeholder = 'Search' }: Props) {
  return (
    <View className="flex-row items-center gap-2.5 border border-gray-200 rounded-2xl px-3.5 bg-gray-50">
      <FontAwesome name="search" size={15} color={Colors.text.muted} />
      <TextInput
        className="flex-1 py-3 text-[15px] text-ink"
        placeholder={placeholder}
        placeholderTextColor={Colors.text.muted}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  )
}
