import { Alert, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AppPressable } from '@/components/ui/AppPressable'
import Colors from '@src/theme/colors'

export function GoogleButton() {
  const onPress = () => {
    Alert.alert('Coming soon', 'Google sign-in will be available in a future update.')
  }

  return (
    <AppPressable
      containerClassName="flex-row items-center justify-center border border-gray-200 bg-gray-50 py-4 px-4 rounded-2xl gap-3 min-h-[52px]"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
    >
      <View className="w-6 items-center">
        <FontAwesome name="google" size={18} color={Colors.brand.primary} />
      </View>
      <Text className="text-[15px] font-semibold text-ink">Continue with Google</Text>
    </AppPressable>
  )
}
