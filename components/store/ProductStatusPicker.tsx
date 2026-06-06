import { Pressable, Text, View } from 'react-native'
import { cn } from '@src/lib/cn'
import { PRODUCT_STATUS_OPTIONS, PRODUCT_STATUS_THEME } from '@src/lib/product-status'
import type { ProductStatus } from '@src/types/product'

type Props = {
  value: ProductStatus
  onChange: (status: ProductStatus) => void
  label?: string
  disabled?: boolean
  compact?: boolean
}

export function ProductStatusPicker({
  value,
  onChange,
  label = 'Status',
  disabled,
  compact,
}: Props) {
  return (
    <View>
      <Text
        className={cn(
          'font-bold text-gray-600 tracking-wide',
          compact ? 'text-[11px] mb-1.5' : 'text-[13px] mb-2'
        )}
      >
        {label}
      </Text>
      <View className={cn('flex-row flex-wrap', compact ? 'gap-1.5' : 'gap-2')}>
        {PRODUCT_STATUS_OPTIONS.map((option) => {
          const selected = value === option
          const theme = PRODUCT_STATUS_THEME[option]
          return (
            <Pressable
              key={option}
              disabled={disabled}
              onPress={() => onChange(option)}
              className="min-w-[30%] flex-1"
            >
              <View
                className={cn(
                  'items-center justify-center rounded-lg border',
                  compact ? 'py-2 px-1.5' : 'rounded-xl py-3 px-2',
                  !selected && 'bg-surface border-gray-200',
                  disabled && 'opacity-50'
                )}
                style={
                  selected
                    ? {
                        backgroundColor: theme.pickerSelectedBg,
                        borderColor: theme.pickerSelectedBorder,
                      }
                    : undefined
                }
              >
                <Text
                  className={cn(
                    'font-bold',
                    compact ? 'text-[11px]' : 'text-[13px]',
                    !selected && 'text-gray-600'
                  )}
                  style={selected ? { color: theme.pickerSelectedText } : undefined}
                >
                  {theme.label}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
