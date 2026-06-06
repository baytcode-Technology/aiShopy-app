import Toast from 'react-native-toast-message'
import { getErrorMessage } from '@src/lib/api-error'

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

export function showError(error: unknown, fallback = 'Something went wrong') {
  Toast.show({
    type: 'error',
    text1: 'Failed',
    text2: getErrorMessage(error, fallback),
    position: 'top',
    visibilityTime: 4500,
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
