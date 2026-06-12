import { Text } from 'react-native'
import { countryCodeToFlagEmoji } from '@src/lib/country-flag'

type Props = {
  code: string
  size?: number
}

export function CountryFlag({ code, size = 22 }: Props) {
  return (
    <Text
      style={{ fontSize: size, lineHeight: size + 4, width: size + 6, textAlign: 'center' }}
      allowFontScaling={false}
    >
      {countryCodeToFlagEmoji(code)}
    </Text>
  )
}
