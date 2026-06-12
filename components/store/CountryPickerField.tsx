import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { Country, CountryCode } from 'react-native-country-picker-modal'
import { CountrySelectModal } from '@/components/store/CountrySelectModal'
import { DEFAULT_COUNTRY, type CountryValue } from '@src/lib/country-currency'
import { countryLabel } from '@src/lib/parse-phone'
import Colors from '@src/theme/colors'

type Props = {
  value: CountryValue
  onChange: (country: CountryValue) => void
  label?: string
  error?: string
  variant?: 'auth' | 'default'
}

export function CountryPickerField({
  value,
  onChange,
  label = 'Country *',
  error,
  variant = 'default',
}: Props) {
  const [open, setOpen] = useState(false)

  const labelClass =
    variant === 'auth'
      ? 'text-[13px] font-bold text-gray-600 mb-2 tracking-wide'
      : 'text-[13px] font-bold text-gray-600 mb-2'

  const handleSelect = (country: Country) => {
    onChange({
      cca2: country.cca2,
      name: countryLabel(country),
    })
  }

  const display = value.name || DEFAULT_COUNTRY.name

  return (
    <View className="mb-1">
      <Text className={labelClass}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 bg-surface ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
      >
        <Text className="flex-1 text-[15px] font-medium text-ink" numberOfLines={1}>
          {display}
        </Text>
        <FontAwesome name="chevron-down" size={12} color={Colors.text.muted} />
      </Pressable>
      {error ? <Text className="text-red-500 text-xs mt-1.5 pl-1">{error}</Text> : null}

      <CountrySelectModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
        selectedCode={value.cca2 as CountryCode}
        title="Select country"
        subtitle="Choose your store country"
      />
    </View>
  )
}
