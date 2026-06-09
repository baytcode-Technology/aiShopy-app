export type OrderLifecycleStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'



export type OrderPaymentStatus =
  | 'pending'
  | 'confirming'
  | 'paid'
  | 'refunded'

export type OrderFulfillmentStatus =
  | 'unfulfilled'
  | 'ready'
  | 'fulfilled'



export type OrderItem = {

  id: string

  order_id: string

  product_id: string

  variant_id: string | null

  quantity: number

  unit_price: number

  total_price: number

  snapshot: Record<string, unknown>

}



export type Order = {

  id: string

  store_id: string

  customer_id: string | null

  conversation_id: string | null

  order_number: string

  order_status: OrderLifecycleStatus

  payment_status: OrderPaymentStatus

  fulfillment_status: OrderFulfillmentStatus

  source: string

  subtotal: number

  discount_amount: number

  shipping_fee: number

  tax_amount: number

  total: number

  notes: string | null

  created_at: string

  updated_at: string

  customers: { name: string | null; whatsapp_number: string } | null

  items: OrderItem[]

}



export type ListOrdersResponse = {

  success: boolean

  message: string

  data: {

    store_id: string

    orders: Order[]

    count: number

  }

}



export type GetOrderResponse = {

  success: boolean

  message: string

  data: Order

}



export type UpdateOrderPayload = {

  store_id: string

  order_status?: OrderLifecycleStatus

  payment_status?: OrderPaymentStatus

  fulfillment_status?: OrderFulfillmentStatus

}



export type UpdateOrderResponse = {

  success: boolean

  message: string

  data: {

    order: Order

  }

}



export type CreateOrderLineItem = {

  product_id: string

  quantity: number

  variant_id?: string

}



export type CreateOrderShippingAddress = {

  name?: string

  phone_number?: string

  whatsapp_number?: string

  postcode?: string

  city?: string

  district?: string

  state?: string

  region?: string

}



export type CreateOrderPayload = {

  store_id: string

  items: CreateOrderLineItem[]

  customer_id?: string

  whatsapp_number?: string

  name?: string

  payment_method?: 'cod' | 'razorpay'

  shipping_address?: CreateOrderShippingAddress

  notes?: string

  offline?: boolean

}



export type CreateOrderResponse = {

  success: boolean

  message: string

  data: {

    order: Order

    items: OrderItem[]

  }

}


