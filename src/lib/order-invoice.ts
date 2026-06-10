import { env } from '@src/config/env'
import { formatMoney } from '@src/lib/format-money'
import { formatOrderListNumber } from '@src/lib/order-status'
import type { CreateOrderShippingAddress } from '@src/types/order'
import type { Order, OrderItem } from '@src/types/order'
import type { Store } from '@src/types/store'

const DUMMY_WHATSAPP = '+91 92077 77911'

export function formatOrderInvoiceDate(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${date} ${time}`
}

export function formatStorefrontHost(slug: string): string {
  return `${slug}.${env.storefrontBaseDomain}`
}

/** Placeholder until store WhatsApp editing is available in the app. */
export function formatStoreWhatsApp(_store?: Store | null): string {
  return DUMMY_WHATSAPP
}

export function isPosOrder(order: Pick<Order, 'source'>): boolean {
  return order.source === 'offline'
}

export function getOrderChannelLabel(order: Pick<Order, 'source'>): string {
  return isPosOrder(order) ? 'POS' : 'Online'
}

export function getOrderItemLabel(item: OrderItem): string {
  const snapshot = item.snapshot as {
    product_name?: string
    variant_name?: string
  }
  if (snapshot.variant_name) {
    return `${snapshot.product_name ?? 'Product'} · ${snapshot.variant_name}`
  }
  return snapshot.product_name ?? 'Product'
}

export function countOrderItems(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function formatShippingAddress(
  address: CreateOrderShippingAddress | Record<string, unknown> | null | undefined
): string[] {
  if (!address || typeof address !== 'object') return []

  const a = address as CreateOrderShippingAddress
  const lines: string[] = []

  if (a.name?.trim()) lines.push(a.name.trim())

  const locality = [a.city, a.district, a.state, a.region].filter(Boolean).join(', ')
  if (locality) lines.push(locality)
  if (a.postcode?.trim()) lines.push(a.postcode.trim())

  const phone = a.phone_number?.trim() || a.whatsapp_number?.trim()
  if (phone) lines.push(phone)

  return lines
}

export function hasShippingAddress(
  address: CreateOrderShippingAddress | Record<string, unknown> | null | undefined
): boolean {
  return formatShippingAddress(address).length > 0
}

type InvoiceContext = {
  order: Order
  store: Store
}

function invoiceItemsRows(order: Order, currency: string): string {
  return (order.items ?? [])
    .map((item) => {
      const label = getOrderItemLabel(item)
      return `<tr>
        <td>${item.quantity}× ${escapeHtml(label)}</td>
        <td style="text-align:right">${escapeHtml(formatMoney(item.total_price, currency))}</td>
      </tr>`
    })
    .join('')
}

function invoiceTotalsRows(order: Order, currency: string): string {
  const itemCount = countOrderItems(order.items ?? [])
  const rows: string[] = [
    `<tr><td>Items total (${itemCount})</td><td style="text-align:right">${escapeHtml(formatMoney(order.subtotal, currency))}</td></tr>`,
    `<tr><td><strong>Subtotal</strong></td><td style="text-align:right"><strong>${escapeHtml(formatMoney(order.subtotal, currency))}</strong></td></tr>`,
  ]

  if (order.discount_amount > 0) {
    rows.push(
      `<tr><td>Discount</td><td style="text-align:right">-${escapeHtml(formatMoney(order.discount_amount, currency))}</td></tr>`
    )
  }
  if (order.shipping_fee > 0) {
    rows.push(
      `<tr><td>Shipping</td><td style="text-align:right">${escapeHtml(formatMoney(order.shipping_fee, currency))}</td></tr>`
    )
  }
  if (order.tax_amount > 0) {
    rows.push(
      `<tr><td>Tax</td><td style="text-align:right">${escapeHtml(formatMoney(order.tax_amount, currency))}</td></tr>`
    )
  }

  rows.push(
    `<tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${escapeHtml(formatMoney(order.total, currency))}</strong></td></tr>`
  )

  return rows.join('')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildInvoiceHtml({ order, store }: InvoiceContext): string {
  const currency = store.currency
  const host = formatStorefrontHost(store.slug)
  const whatsapp = formatStoreWhatsApp(store)
  const channel = getOrderChannelLabel(order)
  const addressLines = !isPosOrder(order) ? formatShippingAddress(order.shipping_address) : []
  const customerName =
    order.customers?.name?.trim() ||
    order.customers?.whatsapp_number ||
    (isPosOrder(order) ? 'Walk-in customer' : 'Customer')

  const addressBlock =
    addressLines.length > 0
      ? `<h3>Delivery address</h3><p>${addressLines.map(escapeHtml).join('<br/>')}</p>`
      : ''

  const notesBlock = order.notes?.trim()
    ? `<h3>Notes</h3><p>${escapeHtml(order.notes.trim())}</p>`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; padding: 24px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .muted { color: #666; font-size: 13px; margin: 0 0 2px; }
    .meta { margin: 20px 0; font-size: 14px; }
    .meta div { margin-bottom: 6px; }
    h2 { font-size: 16px; margin: 24px 0 8px; }
    h3 { font-size: 14px; margin: 20px 0 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    td { padding: 8px 0; vertical-align: top; border-bottom: 1px solid #eee; }
    .totals td { border-bottom: none; }
    .totals tr:last-child td { border-top: 2px solid #111; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(store.name)}</h1>
  <p class="muted">${escapeHtml(host)}</p>
  <p class="muted">${escapeHtml(whatsapp)}</p>

  <div class="meta">
    <div><strong>Invoice No:</strong> ${escapeHtml(formatOrderListNumber(order.order_number))}</div>
    <div><strong>Order date:</strong> ${escapeHtml(formatOrderInvoiceDate(order.created_at))}</div>
  </div>

  <h2>Items</h2>
  <table>${invoiceItemsRows(order, currency)}</table>

  <table class="totals" style="margin-top: 12px">${invoiceTotalsRows(order, currency)}</table>

  <h3>Order details</h3>
  <p>Channel: ${escapeHtml(channel)}<br/>Customer: ${escapeHtml(customerName)}</p>
  ${addressBlock}
  ${notesBlock}
</body>
</html>`
}

export function buildInvoicePlainText({ order, store }: InvoiceContext): string {
  const currency = store.currency
  const lines: string[] = [
    store.name,
    formatStorefrontHost(store.slug),
    formatStoreWhatsApp(store),
    '',
    `Invoice No: ${formatOrderListNumber(order.order_number)}`,
    `Order date: ${formatOrderInvoiceDate(order.created_at)}`,
    '',
    'Items',
    ...(order.items ?? []).map(
      (item) =>
        `${item.quantity}x ${getOrderItemLabel(item)} — ${formatMoney(item.total_price, currency)}`
    ),
    '',
    `Items total (${countOrderItems(order.items ?? [])}): ${formatMoney(order.subtotal, currency)}`,
    `Subtotal: ${formatMoney(order.subtotal, currency)}`,
  ]

  if (order.discount_amount > 0) {
    lines.push(`Discount: -${formatMoney(order.discount_amount, currency)}`)
  }
  if (order.shipping_fee > 0) {
    lines.push(`Shipping: ${formatMoney(order.shipping_fee, currency)}`)
  }
  if (order.tax_amount > 0) {
    lines.push(`Tax: ${formatMoney(order.tax_amount, currency)}`)
  }

  lines.push(`Total: ${formatMoney(order.total, currency)}`, '', 'Order details')
  lines.push(`Channel: ${getOrderChannelLabel(order)}`)

  const customerName =
    order.customers?.name?.trim() ||
    order.customers?.whatsapp_number ||
    (isPosOrder(order) ? 'Walk-in customer' : 'Customer')
  lines.push(`Customer: ${customerName}`)

  if (!isPosOrder(order)) {
    const addressLines = formatShippingAddress(order.shipping_address)
    if (addressLines.length > 0) {
      lines.push('', 'Delivery address', ...addressLines)
    }
  }

  if (order.notes?.trim()) {
    lines.push('', 'Notes', order.notes.trim())
  }

  return lines.join('\n')
}
