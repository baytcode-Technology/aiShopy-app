import Toast from 'react-native-toast-message'
import { getErrorMessage, isSubscriptionLimitError } from '@src/lib/api-error'

export function showSuccess(message: string, subtitle?: string) {
  Toast.show({
    type: 'success',
    text1: message,
    text2: subtitle,
    position: 'top',
    visibilityTime: 4000,
    topOffset: 56,
  })
}

export function showWarning(message: string, subtitle?: string) {
  Toast.show({
    type: 'error',
    text1: message,
    text2: subtitle,
    position: 'top',
    visibilityTime: 4500,
    topOffset: 56,
  })
}

export function showSubscriptionLimitError() {
  showWarning(
    'You have exceeded your store limit',
    'Upgrade your plan in Settings → Subscription'
  )
}

export function showError(error: unknown, fallback = 'Something went wrong') {
  if (isSubscriptionLimitError(error)) {
    showSubscriptionLimitError()
    return
  }
  Toast.show({
    type: 'error',
    text1: 'Failed',
    text2: getErrorMessage(error, fallback),
    position: 'top',
    visibilityTime: 4500,
  })
}
