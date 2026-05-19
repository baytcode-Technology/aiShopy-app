import { env } from '@src/config/env'

export function buildSubdomainUrl(slug: string): string {
  const domain = env.storefrontBaseDomain
  const protocol = domain.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${slug}.${domain}`
}
