import { StyleSheet, Text, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useStore } from '@src/contexts/store-context'
import { theme } from '@src/theme/colors'
import { showSuccess } from '@src/lib/toast'

export default function ChatsScreen() {
  const { store } = useStore()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <FontAwesome name="ellipsis-v" size={18} color={theme.black} />
      </View>

      <View style={styles.body}>
        <View style={styles.emptyCard}>
          <View style={styles.iconWrap}>
            <FontAwesome name="comment" size={32} color={theme.black} />
          </View>
          <Text style={styles.emptyTitle}>WhatsApp not connected</Text>
          <Text style={styles.emptyText}>
            Connect your WhatsApp number for {store?.name ?? 'your store'} to receive customer
            messages here.
          </Text>
          <Pressable
            style={styles.connectBtn}
            onPress={() => showSuccess('Coming soon', 'WhatsApp connection will be added later')}
          >
            <Text style={styles.connectBtnText}>Connect your WhatsApp number</Text>
          </Pressable>
        </View>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.black },
  body: { flex: 1, padding: 20, justifyContent: 'center' },
  emptyCard: {
    backgroundColor: theme.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.gray200,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.black },
  emptyText: { fontSize: 14, color: theme.gray600, textAlign: 'center', lineHeight: 20 },
  connectBtn: {
    marginTop: 12,
    backgroundColor: theme.black,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  connectBtnText: { color: theme.white, fontWeight: '600', fontSize: 15 },
})
