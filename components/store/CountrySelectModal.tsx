import { useEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  FlagType,
  getAllCountries,
  type Country,
  type CountryCode,
} from 'react-native-country-picker-modal'
import { CountryFlag } from '@/components/store/CountryFlag'
import { Input } from '@/components/ui/Input'
import { SleekModal } from '@/components/ui/Modal'
import { countryLabel } from '@src/lib/parse-phone'
import Colors from '@src/theme/colors'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSelect: (country: Country) => void
  selectedCode?: CountryCode
  title?: string
  subtitle?: string
  showCallingCode?: boolean
}

export function CountrySelectModal({
  isOpen,
  onClose,
  onSelect,
  selectedCode,
  title = 'Select country',
  subtitle = 'Search and choose a country',
  showCallingCode = false,
}: Props) {
  const [countries, setCountries] = useState<Country[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!isOpen) return
    void getAllCountries(FlagType.EMOJI).then(setCountries).catch(console.warn)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) setQuery('')
  }, [isOpen])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    return countries.filter((country) => {
      const name = countryLabel(country).toLowerCase()
      const code = country.cca2.toLowerCase()
      const calling = country.callingCode?.[0] ?? ''
      return name.includes(q) || code.includes(q) || calling.includes(q)
    })
  }, [countries, query])

  const listHeader = (
    <Input
      label="Search"
      value={query}
      onChangeText={setQuery}
      placeholder="Search country"
      autoCapitalize="none"
      className="mb-3"
    />
  )

  return (
    <SleekModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      minHeightRatio={0.7}
      maxHeightRatio={0.7}
      bodyScroll={false}
    >
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.cca2}
        ListHeaderComponent={listHeader}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const selected = selectedCode === item.cca2
          const calling = item.callingCode?.[0]
          return (
            <Pressable
              onPress={() => {
                onSelect(item)
                onClose()
              }}
              className={`px-1 py-3 flex-row items-center gap-3 border-b border-gray-100 ${
                selected ? 'bg-gray-50' : ''
              }`}
            >
              <CountryFlag code={item.cca2} size={22} />
              <View className="flex-1 min-w-0">
                <Text className="text-[15px] font-medium text-ink" numberOfLines={1}>
                  {countryLabel(item)}
                </Text>
                {showCallingCode && calling ? (
                  <Text className="text-[13px] text-gray-500 mt-0.5">+{calling}</Text>
                ) : null}
              </View>
              {selected ? (
                <FontAwesome name="check" size={14} color={Colors.brand.primary} />
              ) : null}
            </Pressable>
          )
        }}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 py-8">No countries found</Text>
        }
      />
    </SleekModal>
  )
}
