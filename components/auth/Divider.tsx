import { StyleSheet, Text, View } from 'react-native'
import { theme } from '@src/theme/colors'

export function Divider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>or</Text>
      <View style={styles.line} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.gray200,
  },
  text: {
    fontSize: 13,
    color: theme.gray400,
    textTransform: 'lowercase',
  },
})
