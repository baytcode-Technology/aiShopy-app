import { useCallback, useMemo, useState } from 'react'
import { Linking, Platform, Pressable, Switch, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { RazorpayWebCheckout } from '@/components/subscription/RazorpayWebCheckout'
import { PaymentMethodConfigLayout } from '@/components/store/PaymentMethodConfigLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label, Muted } from '@/components/ui/Typography'
import type { SubscriptionCheckoutData } from '@src/api/subscriptions'
import {
  fetchPaymentConfig,
  startRazorpaySetupTest,
  updatePaymentConfig,
  verifyRazorpaySetupTest,
  type RazorpaySetupTestCheckout,
} from '@src/api/payment-config'
import { getRazorpayWebhookUrl, razorpayKeyMatchesMode } from '@src/lib/razorpay-config'
import { shadows } from '@src/lib/shadows'
import { showError, showSuccess, showWarning } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { RazorpayMode } from '@src/types/payment-config'

const RAZORPAY_DASHBOARD = 'https://dashboard.razorpay.com'

function testStatusLabel(
  testPassed: boolean,
  testPassedMode: RazorpayMode | null,
  mode: RazorpayMode
): string {
  if (testPassed) {
    const env = testPassedMode === 'live' ? 'live' : 'fake money'
    if (testPassedMode && testPassedMode !== mode) {
      return `Test passed (${env}) — save ${mode} settings and re-test to enable`
    }
    return `Test passed (${env})`
  }
  return 'Not tested for this environment'
}

export default function RazorpayPaymentScreen() {
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<RazorpayMode>('test')
  const [keyId, setKeyId] = useState('')
  const [keySecret, setKeySecret] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [maskedKey, setMaskedKey] = useState<string | null>(null)
  const [maskedWebhook, setMaskedWebhook] = useState<string | null>(null)
  const [testPassed, setTestPassed] = useState(false)
  const [testPassedMode, setTestPassedMode] = useState<RazorpayMode | null>(null)
  const [testRequired, setTestRequired] = useState(true)
  const [savedKeyId, setSavedKeyId] = useState('')
  const [savedMode, setSavedMode] = useState<RazorpayMode>('test')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [checkoutSession, setCheckoutSession] = useState<RazorpaySetupTestCheckout | null>(null)
  const [checkoutVisible, setCheckoutVisible] = useState(false)

  const { url: webhookUrl, isProductionFallback } = getRazorpayWebhookUrl()

  const credentialsSavedOnServer = Boolean(maskedKey && maskedWebhook && savedKeyId)
  const credentialsDirty =
    keyId.trim() !== savedKeyId ||
    mode !== savedMode ||
    Boolean(keySecret.trim()) ||
    Boolean(webhookSecret.trim())
  const testOk = !testRequired || testPassed
  const canEnable = testOk && credentialsSavedOnServer && !credentialsDirty
  const canRunTest = credentialsSavedOnServer && !credentialsDirty && !testing && !saving

  const enableHint = (() => {
    if (!credentialsSavedOnServer) return 'Save your Razorpay keys and webhook secret first.'
    if (credentialsDirty) return 'Save your latest settings before enabling.'
    if (!testOk) return 'Run the ₹1 test payment for this environment first.'
    if (!enabled) return 'Turn on, then tap Save to show Razorpay on your storefront.'
    return 'Razorpay is enabled on your storefront checkout.'
  })()

  const checkoutForWebView = useMemo<SubscriptionCheckoutData | null>(() => {
    if (!checkoutSession) return null
    return {
      checkout_id: checkoutSession.order_id,
      key_id: checkoutSession.key_id,
      order_id: checkoutSession.razorpay_order_id,
      amount: checkoutSession.amount,
      currency: checkoutSession.currency,
      plan: 'business',
      store_name: checkoutSession.store_name,
      is_trial: false,
      regular_amount: 1,
    }
  }, [checkoutSession])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchPaymentConfig()
      const rz = res.data.payment_config.razorpay
      setEnabled(rz.enabled)
      setMode(rz.mode)
      setKeyId(rz.key_id ?? '')
      setSavedKeyId(rz.key_id ?? '')
      setSavedMode(rz.mode)
      setMaskedKey(rz.key_secret_masked)
      setMaskedWebhook(rz.webhook_secret_masked)
      setTestPassed(rz.test_passed)
      setTestPassedMode(rz.test_passed_mode)
      setTestRequired(rz.test_required)
    } catch (e) {
      showError(e, 'Could not load Razorpay settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load])
  )

  const copyWebhookUrl = async () => {
    await Clipboard.setStringAsync(webhookUrl)
    showSuccess('Webhook URL copied')
  }

  const openDashboard = (path: string) => {
    void Linking.openURL(`${RAZORPAY_DASHBOARD}${path}`)
  }

  const save = async () => {
    if (enabled) {
      if (!keyId.trim()) {
        showError('Key ID is required when Razorpay is enabled')
        return
      }
      const keyModeError = razorpayKeyMatchesMode(keyId, mode)
      if (keyModeError) {
        showError(keyModeError)
        return
      }
      if (!keySecret.trim() && !maskedKey) {
        showError('Key secret is required when Razorpay is enabled')
        return
      }
      if (!webhookSecret.trim() && !maskedWebhook) {
        showError('Webhook secret is required when Razorpay is enabled')
        return
      }
      if (!canEnable) {
        showError('Run the ₹1 test payment for this environment before enabling Razorpay')
        return
      }
    }

    setSaving(true)
    try {
      await updatePaymentConfig({
        razorpay: {
          enabled,
          key_id: keyId.trim() || undefined,
          key_secret: keySecret.trim() || undefined,
          webhook_secret: webhookSecret.trim() || undefined,
          mode,
        },
      })
      setKeySecret('')
      setWebhookSecret('')
      showSuccess('Razorpay settings saved')
      await load()
    } catch (e) {
      showError(e, 'Could not save Razorpay settings')
    } finally {
      setSaving(false)
    }
  }

  const runSetupTest = async () => {
    if (Platform.OS === 'web') {
      showWarning('Run the Razorpay test on the mobile app.')
      return
    }
    if (!canRunTest) {
      showError('Save your Razorpay settings before running the test')
      return
    }

    setTesting(true)
    try {
      const res = await startRazorpaySetupTest()
      setCheckoutSession(res.data)
      setCheckoutVisible(true)
    } catch (e) {
      showError(e, 'Could not start Razorpay test')
    } finally {
      setTesting(false)
    }
  }

  const handleTestSuccess = async (payment: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => {
    if (!checkoutSession) return

    setTesting(true)
    try {
      const res = await verifyRazorpaySetupTest({
        order_id: checkoutSession.order_id,
        checkout_token: checkoutSession.checkout_token,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
      })
      setCheckoutVisible(false)
      setCheckoutSession(null)
      setTestPassed(res.data.test_passed)
      setTestPassedMode(res.data.test_passed_mode)
      showSuccess('Razorpay test passed. You can now enable it on your storefront.')
      await load()
    } catch (e) {
      showError(e, 'Payment received but verification failed')
    } finally {
      setTesting(false)
    }
  }

  const handleTestDismiss = () => {
    setCheckoutVisible(false)
    setCheckoutSession(null)
  }

  const handleEnableToggle = (value: boolean) => {
    if (value && !canEnable) {
      showError('Run the ₹1 test payment for this environment before enabling Razorpay')
      return
    }
    setEnabled(value)
  }

  return (
    <PaymentMethodConfigLayout
      title="Razorpay"
      subtitle="Cards, wallets & netbanking"
      footer={
        <View className="gap-2">
          <Button
            label={mode === 'test' ? 'Test Razorpay (₹1, fake money)' : 'Test Razorpay (₹1, real money)'}
            variant="outline"
            loading={testing}
            disabled={!canRunTest || loading}
            onPress={runSetupTest}
          />
          <Button label="Save" loading={saving || loading} onPress={save} />
        </View>
      }
    >
      <View
        className="w-full rounded-[28px] border border-gray-200 bg-surface px-4 py-5 gap-4"
        style={shadows.card}
      >
        <View className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
          <Text className="text-[13px] font-semibold text-ink">{testStatusLabel(testPassed, testPassedMode, mode)}</Text>
          <Muted className="text-xs mt-1">
            {mode === 'test'
              ? 'Use test card 4111 1111 1111 1111 after saving settings.'
              : 'You pay yourself ₹1 to verify your live Razorpay account.'}
          </Muted>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 min-w-0 pr-2">
            <Label>Enable Razorpay</Label>
            <Muted className="text-xs mt-1">{enableHint}</Muted>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleEnableToggle}
            trackColor={{ false: '#E4E4E7', true: '#0A0A0B' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View className="w-full">
          <Label className="mb-2">Environment</Label>
          <View className="flex-row w-full rounded-xl border border-gray-200 overflow-hidden">
            {(['test', 'live'] as RazorpayMode[]).map((item, index) => {
              const active = mode === item
              return (
                <Pressable
                  key={item}
                  onPress={() => setMode(item)}
                  className={`flex-1 min-w-0 py-3 items-center justify-center ${
                    active ? 'bg-brand-primary' : 'bg-surface'
                  } ${index > 0 ? 'border-l border-gray-200' : ''}`}
                >
                  <Text
                    className={`text-[14px] font-semibold ${
                      active ? 'text-brand-on-primary' : 'text-ink'
                    }`}
                    numberOfLines={1}
                  >
                    {item === 'test' ? 'Test' : 'Live'}
                  </Text>
                </Pressable>
              )
            })}
          </View>
          <Muted className="text-xs mt-1.5">
            {mode === 'test'
              ? 'Test mode uses fake money (rzp_test_... keys).'
              : 'Live mode uses real money (rzp_live_... keys) after Razorpay verifies your business.'}
          </Muted>
        </View>

        <Input
          label="Key ID"
          value={keyId}
          onChangeText={setKeyId}
          placeholder={mode === 'test' ? 'rzp_test_...' : 'rzp_live_...'}
          autoCapitalize="none"
        />
        <Input
          label="Key Secret"
          value={keySecret}
          onChangeText={setKeySecret}
          placeholder={maskedKey ? `Saved ${maskedKey}` : 'Enter key secret'}
          secureTextEntry
          autoCapitalize="none"
        />
        <Input
          label="Webhook secret"
          value={webhookSecret}
          onChangeText={setWebhookSecret}
          placeholder={maskedWebhook ? `Saved ${maskedWebhook}` : 'Enter webhook secret'}
          secureTextEntry
          autoCapitalize="none"
        />
        <Muted className="text-xs -mt-2">
          Key secret and webhook secret stay on our server. Your storefront only uses the public Key ID.
        </Muted>
      </View>

      <View className="rounded-[28px] border border-gray-200 bg-gray-50 px-5 py-4 gap-3">
        <Text className="text-[13px] font-bold text-ink">Setup in Razorpay Dashboard</Text>
        <Text className="text-[14px] text-gray-600 leading-6">
          1. Sign up at Razorpay and complete business verification there (not in this app).{'\n'}
          2. Switch Razorpay Dashboard to {mode === 'test' ? 'Test' : 'Live'} mode (top bar).{'\n'}
          3. Copy API keys from Dashboard → Developers → API Keys.{'\n'}
          4. Add the webhook URL below under Developers → Webhooks.{'\n'}
          5. Enable payment.captured (required). Optionally enable payment.failed.{'\n'}
          6. Paste the webhook secret here, save, then run the ₹1 test.
        </Text>

        <View className="flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => openDashboard('/app/keys')}
            className="px-3 py-2 rounded-full border border-gray-200 bg-white"
          >
            <Text className="text-[13px] font-semibold text-blue-600">Open API Keys</Text>
          </Pressable>
          <Pressable
            onPress={() => openDashboard('/app/webhooks')}
            className="px-3 py-2 rounded-full border border-gray-200 bg-white"
          >
            <Text className="text-[13px] font-semibold text-blue-600">Open Webhooks</Text>
          </Pressable>
        </View>

        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold text-ink">Webhook URL</Text>
          <View className="flex-row items-center gap-2">
            <Text className="flex-1 text-[12px] text-ink font-mono leading-5" selectable>
              {webhookUrl}
            </Text>
            <Pressable
              onPress={() => void copyWebhookUrl()}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white items-center justify-center"
              accessibilityLabel="Copy webhook URL"
            >
              <FontAwesome name="copy" size={14} color={Colors.brand.primary} />
            </Pressable>
          </View>
          {isProductionFallback ? (
            <Muted className="text-xs">
              Using production API URL. Set EXPO_PUBLIC_API_URL if you need a different host.
            </Muted>
          ) : null}
        </View>
      </View>

      <RazorpayWebCheckout
        visible={checkoutVisible}
        checkout={checkoutForWebView}
        description="Razorpay connection test — ₹1"
        onSuccess={(payment) => void handleTestSuccess(payment)}
        onDismiss={handleTestDismiss}
      />
    </PaymentMethodConfigLayout>
  )
}
