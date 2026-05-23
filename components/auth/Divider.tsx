import { View } from 'react-native'
import { Caption } from '@/components/ui/Typography'

export function Divider() {
  return (
    <View className="flex-row items-center gap-4 my-1">
      <View className="flex-1 h-px bg-gray-200" />
      <Caption className="text-[10px] uppercase tracking-[0.2em] text-gray-400">or</Caption>
      <View className="flex-1 h-px bg-gray-200" />
    </View>
  )
}
