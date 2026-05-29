import { useCallback, useEffect, useMemo, useState } from 'react'

import { FlatList, Pressable, RefreshControl, TextInput, View } from 'react-native'

import { AppPressable } from '@/components/ui/AppPressable'

import { Chip } from '@/components/ui/Chip'

import { SafeAreaView } from 'react-native-safe-area-context'

import FontAwesome from '@expo/vector-icons/FontAwesome'

import { router, type Href } from 'expo-router'

import { ConversationRow } from '@/components/chat/ConversationRow'

import { Heading, Muted } from '@/components/ui/Typography'

import type { ChatListItem } from '@src/types/chat'

import Colors from '@src/theme/colors'

import { showError } from '@src/lib/toast'

import { fetchChats } from '@src/api/chats'

import { useChatSocket } from '@src/contexts/chat-socket-context'

import { useStore } from '@src/contexts/store-context'



function initialsFromPhone(phone: string) {

  const digits = phone.replace(/\D/g, '')

  const last2 = digits.slice(-2)

  return (last2 || 'WA').toUpperCase()

}



function formatTime(iso: string | null) {

  if (!iso) return ''

  return new Date(iso).toLocaleTimeString([], {

    hour: '2-digit',

    minute: '2-digit',

  })

}



function mapConversation(c: {

  id: string

  customer_wa_number: string

  last_message_at: string | null

  last_message_preview: string | null

  unread_count?: number

}): ChatListItem {

  const phone = c.customer_wa_number

  return {

    id: c.id,

    title: phone,

    subtitle: c.last_message_preview ?? '—',

    time: formatTime(c.last_message_at),

    unread: c.unread_count ?? 0,

    online: false,

    phone,

    initials: initialsFromPhone(phone),

  }

}



export default function MessagesListScreen() {

  const { store } = useStore()

  const { onConversationUpdated, onMessageNew } = useChatSocket()

  const [search, setSearch] = useState('')

  const [items, setItems] = useState<ChatListItem[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const [isRefreshing, setIsRefreshing] = useState(false)



  const loadChats = useCallback(async (refresh = false) => {

    if (!store?.id) return

    if (refresh) setIsRefreshing(true)

    else setIsLoading(true)



    try {

      const res = await fetchChats(store.id)

      setItems(res.data.chats.map(mapConversation))

    } catch (e: unknown) {

      showError('Failed to load chats', e instanceof Error ? e.message : 'Unknown error')

    } finally {

      setIsLoading(false)

      setIsRefreshing(false)

    }

  }, [store?.id])



  useEffect(() => {

    void loadChats()

  }, [loadChats])



  useEffect(() => {

    const unsubConversation = onConversationUpdated((payload) => {

      setItems((prev) => {

        const next = mapConversation(payload.conversation)

        const without = prev.filter((item) => item.id !== next.id)

        return [next, ...without]

      })

    })



    const unsubMessage = onMessageNew((payload) => {

      setItems((prev) => {

        const existing = prev.find((item) => item.id === payload.conversationId)

        if (!existing) {

          void loadChats(true)

          return prev

        }



        const time = formatTime(payload.message.timestamp)

        const updated: ChatListItem = {

          ...existing,

          subtitle: payload.message.text_body ?? `[${payload.message.type}]`,

          time,

          unread: payload.message.direction === 'inbound' ? existing.unread + 1 : existing.unread,

        }



        return [updated, ...prev.filter((item) => item.id !== updated.id)]

      })

    })



    return () => {

      unsubConversation()

      unsubMessage()

    }

  }, [onConversationUpdated, onMessageNew, loadChats])



  const conversations = useMemo(() => {

    let list = items

    const q = search.trim().toLowerCase()

    if (q) {

      list = list.filter(

        (c) =>

          c.title.toLowerCase().includes(q) ||

          c.phone.includes(q) ||

          c.subtitle.toLowerCase().includes(q)

      )

    }

    return list

  }, [items, search])



  return (

    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>

      <View className="flex-row items-center justify-between px-5 py-4 bg-surface">

        <Heading>Messages</Heading>

        <AppPressable hitSlop={12} onPress={() => void loadChats(true)}>

          <FontAwesome name="refresh" size={18} color={Colors.brand.primary} />

        </AppPressable>

      </View>



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

        <Chip label={isLoading ? 'Loading…' : 'All'} active onPress={() => {}} />

      </View>



      <FlatList

        data={conversations}

        keyExtractor={(item) => item.id}

        refreshControl={

          <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadChats(true)} />

        }

        renderItem={({ item }) => (

          <ConversationRow

            conversation={item}

            onPress={() =>

              router.push(

                ({

                  pathname: `/(store)/chats/${item.id}`,

                  params: { phone: item.phone },

                } as unknown) as Href

              )

            }

          />

        )}

        ListEmptyComponent={

          <View className="p-10 items-center">

            <Muted>

              {store?.id ? 'No conversations found' : 'Create a store to view messages'}

            </Muted>

          </View>

        }

        className="flex-1 bg-surface"

      />

    </SafeAreaView>

  )

}


