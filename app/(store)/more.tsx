import { StyleSheet, Text, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { theme } from '@src/theme/colors'
import { env } from '@src/config/env'

export default function MoreScreen() {
  const { user, signOut } = useAuth()
  const { store, clearStore } = useStore()

  const handleSignOut = async () => {
    await clearStore()
    await signOut()
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar} />
        <View style={styles.profileText}>
          <Text style={styles.profileName}>{store?.name ?? 'Your store'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>STORE</Text>
        <View style={styles.card}>
          <Text style={styles.rowTitle}>Domain</Text>
          <Text style={styles.rowSub}>
            {store?.slug}.{env.storefrontBaseDomain}
          </Text>
        </View>
      </View>

      <Pressable style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.gray100 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.black },
  profileCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: theme.black,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.gray600,
  },
  profileText: { flex: 1 },
  profileName: { color: theme.white, fontSize: 18, fontWeight: '700' },
  profileEmail: { color: theme.gray400, fontSize: 13, marginTop: 4 },
  section: { paddingHorizontal: 16, gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.gray600,
  },
  card: {
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.gray200,
    padding: 16,
  },
  rowTitle: { fontSize: 15, fontWeight: '600', color: theme.black },
  rowSub: { fontSize: 13, color: theme.gray600, marginTop: 4 },
  signOut: { marginTop: 32, alignItems: 'center', padding: 16 },
  signOutText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },
})
