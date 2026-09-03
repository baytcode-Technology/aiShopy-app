import { LegalScreen, LegalSection } from '@/components/legal/LegalScreen'
import { Body, Muted } from '@/components/ui/Typography'
import { PRIVACY_POLICY_URL, SUPPORT_EMAIL } from '@src/lib/support-contact'
import { router, type Href } from 'expo-router'
import { Pressable, View } from 'react-native'

const DATA_SENT = [
  'Customer messages and conversation history from connected WhatsApp and Instagram inboxes',
  'Your product catalog, store name, and storefront links',
  'Custom instructions you add in Chat Boat settings',
]

export default function AiPrivacyScreen() {
  return (
    <LegalScreen
      title="AI & data privacy"
      subtitle="What Chat Boat shares with AI providers"
      lastUpdated="3 Sep 2026"
    >
      <LegalSection title="When this applies">
        Chat Boat is optional. Data is sent to a third-party AI provider only after you enable Chat
        Boat and agree to the in-app consent screen. If Chat Boat is off, we do not send customer
        messages to those providers for auto-replies.
      </LegalSection>

      <LegalSection title="What data is sent">
        When Chat Boat is enabled, the following may be sent to generate a reply:
      </LegalSection>

      <View className="gap-1.5 -mt-2">
        {DATA_SENT.map((item) => (
          <Muted key={item} className="text-sm leading-5">
            • {item}
          </Muted>
        ))}
      </View>

      <LegalSection title="Who receives the data">
        Providers: OpenAI (gpt-4o-mini) and/or TokenBee (OpenAIGPT4oMini / OpenAI gpt-4o-mini, as configured by AiShopy).
        They process this data only to generate reply text for your store.
      </LegalSection>

      <LegalSection title="Your permission and controls">
        We ask for your explicit permission in the app before enabling Chat Boat. You can turn Chat
        Boat off at any time, or take over any chat manually from the inbox. You can also delete
        your account from Settings → Delete account.
      </LegalSection>

      <LegalSection title="Training behavior">
        We use OpenAI's API, which does not use your data to train their models by default.
      </LegalSection>

      <LegalSection title="Privacy policy">
        Our Privacy Policy describes what we collect, how we use it, and which third parties process
        data on our behalf.
      </LegalSection>

      <Pressable onPress={() => router.push('/privacy-policy' as Href)}>
        <Body className="text-ink font-semibold underline">Read the Privacy Policy</Body>
      </Pressable>

      <Muted className="text-xs leading-5">
        Website copy: {PRIVACY_POLICY_URL}. Questions: {SUPPORT_EMAIL}.
      </Muted>
    </LegalScreen>
  )
}
