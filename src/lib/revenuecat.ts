import { Platform } from 'react-native'
import Purchases, {
  type PurchasesPackage,
  LOG_LEVEL,
  type CustomerInfo,
} from 'react-native-purchases'

export const REVENUECAT_ENTITLEMENT_BUSINESS = 'business'
export const REVENUECAT_PRODUCT_BUSINESS_MONTHLY = 'aishopy_business_monthly'

let configured = false

function iosApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim()
  return key || null
}

export function isRevenueCatConfigured(): boolean {
  return Platform.OS === 'ios' && Boolean(iosApiKey())
}

export async function configureRevenueCat(appUserId?: string | null): Promise<void> {
  if (Platform.OS !== 'ios') return
  const apiKey = iosApiKey()
  if (!apiKey) return

  if (!configured) {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG)
    }
    Purchases.configure({
      apiKey,
      appUserID: appUserId ?? undefined,
    })
    configured = true
    return
  }

  if (appUserId) {
    await Purchases.logIn(appUserId)
  }
}

export async function identifyRevenueCatUser(userId: string): Promise<void> {
  if (!isRevenueCatConfigured()) return
  await configureRevenueCat(userId)
  await Purchases.logIn(userId)
}

export async function logoutRevenueCatUser(): Promise<void> {
  if (!isRevenueCatConfigured() || !configured) return
  try {
    await Purchases.logOut()
  } catch {
    // Ignore when already anonymous
  }
}

export async function setRevenueCatStoreId(storeId: number): Promise<void> {
  if (!isRevenueCatConfigured()) return
  await configureRevenueCat()
  await Purchases.setAttributes({ store_id: String(storeId) })
}

export async function getBusinessPackage(): Promise<PurchasesPackage | null> {
  if (!isRevenueCatConfigured()) return null
  await configureRevenueCat()
  const offerings = await Purchases.getOfferings()
  const current = offerings.current
  if (!current) return null

  const fromPackage =
    current.availablePackages.find(
      (pkg) => pkg.product.identifier === REVENUECAT_PRODUCT_BUSINESS_MONTHLY
    ) ??
    current.monthly ??
    current.availablePackages[0]

  return fromPackage ?? null
}

export async function getBusinessPackagePriceString(): Promise<string | null> {
  const pkg = await getBusinessPackage()
  if (!pkg) return null
  return pkg.product.priceString
}

export async function purchaseBusinessPackage(
  pkg: PurchasesPackage
): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return customerInfo
  } catch (error) {
    const cancelled =
      error &&
      typeof error === 'object' &&
      'userCancelled' in error &&
      Boolean((error as { userCancelled?: boolean }).userCancelled)
    if (cancelled) {
      throw new Error('Purchase cancelled')
    }
    throw error
  }
}

export async function restorePurchases(): Promise<CustomerInfo> {
  if (!isRevenueCatConfigured()) {
    throw new Error('RevenueCat is not configured')
  }
  await configureRevenueCat()
  return Purchases.restorePurchases()
}

export function hasBusinessEntitlement(info: CustomerInfo): boolean {
  return Boolean(info.entitlements.active[REVENUECAT_ENTITLEMENT_BUSINESS])
}
