/** Read email claim from a Supabase JWT (display only — not verified on device). */
export function emailFromAccessToken(token: string): string | undefined {
  try {
    const segment = token.split('.')[1]
    if (!segment) return undefined
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
    const pad = normalized.length % 4
    const padded = pad ? normalized + '='.repeat(4 - pad) : normalized
    if (typeof globalThis.atob !== 'function') return undefined
    const json = globalThis.atob(padded)
    const payload = JSON.parse(json) as { email?: string }
    return typeof payload.email === 'string' ? payload.email : undefined
  } catch {
    return undefined
  }
}
