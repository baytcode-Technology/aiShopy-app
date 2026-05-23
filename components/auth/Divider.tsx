import { Text, View } from 'react-native'

export function Divider() {
  return (
    <View className="flex-row items-center gap-4 my-2">
      <View className="flex-1 h-px bg-gray-200" />
      <Text className="text-[11px] text-gray-400 uppercase tracking-[1.5px] font-bold">or</Text>
      <View className="flex-1 h-px bg-gray-200" />
    </View>
  )
}
