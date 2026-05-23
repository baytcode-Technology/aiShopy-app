import { Alert, Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@src/theme/colors'

export function GoogleButton() {
  const onPress = () => {
    Alert.alert('Coming soon', 'Google sign-in will be available in a future update.')
  }

  return (
    <Pressable
      className="flex-row items-center justify-center border border-gray-200 bg-surface py-3.5 px-4 rounded-[14px] gap-3 min-h-[52px] active:bg-gray-100 active:scale-[0.98]"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
    >
      <View className="w-6 items-center">
        <FontAwesome name="google" size={18} color={Colors.brand.primary} />
      </View>
      <Text className="text-[15px] font-semibold text-ink">Continue with Google</Text>
    </Pressable>
  )
}
