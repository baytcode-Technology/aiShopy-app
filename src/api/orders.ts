import { apiFetch } from '@src/api/client'

import { endpoints } from '@src/api/endpoints'

import { getAccessToken } from '@src/lib/auth-storage'

import type {

  CreateOrderPayload,

  CreateOrderResponse,

  GetOrderResponse,

  ListOrdersResponse,

  UpdateOrderPayload,

  UpdateOrderResponse,

} from '@src/types/order'



async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {

  const token = await getAccessToken()

  if (!token) {

    throw new Error('You are not signed in')

  }

  return apiFetch<T>(path, { ...init, token })

}



export async function fetchOrders(storeId: string): Promise<ListOrdersResponse> {

  const qs = new URLSearchParams({ store_id: storeId })

  return authFetch<ListOrdersResponse>(`${endpoints.orders}?${qs.toString()}`)

}



export async function fetchOrder(

  storeId: string,

  orderId: string

): Promise<GetOrderResponse> {

  const qs = new URLSearchParams({ store_id: storeId })

  return authFetch<GetOrderResponse>(`${endpoints.orders}/${orderId}?${qs.toString()}`)

}



export async function updateOrder(

  orderId: string,

  payload: UpdateOrderPayload

): Promise<UpdateOrderResponse> {

  return authFetch<UpdateOrderResponse>(`${endpoints.orders}/${orderId}`, {

    method: 'PATCH',

    body: JSON.stringify(payload),

  })

}



export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {

  return authFetch<CreateOrderResponse>(endpoints.orders, {

    method: 'POST',

    body: JSON.stringify(payload),

  })

}


