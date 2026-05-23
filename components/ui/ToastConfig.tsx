import { BaseToast, ErrorToast, type ToastConfig } from 'react-native-toast-message'
import Colors from '@src/theme/colors'

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.status.success,
        borderLeftWidth: 4,
        backgroundColor: Colors.bg.success,
        borderWidth: 1,
        borderColor: Colors.border.success,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: Colors.status.success }}
      text2Style={{ fontSize: 13, color: Colors.text.secondary }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: Colors.brand.primary,
        borderLeftWidth: 4,
        backgroundColor: Colors.bg.primary,
        borderWidth: 1,
        borderColor: Colors.border.strong,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: Colors.text.primary }}
      text2Style={{ fontSize: 13, color: Colors.text.secondary }}
    />
  ),
}
