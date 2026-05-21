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
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.black, letterSpacing: -0.5 },
  profileCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    backgroundColor: theme.black,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.gray600,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  profileText: { flex: 1 },
  profileName: { color: theme.white, fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  profileEmail: { color: theme.gray400, fontSize: 13, marginTop: 4, fontWeight: '500' },
  section: { paddingHorizontal: 16, gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: theme.gray600,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: theme.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.gray200,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  rowTitle: { fontSize: 15, fontWeight: '700', color: theme.black },
  rowSub: { fontSize: 13, color: theme.gray600, marginTop: 6, fontWeight: '500' },
  signOut: {
    marginTop: 36,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  signOutText: { color: '#EF4444', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },
})
