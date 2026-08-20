import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Text, View } from 'react-native'
import { ConversationRow } from '@/components/chat/ConversationRow'
import { SearchBar } from '@/components/ui/SearchBar'
import { fetchChats, fetchInstagramChats } from '@src/api/chats'
import { showError, showSuccess } from '@src/lib/toast'
import type { ChatChannel, ChatListItem, ChatMessage } from '@src/types/chat'

function formatWaPhone(phone: string): string {
  const trimmed = phone.trim()
  if (!trimmed) return phone
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`
}

function mapWhatsAppConversation(c: {
  id: number
  customer_wa_number: string
  customer_name?: string | null
  last_message_at: string | null
  last_message_preview: string | null
  unread_count?: number
}): ChatListItem {
  const phone = c.customer_wa_number
  const name = c.customer_name?.trim()
  const title = name || formatWaPhone(phone)
  return {
    id: c.id,
    channel: 'whatsapp',
    title,
    subtitle: c.last_message_preview ?? '—',
    time: c.last_message_at
      ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    sortAt: c.last_message_at,
    unread: c.unread_count ?? 0,
    online: false,
    phone,
    initials: title.slice(0, 2).toUpperCase(),
  }
}

function mapInstagramConversation(c: {
  id: number
  customer_ig_id: string
  customer_ig_username: string | null
  last_message_at: string | null
  last_message_preview: string | null
  unread_count?: number
}): ChatListItem {
  const title = c.customer_ig_username
    ? `@${c.customer_ig_username}`
    : c.customer_ig_id
  return {
    id: c.id,
    channel: 'instagram',
    title,
    subtitle: c.last_message_preview ?? '—',
    time: c.last_message_at
      ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    sortAt: c.last_message_at,
    unread: c.unread_count ?? 0,
    online: false,
    phone: c.customer_ig_id,
    initials: title.slice(0, 2).toUpperCase(),
  }
}

type Props = {
  visible: boolean
  storeId: number
  sourceConversationId: number
  channel: ChatChannel
  message: ChatMessage | null
  onClose: () => void
  onForward: (input: { targetConversationId: number; targetPhone: string }) => Promise<void>
}

export function ForwardMessageModal({
  visible,
  storeId,
  sourceConversationId,
  channel,
  message,
  onClose,
  onForward,
}: Props) {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<ChatListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    try {
      if (channel === 'instagram') {
        const res = await fetchInstagramChats(storeId)
        setItems(
          res.data.chats
            .filter((c) => c.id !== sourceConversationId)
            .map(mapInstagramConversation),
        )
      } else {
        const res = await fetchChats(storeId)
        setItems(
          res.data.chats
            .filter((c) => c.id !== sourceConversationId)
            .map(mapWhatsAppConversation),
        )
      }
    } catch (e: unknown) {
      showError('Failed to load chats', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [storeId, sourceConversationId, channel])

  useEffect(() => {
    if (visible) void load()
  }, [visible, load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q),
    )
  }, [items, search])

  const handleSelect = async (item: ChatListItem) => {
    if (!message || sending) return
    setSending(true)
    try {
      await onForward({ targetConversationId: item.id, targetPhone: item.phone })
      showSuccess('Message forwarded')
      onClose()
    } catch (e: unknown) {
      showError('Forward failed', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-gray-100 pt-12">
        <View className="px-4 pb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-ink">Forward to</Text>
          <Text className="text-brand-primary font-semibold" onPress={onClose}>
            Cancel
          </Text>
        </View>
        <View className="px-4 pb-3">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search chats" />
        </View>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#111" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => `${item.channel}-${item.id}`}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 mt-10">No conversations found</Text>
            }
            renderItem={({ item }) => (
              <ConversationRow
                conversation={item}
                onPress={() => void handleSelect(item)}
              />
            )}
          />
        )}
      </View>
    </Modal>
  )
}
