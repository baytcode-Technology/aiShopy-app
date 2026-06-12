/** Unicode regional indicator flags from ISO 3166-1 alpha-2 (e.g. US → 🇺🇸). */
export function countryCodeToFlagEmoji(cca2: string): string {
  const code = cca2.trim().toUpperCase()
  if (code.length !== 2) return '🏳️'
  const offset = 0x1f1e6 - 'A'.charCodeAt(0)
  return String.fromCodePoint(
    ...code.split('').map((char) => offset + char.charCodeAt(0))
  )
}
