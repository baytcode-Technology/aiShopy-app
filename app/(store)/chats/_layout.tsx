import { Stack } from 'expo-router'
import { ChatVoiceRecordingProvider } from '@src/contexts/chat-voice-recording-context'
import Colors from '@src/theme/colors'

export default function ChatsLayout() {
  return (
    <ChatVoiceRecordingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg.secondary },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
        <Stack.Screen name="support-ai" />
      </Stack>
    </ChatVoiceRecordingProvider>
  )
}
