import { useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { IconButton } from '@/components/ui/IconButton'
import { Caption, Muted } from '@/components/ui/Typography'
import { OrderInvoiceItemsTable } from '@/components/store/OrderInvoiceItemsTable'
import {
  countOrderItems,
  formatOrderInvoiceDate,
  formatShippingAddress,
  formatStorefrontHost,
  formatStoreWhatsApp,
  getOrderChannelLabel,
  hasShippingAddress,
  isPosOrder,
} from '@src/lib/order-invoice'
import { downloadOrderInvoice, printOrderInvoice } from '@src/lib/order-invoice-export'
import { formatMoney } from '@src/lib/format-money'
import { formatOrderNumber } from '@src/lib/order-status'
import { showError } from '@src/lib/toast'
import type { Order } from '@src/types/order'
import type { Store } from '@src/types/store'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'

type Props = {
  order: Order
  store: Store
}

function InvoiceMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Caption className="text-gray-500 shrink-0">{label}</Caption>
      <Text className="text-[14px] font-semibold text-ink text-right flex-1">{value}</Text>
    </View>
  )
}

function InvoiceTotalRow({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className={bold ? 'text-[15px] font-bold text-ink' : 'text-[14px] text-gray-600'}>
        {label}
      </Text>
      <Text className={bold ? 'text-[16px] font-extrabold text-ink' : 'text-[14px] font-semibold text-ink'}>
        {value}
      </Text>
    </View>
  )
}

export function OrderInvoiceCard({ order, store }: Props) {
  const [printing, setPrinting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const currency = store.currency
  const items = order.items ?? []
  const itemCount = countOrderItems(items)
  const channel = getOrderChannelLabel(order)
  const showAddress = !isPosOrder(order) && hasShippingAddress(order.shipping_address)
  const addressLines = formatShippingAddress(order.shipping_address)
  const customerName =
    order.customers?.name?.trim() ||
    order.customers?.whatsapp_number ||
    (isPosOrder(order) ? 'Walk-in customer' : 'Customer')

  const runPrint = async () => {
    if (printing || downloading) return
    setPrinting(true)
    try {
      await printOrderInvoice({ order, store })
    } catch (e) {
      showError(e, 'Could not print invoice')
    } finally {
      setPrinting(false)
    }
  }

  const runDownload = async () => {
    if (printing || downloading) return
    setDownloading(true)
    try {
      await downloadOrderInvoice({ order, store })
    } catch (e) {
      showError(e, 'Could not download invoice')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <View
      className={cn(
        'rounded-2xl border border-gray-300 bg-surface overflow-hidden p-4 gap-4'
      )}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1 pr-2">
          <Text className="text-[20px] font-extrabold text-ink leading-tight">{store.name}</Text>
          <Muted className="text-[13px]">{formatStorefrontHost(store.slug)}</Muted>
          <Muted className="text-[13px]">{formatStoreWhatsApp(store)}</Muted>
        </View>

        <View className="flex-row items-center gap-1">
          <IconButton
            size="sm"
            variant="ghost"
            onPress={() => void runPrint()}
            disabled={printing || downloading}
            accessibilityLabel="Print invoice"
          >
            {printing ? (
              <ActivityIndicator size="small" color={Colors.text.secondary} />
            ) : (
              <FontAwesome name="print" size={16} color={Colors.text.secondary} />
            )}
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            onPress={() => void runDownload()}
            disabled={printing || downloading}
            accessibilityLabel="Download invoice"
          >
            {downloading ? (
              <ActivityIndicator size="small" color={Colors.text.secondary} />
            ) : (
              <FontAwesome name="download" size={16} color={Colors.text.secondary} />
            )}
          </IconButton>
        </View>
      </View>

      <View className="h-px bg-gray-200" />

      <View className="gap-2">
        <InvoiceMetaRow label="Invoice No" value={formatOrderNumber(order.order_number)} />
        <InvoiceMetaRow label="Order date" value={formatOrderInvoiceDate(order.created_at)} />
      </View>

      <View className="h-px bg-gray-200" />

      <View>
        <Text className="text-[15px] font-bold text-ink mb-2">Items</Text>
        <OrderInvoiceItemsTable items={items} currency={currency} />
      </View>

      <View className="gap-0.5">
        <InvoiceTotalRow
          label={`Items total (${itemCount})`}
          value={formatMoney(order.subtotal, currency)}
        />
        <InvoiceTotalRow label="Subtotal" value={formatMoney(order.subtotal, currency)} bold />
        {order.discount_amount > 0 ? (
          <InvoiceTotalRow
            label="Discount"
            value={`-${formatMoney(order.discount_amount, currency)}`}
          />
        ) : null}
        {order.shipping_fee > 0 ? (
          <InvoiceTotalRow label="Shipping" value={formatMoney(order.shipping_fee, currency)} />
        ) : null}
        {order.tax_amount > 0 ? (
          <InvoiceTotalRow label="Tax" value={formatMoney(order.tax_amount, currency)} />
        ) : null}
        <View className="h-px bg-gray-200 my-2" />
        <InvoiceTotalRow label="Total" value={formatMoney(order.total, currency)} bold />
      </View>

      <View className="h-px bg-gray-200" />

      <View>
        <Text className="text-[15px] font-bold text-ink mb-2">Order details</Text>
        <Caption className="text-gray-500">Channel</Caption>
        <Text className="text-[14px] font-semibold text-ink mt-0.5">{channel}</Text>
        <Caption className="text-gray-500 mt-2">Customer</Caption>
        <Text className="text-[14px] font-semibold text-ink mt-0.5">{customerName}</Text>
      </View>

      {showAddress ? (
        <>
          <View className="h-px bg-gray-200" />
          <View>
            <Text className="text-[15px] font-bold text-ink mb-2">Delivery address</Text>
            {addressLines.map((line, index) => (
              <Text key={`${line}-${index}`} className="text-[14px] text-ink leading-5">
                {line}
              </Text>
            ))}
          </View>
        </>
      ) : null}

      {order.notes?.trim() ? (
        <>
          <View className="h-px bg-gray-200" />
          <View>
            <Text className="text-[15px] font-bold text-ink mb-1">Notes</Text>
            <Text className="text-[14px] text-ink leading-5">{order.notes.trim()}</Text>
          </View>
        </>
      ) : null}
    </View>
  )
}
