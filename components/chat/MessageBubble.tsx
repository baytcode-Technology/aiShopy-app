import { StyleSheet, Text, View } from 'react-native'
import type { ChatMessage } from '@src/data/dummy-chats'
import { theme } from '@src/theme/colors'

type Props = {
  message: ChatMessage
}

export function MessageBubble({ message }: Props) {
  const outgoing = message.outgoing

  return (
    <View style={[styles.wrap, outgoing ? styles.wrapOut : styles.wrapIn]}>
      <View style={[styles.bubble, outgoing ? styles.bubbleOut : styles.bubbleIn]}>
        <Text style={[styles.text, outgoing ? styles.textOut : styles.textIn]}>{message.text}</Text>
        <Text style={[styles.time, outgoing ? styles.timeOut : styles.timeIn]}>{message.time}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12, maxWidth: '82%' },
  wrapIn: { alignSelf: 'flex-start' },
  wrapOut: { alignSelf: 'flex-end' },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleIn: {
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.gray200,
  },
  bubbleOut: {
    backgroundColor: theme.black,
  },
  text: { fontSize: 15, lineHeight: 21 },
  textIn: { color: theme.black },
  textOut: { color: theme.white },
  time: { fontSize: 11, alignSelf: 'flex-end' },
  timeIn: { color: theme.gray400 },
  timeOut: { color: theme.gray400 },
})
