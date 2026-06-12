import type { Country, CountryCode } from 'react-native-country-picker-modal'
import { FlagType, getAllCountries } from 'react-native-country-picker-modal'

export async function parseE164Phone(
  value: string,
  fallbackCode: CountryCode = 'US'
): Promise<{ countryCode: CountryCode; callingCode: string; national: string }> {
  const cleaned = value.trim()
  if (!cleaned) {
    const code = await getCallingCodeSafe(fallbackCode)
    return { countryCode: fallbackCode, callingCode: code, national: '' }
  }

  if (!cleaned.startsWith('+')) {
    const code = await getCallingCodeSafe(fallbackCode)
    return {
      countryCode: fallbackCode,
      callingCode: code,
      national: cleaned.replace(/\D/g, ''),
    }
  }

  const digits = cleaned.slice(1).replace(/\D/g, '')
  const countries = await getAllCountries(FlagType.EMOJI)
  const prefixes = countries
    .flatMap((country) =>
      country.callingCode.map((code) => ({
        code,
        countryCode: country.cca2,
      }))
    )
    .sort((a, b) => b.code.length - a.code.length)

  for (const prefix of prefixes) {
    if (digits.startsWith(prefix.code)) {
      return {
        countryCode: prefix.countryCode,
        callingCode: prefix.code,
        national: digits.slice(prefix.code.length),
      }
    }
  }

  const fallbackCalling = await getCallingCodeSafe(fallbackCode)
  return {
    countryCode: fallbackCode,
    callingCode: fallbackCalling,
    national: digits,
  }
}

async function getCallingCodeSafe(countryCode: CountryCode): Promise<string> {
  const countries = await getAllCountries(FlagType.EMOJI)
  const match = countries.find((c) => c.cca2 === countryCode)
  return match?.callingCode?.[0] ?? '1'
}

export function formatE164(callingCode: string, national: string): string {
  const digits = national.replace(/\D/g, '')
  if (!digits) return ''
  return `+${callingCode}${digits}`
}

export function countryLabel(country: Country): string {
  return typeof country.name === 'string' ? country.name : country.name.common
}
