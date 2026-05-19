import { BaseToast, ErrorToast, type ToastConfig } from 'react-native-toast-message'
import { theme } from '@src/theme/colors'

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: theme.black,
        borderLeftWidth: 4,
        backgroundColor: theme.white,
        borderWidth: 1,
        borderColor: theme.black,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: theme.black }}
      text2Style={{ fontSize: 13, color: theme.gray600 }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: theme.black,
        borderLeftWidth: 4,
        backgroundColor: theme.white,
        borderWidth: 1,
        borderColor: theme.black,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: theme.black }}
      text2Style={{ fontSize: 13, color: theme.gray600 }}
    />
  ),
}
