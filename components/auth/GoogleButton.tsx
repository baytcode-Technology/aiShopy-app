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
    borderColor: theme.black,
    backgroundColor: theme.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  pressed: {
    backgroundColor: theme.gray100,
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.black,
  },
})
