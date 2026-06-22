import Colors from '@src/theme/colors'
import type { SubscriptionCheckoutData } from '@src/api/subscriptions'
import {
  openExternalPaymentUrl,
  shouldOpenExternally,
} from '@src/lib/razorpay-webview-url'
import { useMemo } from 'react'
import { ActivityIndicator, Modal, Platform, Pressable, Text, View } from 'react-native'
import {
  WebView,
  type WebViewMessageEvent,
} from 'react-native-webview'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export type RazorpayPaymentResult = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type Props = {
  visible: boolean
  checkout: SubscriptionCheckoutData | null
  customerEmail?: string | null
  customerPhone?: string | null
  customerName?: string | null
  onSuccess: (payment: RazorpayPaymentResult) => void
  onDismiss: () => void
}

const CHECKOUT_BASE_URL = 'https://aishopy.io'

function buildCheckoutHtml(input: {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  email?: string
  contact?: string
  customerName?: string
  themeColor: string
}) {
  const options = {
    key: input.key,
    amount: input.amount,
    currency: input.currency,
    order_id: input.order_id,
    name: input.name,
    description: input.description,
    prefill: {
      email: input.email ?? '',
      contact: input.contact ?? '',
      name: input.customerName ?? '',
    },
    theme: { color: input.themeColor },
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; }
      .wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #666; }
    </style>
  </head>
  <body>
    <div class="wrap">Opening secure checkout…</div>
    <script>
      function post(payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }
      try {
        var options = ${JSON.stringify(options)};
        options.handler = function (response) {
          post({ type: 'success', data: response });
        };
        options.modal = {
          ondismiss: function () {
            post({ type: 'dismiss' });
          },
        };
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
          post({
            type: 'error',
            message: (response.error && response.error.description) || 'Payment failed',
          });
        });
        rzp.open();
      } catch (err) {
        post({ type: 'error', message: err && err.message ? err.message : 'Checkout failed' });
      }
    </script>
  </body>
</html>`
}

function handleExternalUrl(url: string | undefined) {
  if (!shouldOpenExternally(url)) return false
  void openExternalPaymentUrl(url!).catch(() => {})
  return true
}

export function RazorpayWebCheckout({
  visible,
  checkout,
  customerEmail,
  customerPhone,
  customerName,
  onSuccess,
  onDismiss,
}: Props) {
  const html = useMemo(() => {
    if (!checkout) return null
    return buildCheckoutHtml({
      key: checkout.key_id,
      amount: checkout.amount,
      currency: checkout.currency,
      order_id: checkout.order_id,
      name: checkout.store_name,
      description: checkout.is_trial
        ? 'Business plan — 1st month trial'
        : 'Business plan — 1 month',
      email: customerEmail ?? undefined,
      contact: customerPhone ?? undefined,
      customerName: customerName ?? undefined,
      themeColor: Colors.brand.primary,
    })
  }, [checkout, customerEmail, customerPhone, customerName])

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        type: string
        data?: RazorpayPaymentResult
        message?: string
      }

      if (payload.type === 'success' && payload.data) {
        onSuccess(payload.data)
        return
      }

      if (payload.type === 'error') {
        throw new Error(payload.message ?? 'Payment failed')
      }

      if (payload.type === 'dismiss') {
        onDismiss()
      }
    } catch {
      onDismiss()
    }
  }

  if (!checkout || !html) return null

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between px-4 pt-12 pb-3 border-b border-gray-200">
          <Text className="text-[17px] font-semibold text-ink">Complete payment</Text>
          <Pressable
            onPress={onDismiss}
            hitSlop={12}
            className="w-10 h-10 rounded-full border border-gray-200 items-center justify-center"
          >
            <FontAwesome name="close" size={16} color={Colors.text.muted} />
          </Pressable>
        </View>

        <WebView
          originWhitelist={['*']}
          source={{ html, baseUrl: CHECKOUT_BASE_URL }}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={(request) => !handleExternalUrl(request.url)}
          onOpenWindow={(event) => {
            handleExternalUrl(event.nativeEvent.targetUrl)
          }}
          onError={(event) => {
            if (shouldOpenExternally(event.nativeEvent.url)) return
          }}
          onHttpError={(event) => {
            if (shouldOpenExternally(event.nativeEvent.url)) return
          }}
          startInLoadingState
          renderLoading={() => (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={Colors.brand.primary} />
            </View>
          )}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows
          {...(Platform.OS === 'android'
            ? {
                mixedContentMode: 'always' as const,
                thirdPartyCookiesEnabled: true,
              }
            : {})}
        />
      </View>
    </Modal>
  )
}
