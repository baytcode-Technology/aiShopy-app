import { useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import {
  EMPTY_ORDER_FILTERS,
  formatOrderStatusLabel,
  hasActiveOrderFilters,
  ORDER_FULFILLMENT_OPTIONS,
  ORDER_LIFECYCLE_OPTIONS,
  ORDER_PAYMENT_OPTIONS,
  statusFieldTitle,
  type OrderFilters,
  type OrderStatusField,
} from '@src/lib/order-status'
import Colors from '@src/theme/colors'

type Props = {
  visible: boolean
  filters: OrderFilters
  onClose: () => void
  onApply: (filters: OrderFilters) => void
}

const FILTER_SECTIONS: OrderStatusField[] = [
  'order_status',
  'payment_status',
  'fulfillment_status',
]

function optionsForField(field: OrderStatusField) {
  switch (field) {
    case 'order_status':
      return ORDER_LIFECYCLE_OPTIONS
    case 'payment_status':
      return ORDER_PAYMENT_OPTIONS
    case 'fulfillment_status':
      return ORDER_FULFILLMENT_OPTIONS
  }
}

export function OrderFilterModal({ visible, filters, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets()
  const [draft, setDraft] = useState<OrderFilters>(filters)
  const [expanded, setExpanded] = useState<OrderStatusField | null>('order_status')

  const open = () => {
    setDraft(filters)
    setExpanded('order_status')
  }

  const toggleOption = (field: OrderStatusField, value: string) => {
    setDraft((prev) => {
      const current = prev[field] as string[]
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [field]: next }
    })
  }

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  const handleClear = () => {
    setDraft(EMPTY_ORDER_FILTERS)
    onApply(EMPTY_ORDER_FILTERS)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={open}
    >
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Pressable onPress={onClose} hitSlop={10} className="w-10 h-10 items-center justify-center">
            <FontAwesome name="times" size={20} color={Colors.text.primary} />
          </Pressable>
          <Text className="text-[17px] font-bold text-ink">Filter orders</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-2"
          showsVerticalScrollIndicator={false}
        >
          {FILTER_SECTIONS.map((field) => {
            const isOpen = expanded === field
            const options = optionsForField(field)
            const selected = draft[field] as string[]

            return (
              <View key={field} className="border-b border-gray-100">
                <Pressable
                  onPress={() => setExpanded(isOpen ? null : field)}
                  className="flex-row items-center justify-between py-4"
                >
                  <Text className="text-[16px] font-semibold text-ink">
                    {statusFieldTitle(field)}
                  </Text>
                  <FontAwesome
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={Colors.text.muted}
                  />
                </Pressable>

                {isOpen ? (
                  <View className="gap-2.5 pb-4">
                    {options.map((option) => {
                      const active = selected.includes(option)
                      return (
                        <Pressable
                          key={option}
                          onPress={() => toggleOption(field, option)}
                          className={`rounded-xl border px-4 py-3.5 ${
                            active
                              ? 'border-ink bg-gray-50'
                              : 'border-gray-200 bg-surface'
                          }`}
                        >
                          <Text
                            className={`text-[15px] font-medium ${
                              active ? 'text-ink font-semibold' : 'text-gray-500'
                            }`}
                          >
                            {formatOrderStatusLabel(option)}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                ) : null}
              </View>
            )
          })}
        </ScrollView>

        <View
          className="px-4 pt-3 border-t border-gray-200 gap-2"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          {hasActiveOrderFilters(draft) ? (
            <Pressable onPress={handleClear} className="py-2 items-center">
              <Text className="text-[14px] font-semibold text-gray-500">Clear filters</Text>
            </Pressable>
          ) : null}
          <Button label="Apply filters" onPress={handleApply} />
        </View>
      </View>
    </Modal>
  )
}
