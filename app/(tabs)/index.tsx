import { StyleSheet, Text, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { theme } from '@src/theme/colors'
import { env } from '@src/config/env'

export default function HomeScreen() {
  const { user, signOut } = useAuth()
  const { store, subdomainUrl, clearStore } = useStore()

  const domainLabel = store
    ? `${store.slug}.${env.storefrontBaseDomain}`
    : subdomainUrl?.replace(/^https?:\/\//, '') ?? null

  const handleSignOut = async () => {
    await clearStore()
    await signOut()
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.brand}>Katlogue</Text>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>
          {user?.email ? `Signed in as ${user.email}` : 'You are signed in.'}
        </Text>

        {store ? (
          <View style={styles.card}>
            <Text style={styles.cardBadge}>Active store session</Text>
            <Text style={styles.cardTitle}>{store.name}</Text>
            <Text style={styles.cardMeta}>Slug: {store.slug}</Text>
            {domainLabel ? <Text style={styles.cardUrl}>{domainLabel}</Text> : null}
            {store.currency ? (
              <Text style={styles.cardMeta}>Currency: {store.currency}</Text>
            ) : null}
            {store.timezone ? (
              <Text style={styles.cardMeta}>Timezone: {store.timezone}</Text>
            ) : null}
            <Text style={styles.cardHint}>You are managing this store in the app.</Text>
          </View>
        ) : null}

        <Pressable style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.white,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: theme.black,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.gray600,
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.black,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  cardBadge: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.gray600,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.black,
  },
  cardMeta: {
    fontSize: 14,
    color: theme.gray600,
  },
  cardUrl: {
    fontSize: 13,
    color: theme.black,
  },
  cardHint: {
    fontSize: 13,
    color: theme.gray600,
    marginTop: 4,
  },
  button: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.black,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.black,
  },
})
