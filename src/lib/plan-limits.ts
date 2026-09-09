export const FREE_ITEM_LIMIT = 5
export const FREE_DAILY_ORDER_LIMIT = 5

type SubscriptionLike = {
  subscription_status?: string | null
  subscription_expires_at?: string | null
}

export function hasActivePaidAccess(vendor: SubscriptionLike): boolean {
  const { subscription_status, subscription_expires_at } = vendor
  if (subscription_status !== 'active' && subscription_status !== 'trial') return false
  if (!subscription_expires_at) return true
  return new Date(subscription_expires_at) > new Date()
}

export function hasReachedFreeDailyOrderLimit(vendor: SubscriptionLike, todayOrderCount: number): boolean {
  return !hasActivePaidAccess(vendor) && todayOrderCount >= FREE_DAILY_ORDER_LIMIT
}

export function getTodayOrderWindow(now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}
