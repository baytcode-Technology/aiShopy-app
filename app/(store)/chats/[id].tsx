import { useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams } from 'expo-router'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { DUMMY_MESSAGES, getConversation } from '@src/data/dummy-chats'
import { theme } from '@src/theme/colors'

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const conversation = getConversation(typeof id === 'string' ? id : '')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(
    () => DUMMY_MESSAGES[typeof id === 'string' ? id : ''] ?? []
  )

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Conversation not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const sendMessage = () => {
    const text = draft.trim()
    if (!text) return
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, text, time, outgoing: true },
    ])
    setDraft('')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <FontAwesome name="chevron-left" size={18} color={theme.white} />
        </Pressable>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerInitials}>{conversation.initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{conversation.name}</Text>
          <Text style={styles.headerStatus}>
            {conversation.online ? 'Online' : conversation.phone}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <FontAwesome name="phone" size={18} color={theme.white} style={styles.headerIcon} />
          <FontAwesome name="video-camera" size={18} color={theme.white} style={styles.headerIcon} />
          <FontAwesome name="ellipsis-v" size={18} color={theme.white} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messages}
          inverted={false}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor={theme.gray400}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={2000}
          />
          <Pressable style={styles.sendBtn} onPress={sendMessage}>
            <FontAwesome name="send" size={16} color={theme.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.gray100 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.black,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.gray600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInitials: { color: theme.white, fontWeight: '700', fontSize: 14 },
  headerInfo: { flex: 1 },
  headerName: { color: theme.white, fontSize: 16, fontWeight: '700' },
  headerStatus: { color: theme.gray400, fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: 14 },
  messages: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.white,
    borderTopWidth: 1,
    borderTopColor: theme.gray200,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.gray200,
    backgroundColor: theme.gray100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.black,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { textAlign: 'center', marginTop: 40, color: theme.black },
  backLink: { textAlign: 'center', marginTop: 16, color: theme.gray600 },
})
