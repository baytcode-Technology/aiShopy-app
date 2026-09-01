import { useCallback, useEffect, useState } from 'react'
import { router } from 'expo-router'
import { ActivityIndicator, Switch, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AiThirdPartyConsentModal } from '@/components/store/AiThirdPartyConsentModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Heading, Label, Muted } from '@/components/ui/Typography'
import {
  fetchInboxAiSettings,
  previewInboxAiReply,
  updateInboxAiSettings,
  type InboxAiPreviewResult,
} from '@src/api/inbox-ai'
import { useStore } from '@src/contexts/store-context'
import { hasPremiumAccess } from '@src/lib/subscription'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import { shadows } from '@src/lib/shadows'

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Malayalam', 'Arabic']

const CUSTOM_PROMPT_PLACEHOLDER = `Examples you can copy:
• Call every customer sir or saar — warm shop tone
• Free delivery above ₹999 within Kerala
• COD available — ask size before confirming
• Reply in Manglish when customer writes Manglish (undo?, ethu size?)`

const PREVIEW_EXAMPLES = ['blue shirt undo?', 'ok', 'order cheyyam', 'where is my order']

function scriptStyleLabel(style: InboxAiPreviewResult['scriptStyle']): string {
  if (style === 'malayalam_script') return 'Malayalam script'
  if (style === 'latin') return 'Manglish / Latin'
  return 'Other'
}

export default function ChatBoatScreen() {
  const { store, refreshStore } = useStore()
  const premium = store ? hasPremiumAccess(store) : false

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [consentModalOpen, setConsentModalOpen] = useState(false)
  const [pendingConsentEnable, setPendingConsentEnable] = useState(false)
  const [language, setLanguage] = useState('English')
  const [customPrompt, setCustomPrompt] = useState('')

  const [previewMessage, setPreviewMessage] = useState('')
  const [previewChannel, setPreviewChannel] = useState<'whatsapp' | 'instagram'>('whatsapp')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewResult, setPreviewResult] = useState<InboxAiPreviewResult | null>(null)

  const load = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const res = await fetchInboxAiSettings(store.id)
      setEnabled(res.data.ai_auto_reply_enabled)
      setHasConsent(res.data.ai_third_party_consented)
      setLanguage(res.data.ai_language?.trim() || 'English')
      setCustomPrompt(res.data.ai_system_prompt ?? '')
    } catch (e) {
      showError(e, 'Could not load Chat Boat settings')
    } finally {
      setLoading(false)
    }
  }, [store?.id])

  useEffect(() => {
    void load()
  }, [load])

  const saveSettings = async (options?: { grantConsent?: boolean }) => {
    if (!store?.id) return
    if (enabled && !premium) {
      router.push('/subscription' as never)
      return
    }
    setSaving(true)
    try {
      await updateInboxAiSettings(store.id, {
        ai_auto_reply_enabled: enabled,
        ai_language: language,
        ai_system_prompt: customPrompt.trim() || null,
        ...(options?.grantConsent ? { ai_third_party_consent: true } : {}),
      })
      if (options?.grantConsent) {
        setHasConsent(true)
      }
      await refreshStore({ silent: true })
      showSuccess('Chat Boat settings saved')
      setConsentModalOpen(false)
      setPendingConsentEnable(false)
    } catch (e) {
      showError(e, 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => {
    if (enabled && !hasConsent) {
      setPendingConsentEnable(true)
      setConsentModalOpen(true)
      return
    }
    void saveSettings()
  }

  const handleToggleEnabled = (next: boolean) => {
    if (next && !hasConsent) {
      setPendingConsentEnable(true)
      setConsentModalOpen(true)
      return
    }
    setEnabled(next)
  }

  const handleConsentAgree = () => {
    setEnabled(true)
    void saveSettings({ grantConsent: true })
  }

  const handleConsentClose = () => {
    setConsentModalOpen(false)
    setPendingConsentEnable(false)
  }

  const runPreview = async () => {
    if (!store?.id) return
    const message = previewMessage.trim()
    if (!message) {
      showError('Enter a test message', 'Type what a customer might send')
      return
    }
    setPreviewLoading(true)
    setPreviewResult(null)
    try {
      const res = await previewInboxAiReply(store.id, {
        message,
        channel: previewChannel,
      })
      setPreviewResult(res.data)
    } catch (e) {
      showError(e, 'Could not preview reply')
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title="Chat Boat"
        subtitle="Auto-reply to customer inbox messages"
        onBack={() => router.back()}
      />
      <ScreenScrollBody contentContainerClassName="pt-4 gap-4">
        <View
          className="rounded-2xl border border-gray-200 bg-surface p-5 gap-3"
          style={shadows.card}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-xl bg-brand-primary/10 items-center justify-center">
              <FontAwesome name="magic" size={22} color={Colors.brand.primary} />
            </View>
            <View className="flex-1">
              <Heading className="text-lg">Inbox auto-reply</Heading>
              <Muted className="text-sm mt-0.5">
                Replies on WhatsApp and Instagram with product links from your store.
              </Muted>
            </View>
          </View>
        </View>

        {!premium ? (
          <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4 gap-3">
            <Text className="text-amber-900 font-semibold">Business plan required</Text>
            <Muted className="text-amber-800 text-sm">
              Upgrade to Business to enable Chat Boat auto-replies for your customers.
            </Muted>
            <Button
              label="View plans"
              variant="outline"
              onPress={() => router.push('/subscription' as never)}
            />
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color={Colors.brand.primary} className="py-8" />
        ) : (
          <>
            <View className="rounded-2xl border border-gray-200 bg-surface p-4 gap-2">
              <View className="flex-row items-center justify-between py-1">
                <View className="flex-1 pr-4">
                  <Label>Auto-reply enabled</Label>
                  <Muted className="text-xs mt-0.5">
                    When on, Chat Boat answers customer messages automatically.
                  </Muted>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={handleToggleEnabled}
                  disabled={!premium || saving}
                  trackColor={{ false: '#E4E4E7', true: Colors.brand.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View className="gap-2">
              <Label>Default reply language</Label>
              <Muted className="text-xs">
                Chat Boat replies in whatever language the customer types (English, Malayalam,
                Manglish like &quot;undo?&quot; or &quot;ethu size?&quot;, mixed, etc.). This
                setting is only used when detection is unsure.
              </Muted>
              <View className="flex-row flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <Button
                    key={lang}
                    label={lang}
                    size="sm"
                    variant={language === lang ? 'primary' : 'outline'}
                    onPress={() => setLanguage(lang)}
                  />
                ))}
              </View>
            </View>

            <Input
              label="Custom instructions (optional)"
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder={CUSTOM_PROMPT_PLACEHOLDER}
              multiline
              numberOfLines={6}
              className="min-h-[120px]"
            />

            <Muted className="text-xs">
              Custom instructions actively shape how Chat Boat replies. It shares product links
              from your storefront, ignores off-topic questions, and will not share code or
              passwords. You can take over any chat manually from the inbox. Third-party AI
              providers process customer messages only to generate replies — see consent when
              enabling.
            </Muted>

            <View
              className="rounded-2xl border border-gray-200 bg-surface p-4 gap-3"
              style={shadows.card}
            >
              <View>
                <Label>Try a customer message</Label>
                <Muted className="text-xs mt-1">
                  Preview how Chat Boat would reply. Nothing is sent to WhatsApp or Instagram.
                </Muted>
              </View>

              <View className="flex-row gap-2">
                {(['whatsapp', 'instagram'] as const).map((ch) => (
                  <Button
                    key={ch}
                    label={ch === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                    size="sm"
                    variant={previewChannel === ch ? 'primary' : 'outline'}
                    onPress={() => setPreviewChannel(ch)}
                  />
                ))}
              </View>

              <Input
                value={previewMessage}
                onChangeText={setPreviewMessage}
                placeholder='e.g. "blue shirt undo?" or "ok"'
                multiline
                numberOfLines={3}
                className="min-h-[72px]"
              />

              <View className="flex-row flex-wrap gap-2">
                {PREVIEW_EXAMPLES.map((example) => (
                  <Button
                    key={example}
                    label={example}
                    size="sm"
                    variant="outline"
                    onPress={() => setPreviewMessage(example)}
                  />
                ))}
              </View>

              <Button
                label="Preview reply"
                loading={previewLoading}
                onPress={() => void runPreview()}
              />

              {previewLoading ? (
                <ActivityIndicator color={Colors.brand.primary} className="py-2" />
              ) : null}

              {previewResult ? (
                <View className="rounded-xl border border-gray-100 bg-gray-50 p-3 gap-2">
                  <Text className="text-sm font-semibold text-gray-900">Understood</Text>
                  <Muted className="text-xs leading-5">
                    Intent: {previewResult.intent}
                    {' · '}
                    Language: {previewResult.customerLanguage}
                    {' · '}
                    Script: {scriptStyleLabel(previewResult.scriptStyle)}
                    {previewResult.searchQuery
                      ? ` · Product: ${previewResult.searchQuery}`
                      : ''}
                    {previewResult.color ? ` · Color: ${previewResult.color}` : ''}
                    {previewResult.lastShownProductTitle
                      ? ` · Last shown: ${previewResult.lastShownProductTitle}`
                      : ''}
                  </Muted>
                  {previewResult.wouldSendImage ? (
                    <Muted className="text-xs text-emerald-800">
                      WhatsApp would also send a product photo with this caption.
                    </Muted>
                  ) : null}
                  {previewResult.hasFollowUpText ? (
                    <Muted className="text-xs">Includes a second message with more options.</Muted>
                  ) : null}
                  <Text className="text-sm font-semibold text-gray-900 mt-1">Would reply</Text>
                  <Text className="text-sm text-gray-800 leading-5">{previewResult.replyText}</Text>
                  <Muted className="text-xs mt-1">{previewResult.note}</Muted>
                </View>
              ) : null}
            </View>

            <Button label="Save settings" loading={saving} onPress={() => void handleSave()} />
          </>
        )}
      </ScreenScrollBody>

      <AiThirdPartyConsentModal
        isOpen={consentModalOpen}
        saving={saving && pendingConsentEnable}
        onClose={handleConsentClose}
        onAgree={handleConsentAgree}
      />
    </Screen>
  )
}
