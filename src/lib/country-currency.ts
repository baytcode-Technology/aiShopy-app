/** ISO 3166-1 alpha-2 → default ISO 4217 currency (common storefront defaults). */
export const DEFAULT_CURRENCY_BY_COUNTRY: Record<string, string> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  AE: 'AED',
  SA: 'SAR',
  CA: 'CAD',
  AU: 'AUD',
  SG: 'SGD',
  MY: 'MYR',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  JP: 'JPY',
  CN: 'CNY',
  HK: 'HKD',
  NZ: 'NZD',
  ZA: 'ZAR',
  BR: 'BRL',
  MX: 'MXN',
  PK: 'PKR',
  BD: 'BDT',
  LK: 'LKR',
  NP: 'NPR',
  QA: 'QAR',
  KW: 'KWD',
  OM: 'OMR',
  BH: 'BHD',
  ID: 'IDR',
  TH: 'THB',
  PH: 'PHP',
  VN: 'VND',
  KR: 'KRW',
  TR: 'TRY',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  RU: 'RUB',
}

export function defaultCurrencyForCountry(countryCode: string): string {
  return DEFAULT_CURRENCY_BY_COUNTRY[countryCode.toUpperCase()] ?? 'USD'
}

/** Match stored country name to a picker code when possible. */
export function guessCountryCodeFromName(countryName: string): string {
  const normalized = countryName.trim().toLowerCase()
  const map: Record<string, string> = {
    india: 'IN',
    'united states': 'US',
    'united kingdom': 'GB',
    'united arab emirates': 'AE',
    uae: 'AE',
    canada: 'CA',
    australia: 'AU',
    singapore: 'SG',
    malaysia: 'MY',
    germany: 'DE',
    france: 'FR',
    japan: 'JP',
    china: 'CN',
    pakistan: 'PK',
    bangladesh: 'BD',
    'sri lanka': 'LK',
    nepal: 'NP',
    'saudi arabia': 'SA',
  }
  return map[normalized] ?? 'US'
}

export type CountryValue = {
  name: string
  cca2: string
}

export const DEFAULT_COUNTRY: CountryValue = {
  name: 'United States',
  cca2: 'US',
}
