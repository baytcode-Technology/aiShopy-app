import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { theme } from '@src/theme/colors'

export function GoogleButton() {
  const onPress = () => {
    Alert.alert('Coming soon', 'Google sign-in will be available in a future update.')
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
    >
      <View style={styles.iconWrap}>
        <FontAwesome name="google" size={18} color={theme.black} />
      </View>
      <Text style={styles.label}>Continue with Google</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.gray200,
    backgroundColor: theme.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 12,
    minHeight: 52,
  },
  pressed: {
    backgroundColor: theme.gray100,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.black,
  },
})
