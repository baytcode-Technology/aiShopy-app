import { Text, View } from 'react-native'

type Props = {
  label: string
}

export function ChatDateSeparator({ label }: Props) {
  return (
    <View className="items-center my-3">
      <View className="px-3 py-1.5 rounded-full bg-white/90 border border-gray-200 shadow-sm">
        <Text className="text-xs font-semibold text-gray-600">{label}</Text>
      </View>
    </View>
  )
}
