import { useMemo, useState } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, type Href } from 'expo-router'
import { ConversationRow } from '@/components/chat/ConversationRow'
import {
  DUMMY_CONVERSATIONS,
  filterConversations,
  type ConversationFilter,
} from '@src/data/dummy-chats'
import { theme } from '@src/theme/colors'
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Pressable hitSlop={12}>
          <FontAwesome name="ellipsis-v" size={18} color={theme.black} />
        </Pressable>
      </View>

      <Pressable
        style={styles.demoBanner}
        onPress={() =>
          showSuccess('Coming soon', 'WhatsApp Business Cloud API will connect here')
        }
      >
        <Text style={styles.demoBannerText}>Demo chats · Connect WhatsApp later</Text>
      </Pressable>

      <View style={styles.searchWrap}>
        <FontAwesome name="search" size={16} color={theme.gray400} style={styles.searchIcon} />
        <TextInput
          style={styles.search}
          placeholder="Search conversations..."
          placeholderTextColor={theme.gray400}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.chips}>
        {FILTERS.map((f) => {
          const active = filter === f.key
          return (
            <Pressable
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          )
        })}
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
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No conversations found</Text>
          </View>
        }
        style={styles.list}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.gray100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.white,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.black },
  demoBanner: {
    backgroundColor: theme.black,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  demoBannerText: { color: theme.white, fontSize: 12, fontWeight: '600' },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    position: 'relative',
  },
  searchIcon: { position: 'absolute', left: 14, top: 14, zIndex: 1 },
  search: {
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.gray200,
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 15,
    color: theme.black,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.gray200,
  },
  chipActive: {
    backgroundColor: theme.black,
    borderColor: theme.black,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.gray600 },
  chipTextActive: { color: theme.white },
  list: { flex: 1, backgroundColor: theme.white },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: theme.gray600, fontSize: 14 },
})
