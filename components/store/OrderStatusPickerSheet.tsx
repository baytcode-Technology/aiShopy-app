import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  changeStatusSheetTitle,
  formatOrderStatusLabel,
  getOrderStatusBadgeColors,
  statusOptionsForField,
  type OrderStatusField,
} from '@src/lib/order-status'
import Colors from '@src/theme/colors'

type Props = {
  visible: boolean
  field: OrderStatusField | null
  currentValue: string | null
  onClose: () => void
  onSelect: (value: string) => void
}

export function OrderStatusPickerSheet({
  visible,
  field,
  currentValue,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets()
  const isOpen = visible && field != null
  const options = field ? statusOptionsForField(field) : []

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close"
        >
          <View className="flex-1 bg-black/45" />
        </Pressable>

        <View
          className="mx-5 bg-white rounded-2xl px-5 py-4 shadow-lg"
          style={{ marginBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[17px] font-bold text-gray-400">
              {field ? changeStatusSheetTitle(field) : ''}
            </Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
              <FontAwesome name="times" size={18} color={Colors.text.secondary} />
            </Pressable>
          </View>

          {options.map((option) => {
            const active = option === currentValue
            const colors = getOrderStatusBadgeColors(option)
            return (
              <Pressable
                key={option}
                onPress={() => onSelect(option)}
                className="py-2.5 active:opacity-80"
              >
                <View className="flex-row items-center justify-between gap-3">
                  <View
                    className="px-3 py-1.5 rounded-full border"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: active ? colors.text : colors.border,
                      borderWidth: active ? 2 : 1,
                    }}
                  >
                    <Text
                      className="text-[14px] font-semibold"
                      style={{ color: colors.text }}
                    >
                      {formatOrderStatusLabel(option)}
                    </Text>
                  </View>
                  {active ? (
                    <FontAwesome name="check" size={16} color={colors.text} />
                  ) : (
                    <View className="w-4" />
                  )}
                </View>
              </Pressable>
            )
          })}
        </View>
      </View>
    </Modal>
  )
}
