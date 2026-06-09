import type {
  OrderFulfillmentStatus,
  OrderLifecycleStatus,
  OrderPaymentStatus,
} from '@src/types/order'

export type OrderStatusField = 'order_status' | 'payment_status' | 'fulfillment_status'

export const ORDER_LIFECYCLE_OPTIONS: OrderLifecycleStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]

export const ORDER_PAYMENT_OPTIONS: OrderPaymentStatus[] = [
  'pending',
  'confirming',
  'paid',
  'refunded',
]

export const ORDER_FULFILLMENT_OPTIONS: OrderFulfillmentStatus[] = [
  'unfulfilled',
  'ready',
  'fulfilled',
]

const LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  confirming: 'Confirming',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  refunded: 'Refunded',
  unfulfilled: 'Unfulfilled',
  ready: 'Ready',
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery',
  fulfilled: 'Fulfilled',
}

export function formatOrderStatusLabel(value: string): string {
  return LABELS[value] ?? value.replace(/_/g, ' ')
}

export function statusFieldTitle(field: OrderStatusField): string {
  switch (field) {
    case 'order_status':
      return 'Order Status'
    case 'payment_status':
      return 'Payment Status'
    case 'fulfillment_status':
      return 'Fulfillment Status'
  }
}

export function changeStatusSheetTitle(field: OrderStatusField): string {
  switch (field) {
    case 'order_status':
      return 'Change Order Status'
    case 'payment_status':
      return 'Change Payment Status'
    case 'fulfillment_status':
      return 'Change Fulfillment Status'
  }
}

export function statusOptionsForField(
  field: OrderStatusField
): Array<OrderLifecycleStatus | OrderPaymentStatus | OrderFulfillmentStatus> {
  switch (field) {
    case 'order_status':
      return ORDER_LIFECYCLE_OPTIONS
    case 'payment_status':
      return ORDER_PAYMENT_OPTIONS
    case 'fulfillment_status':
      return ORDER_FULFILLMENT_OPTIONS
  }
}

export function statusFieldIcon(
  field: OrderStatusField
): 'file-text-o' | 'credit-card' | 'truck' {
  switch (field) {
    case 'order_status':
      return 'file-text-o'
    case 'payment_status':
      return 'credit-card'
    case 'fulfillment_status':
      return 'truck'
  }
}

export type OrderStatusBadgeColors = {
  background: string
  text: string
  border: string
}

/** Semantic pill colors: gray = neutral, green = success, orange = in-progress, red = negative */
export function getOrderStatusBadgeColors(value: string): OrderStatusBadgeColors {
  switch (value) {
    case 'completed':
    case 'paid':
    case 'fulfilled':
      return { background: '#DCFCE7', text: '#166534', border: '#BBF7D0' }
    case 'confirmed':
    case 'confirming':
    case 'ready':
    case 'in_transit':
    case 'out_for_delivery':
    case 'partially_paid':
      return { background: '#FFEDD5', text: '#C2410C', border: '#FED7AA' }
    case 'cancelled':
    case 'refunded':
      return { background: '#FEE2E2', text: '#B91C1C', border: '#FECACA' }
    case 'pending':
    case 'unfulfilled':
    default:
      return { background: '#F4F4F5', text: '#52525B', border: '#E4E4E7' }
  }
}

export type OrderFilters = {
  order_status: OrderLifecycleStatus[]
  payment_status: OrderPaymentStatus[]
  fulfillment_status: OrderFulfillmentStatus[]
}

export const EMPTY_ORDER_FILTERS: OrderFilters = {
  order_status: [],
  payment_status: [],
  fulfillment_status: [],
}

export function hasActiveOrderFilters(filters: OrderFilters): boolean {
  return (
    filters.order_status.length > 0 ||
    filters.payment_status.length > 0 ||
    filters.fulfillment_status.length > 0
  )
}

export function formatOrderListDate(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date} at ${time}`
}

export function orderListCustomerLabel(order: {
  source: string
  customers: { name: string | null; whatsapp_number: string } | null
}): string {
  if (order.customers?.name?.trim()) return order.customers.name.trim()
  if (order.customers?.whatsapp_number) return order.customers.whatsapp_number
  return 'Customer'
}

export function formatOrderListNumber(orderNumber: string): string {
  return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`
}

/** Card title: POS → "#FEB26-1 John (POS)" or "#FEB26-1 Customer (POS)"; others → "#FEB26-1 Customer name". */
export function orderListTitle(order: {
  order_number: string
  source: string
  customers: { name: string | null; whatsapp_number: string } | null
}): string {
  const displayNumber = formatOrderListNumber(order.order_number)
  if (order.source === 'offline') {
    const label = order.customers?.name?.trim() || 'Customer'
    return `${displayNumber} ${label} (POS)`
  }
  return `${displayNumber} ${orderListCustomerLabel(order)}`
}

