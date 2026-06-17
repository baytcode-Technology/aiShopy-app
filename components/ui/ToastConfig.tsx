import { type BaseToastProps } from 'react-native-toast-message'
import { Text, View } from 'react-native'
import Colors from '@src/theme/colors'

function ToastCard({
  borderClass,
  bgClass,
  titleClass,
  props,
}: {
  borderClass: string
  bgClass: string
  titleClass: string
  props: BaseToastProps
}) {
  return (
    <View
      className={`mx-4 px-4 py-3.5 rounded-2xl border-l-4 border ${borderClass} ${bgClass}`}
      style={{
        shadowColor: Colors.brand.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Text className={`text-[15px] font-bold ${titleClass}`}>{props.text1}</Text>
      {props.text2 ? (
        <Text className="text-[13px] text-gray-500 mt-0.5">{props.text2}</Text>
      ) : null}
    </View>
  )
}

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <ToastCard
      borderClass="border-l-ink border-gray-200"
      bgClass="bg-surface"
      titleClass="text-ink"
      props={props}
    />
  ),
  error: (props: BaseToastProps) => (
    <ToastCard
      borderClass="border-l-charcoal border-gray-200"
      bgClass="bg-gray-50"
      titleClass="text-ink"
      props={props}
    />
  ),
  alert: (props: BaseToastProps) => (
    <ToastCard
      borderClass="border-l-ink border-gray-200"
      bgClass="bg-surface"
      titleClass="text-ink"
      props={props}
    />
  ),
}
