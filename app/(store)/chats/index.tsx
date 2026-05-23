import { useMemo, useState } from 'react'
import { FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { AppPressable } from '@/components/ui/AppPressable'
import { Chip } from '@/components/ui/Chip'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, type Href } from 'expo-router'
import { ConversationRow } from '@/components/chat/ConversationRow'
import { Heading, Muted } from '@/components/ui/Typography'
import {
  DUMMY_CONVERSATIONS,
  filterConversations,
  type ConversationFilter,
} from '@src/data/dummy-chats'
import Colors from '@src/theme/colors'
import { showSuccess } from '@src/lib/toast'

const FILTERS: { key: ConversationFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'orders', label: 'Orders' },
  { key: 'priority', label: 'Priority' },
]

export default function MessagesListScreen() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ConversationFilter>('all')

  const conversations = useMemo(() => {
    let list = filterConversations(DUMMY_CONVERSATIONS, filter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      )
    }
    return list
  }, [filter, search])

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 py-4 bg-surface">
        <Heading>Messages</Heading>
        <Pressable hitSlop={12}>
          <FontAwesome name="ellipsis-v" size={18} color={Colors.brand.primary} />
        </Pressable>
      </View>

      <AppPressable
        containerClassName="bg-brand-primary py-2.5 px-4 items-center"
        onPress={() =>
          showSuccess('Coming soon', 'WhatsApp Business Cloud API will connect here')
        }
      >
        <Text className="text-brand-on-primary text-xs font-semibold">
          Demo chats · Connect WhatsApp later
        </Text>
      </AppPressable>

      <View className="mx-4 mt-3 mb-2 relative">
        <FontAwesome
          name="search"
          size={16}
          color={Colors.text.muted}
          style={{ position: 'absolute', left: 14, top: 14, zIndex: 1 }}
        />
        <TextInput
          className="bg-surface rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-[15px] text-ink"
          placeholder="Search conversations..."
          placeholderTextColor={Colors.text.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View className="flex-row gap-2 px-4 pb-3">
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            onPress={() => router.push(`/(store)/chats/${item.id}` as Href)}
          />
        )}
        ListEmptyComponent={
          <View className="p-10 items-center">
            <Muted>No conversations found</Muted>
          </View>
        }
        className="flex-1 bg-surface"
      />
    </SafeAreaView>
  )
}
