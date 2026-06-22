import * as FileSystem from 'expo-file-system/legacy'
import { printAsync, printToFileAsync } from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Share } from 'react-native'
import { buildInvoiceHtml, buildInvoicePlainText } from '@src/lib/order-invoice'
import { formatOrderNumber } from '@src/lib/order-status'
import type { Order } from '@src/types/order'
import type { Store } from '@src/types/store'

type InvoiceContext = {
  order: Order
  store: Store
}

function invoiceContext(ctx: InvoiceContext) {
  const html = buildInvoiceHtml(ctx)
  const text = buildInvoicePlainText(ctx)
  const title = `Invoice ${formatOrderNumber(ctx.order.order_number)}`
  return { html, text, title }
}

export async function printOrderInvoice(ctx: InvoiceContext): Promise<void> {
  const { html, text, title } = invoiceContext(ctx)

  try {
    await printAsync({ html })
    return
  } catch {
    // Native print unavailable — fall back to system share sheet.
  }

  await Share.share({ message: text, title })
}

export async function downloadOrderInvoice(ctx: InvoiceContext): Promise<void> {
  const { html, text, title } = invoiceContext(ctx)

  try {
    const { uri } = await printToFileAsync({ html })
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: title,
        UTI: 'com.adobe.pdf',
      })
      return
    }
  } catch {
    // PDF export unavailable — fall back to a text file share.
  }

  const safeName = String(ctx.order.id)
  const path = `${FileSystem.cacheDirectory}invoice-${safeName}.txt`
  await FileSystem.writeAsStringAsync(path, text)

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType: 'text/plain',
      dialogTitle: title,
    })
    return
  }

  await Share.share({ message: text, title })
}
