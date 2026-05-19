import Toast from 'react-native-toast-message'
import { getErrorMessage } from '@src/lib/api-error'

export function showSuccess(message: string, subtitle?: string) {
  Toast.show({
    type: 'success',
    text1: message,
    text2: subtitle,
    position: 'top',
    visibilityTime: 3500,
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
