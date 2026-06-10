export type Customer = {
  id: string
  store_id: string
  whatsapp_number: string
  name: string | null
  email: string | null
  total_orders: number
  total_spent: number
  last_seen_at: string | null
  created_at: string
  display_phone?: string | null
}

export type ListCustomersResponse = {
  success: boolean
  message: string
  data: {
    store_id: string
    customers: Customer[]
    count: number
  }
}

export type CreateCustomerPayload = {
  store_id: string
  name: string
  email?: string
  phone?: string
}

export type CreateCustomerResponse = {
  success: boolean
  message: string
  data: Customer
}
