import { useMemo, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Input } from '@/components/ui/Input'
import { SleekModal } from '@/components/ui/Modal'
import { CURRENCY_OPTIONS } from '@src/data/currencies'
import Colors from '@src/theme/colors'

type Props = {
  value: string
  onChange: (code: string) => void
  label?: string
  error?: string
  variant?: 'auth' | 'default'
}

export function CurrencyPickerField({
  value,
  onChange,
  label = 'Currency *',
  error,
  variant = 'default',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const labelClass =
    variant === 'auth'
      ? 'text-[13px] font-bold text-gray-600 mb-2 tracking-wide'
      : 'text-[13px] font-bold text-gray-600 mb-2'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CURRENCY_OPTIONS
    return CURRENCY_OPTIONS.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    )
  }, [query])

  const displayCode = value ? value.toUpperCase() : ''

  return (
    <View className="mb-1">
      <Text className={labelClass}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 bg-surface ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
      >
        <Text
          className={`flex-1 text-[15px] ${displayCode ? 'text-ink font-semibold' : 'text-gray-400'}`}
        >
          {displayCode || 'Select currency'}
        </Text>
        <FontAwesome name="chevron-down" size={12} color={Colors.text.muted} />
      </Pressable>
      {error ? <Text className="text-red-500 text-xs mt-1.5 pl-1">{error}</Text> : null}

      <SleekModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Select currency"
        subtitle="Choose your store currency"
        minHeightRatio={0.7}
        maxHeightRatio={0.7}
        bodyScroll={false}
      >
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          ListHeaderComponent={
            <Input
              label="Search"
              value={query}
              onChangeText={setQuery}
              placeholder="Search currency"
              autoCapitalize="none"
              className="mb-3"
            />
          }
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const selected = value === item.code
            return (
              <Pressable
                onPress={() => {
                  onChange(item.code)
                  setOpen(false)
                  setQuery('')
                }}
                className={`px-4 py-3.5 flex-row items-center justify-between border-b border-gray-100 ${
                  selected ? 'bg-gray-50' : ''
                }`}
              >
                <View className="flex-1 pr-3">
                  <Text className="text-[15px] font-semibold text-ink">{item.code}</Text>
                  <Text className="text-[13px] text-gray-500 mt-0.5">
                    {item.name} · {item.symbol}
                  </Text>
                </View>
                {selected ? (
                  <FontAwesome name="check" size={14} color={Colors.brand.primary} />
                ) : null}
              </Pressable>
            )
          }}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 py-6">No currencies found</Text>
          }
        />
      </SleekModal>
    </View>
  )
}
