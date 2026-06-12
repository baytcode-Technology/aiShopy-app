import { useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { Country, CountryCode } from 'react-native-country-picker-modal'
import { CountrySelectModal } from '@/components/store/CountrySelectModal'
import { formatE164, parseE164Phone } from '@src/lib/parse-phone'
import Colors from '@src/theme/colors'

type Props = {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  variant?: 'auth' | 'default'
  /** Re-parse phone when form resets (e.g. modal open). */
  resetKey?: string
}

export function PhoneNumberField({
  value,
  onChange,
  label = 'WhatsApp number *',
  error,
  variant = 'default',
  resetKey,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedCode, setSelectedCode] = useState<CountryCode>('US')
  const [callingCode, setCallingCode] = useState('1')
  const [nationalNumber, setNationalNumber] = useState('')

  const labelClass =
    variant === 'auth'
      ? 'text-[13px] font-bold text-gray-600 mb-2 tracking-wide'
      : 'text-[13px] font-bold text-gray-600 mb-2'

  useEffect(() => {
    let cancelled = false
    void parseE164Phone(value).then((parsed) => {
      if (cancelled) return
      setSelectedCode(parsed.countryCode)
      setCallingCode(parsed.callingCode)
      setNationalNumber(parsed.national)
    })
    return () => {
      cancelled = true
    }
  }, [value, resetKey])

  const updateNational = (text: string) => {
    const digits = text.replace(/\D/g, '')
    setNationalNumber(digits)
    onChange(formatE164(callingCode, digits))
  }

  const handleCountrySelect = (country: Country) => {
    const nextCalling = country.callingCode?.[0] ?? callingCode
    setSelectedCode(country.cca2)
    setCallingCode(nextCalling)
    onChange(formatE164(nextCalling, nationalNumber))
  }

  return (
    <View className="mb-1">
      <Text className={labelClass}>{label}</Text>
      <View
        className={`flex-row items-center rounded-xl border bg-surface px-3 py-2.5 ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
      >
        <Pressable
          onPress={() => setPickerOpen(true)}
          className="flex-row items-center pr-3 mr-3 border-r border-gray-200"
          hitSlop={6}
        >
          <FontAwesome name="chevron-down" size={11} color={Colors.text.muted} />
        </Pressable>

        <Text className="text-[15px] font-semibold text-ink mr-3">+{callingCode}</Text>

        <TextInput
          value={nationalNumber}
          onChangeText={updateNational}
          placeholder="Mobile number"
          keyboardType="phone-pad"
          className="flex-1 text-[15px] text-ink py-1"
          placeholderTextColor={Colors.text.muted}
        />
      </View>
      {error ? <Text className="text-red-500 text-xs mt-1.5 pl-1">{error}</Text> : null}

      <CountrySelectModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleCountrySelect}
        selectedCode={selectedCode}
        title="Select country code"
        subtitle="Choose country for phone number"
        showCallingCode
      />
    </View>
  )
}
