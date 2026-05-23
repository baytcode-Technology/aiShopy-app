import { useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams } from 'expo-router'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { IconButton } from '@/components/ui/IconButton'
import { LinkText, Muted } from '@/components/ui/Typography'
import { DUMMY_MESSAGES, getConversation } from '@src/data/dummy-chats'
import Colors from '@src/theme/colors'

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const conversation = getConversation(typeof id === 'string' ? id : '')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(
    () => DUMMY_MESSAGES[typeof id === 'string' ? id : ''] ?? []
  )

  if (!conversation) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center">
        <Text className="text-center mt-10 text-ink font-semibold">Conversation not found</Text>
        <Pressable className="mt-4" onPress={() => router.back()}>
          <LinkText>Go back</LinkText>
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
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex-row items-center px-3 py-3 bg-brand-primary gap-2.5">
        <Pressable className="p-1" onPress={() => router.back()} hitSlop={12}>
          <FontAwesome name="chevron-left" size={18} color={Colors.brand.onPrimary} />
        </Pressable>
        <View className="w-10 h-10 rounded-full bg-gray-600 items-center justify-center">
          <Text className="text-brand-on-primary font-bold text-sm">
            {conversation.initials}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-brand-on-primary text-base font-bold">{conversation.name}</Text>
          <Muted className="text-gray-400 text-xs mt-0.5">
            {conversation.online ? 'Online' : conversation.phone}
          </Muted>
        </View>
        <View className="flex-row items-center gap-3.5">
          <FontAwesome name="phone" size={18} color={Colors.brand.onPrimary} />
          <FontAwesome name="video-camera" size={18} color={Colors.brand.onPrimary} />
          <FontAwesome name="ellipsis-v" size={18} color={Colors.brand.onPrimary} />
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerClassName="p-4 pb-2 flex-grow"
        />

        <View className="flex-row items-end gap-2.5 px-3 py-2.5 bg-surface border-t border-gray-200">
          <TextInput
            className="flex-1 min-h-11 max-h-[100px] rounded-full border border-gray-200 bg-gray-100 px-4 py-2.5 text-[15px] text-ink"
            placeholder="Type a message"
            placeholderTextColor={Colors.text.muted}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={2000}
          />
          <IconButton
            className="bg-brand-primary border-0 w-11 h-11"
            onPress={sendMessage}
          >
            <FontAwesome name="send" size={16} color={Colors.brand.onPrimary} />
          </IconButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
