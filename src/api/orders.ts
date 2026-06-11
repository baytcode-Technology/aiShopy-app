import { authenticatedFetch } from '@src/api/client'

import { endpoints } from '@src/api/endpoints'

import type {

  CreateOrderPayload,

  CreateOrderResponse,

  GetOrderResponse,

  ListOrdersResponse,

  UpdateOrderPayload,

  UpdateOrderResponse,

} from '@src/types/order'



export async function fetchOrders(storeId: string): Promise<ListOrdersResponse> {

  const qs = new URLSearchParams({ store_id: storeId })

  return authenticatedFetch<ListOrdersResponse>(`${endpoints.orders}?${qs.toString()}`)

}



export async function fetchOrder(

  storeId: string,

  orderId: string

): Promise<GetOrderResponse> {

  const qs = new URLSearchParams({ store_id: storeId })

  return authenticatedFetch<GetOrderResponse>(`${endpoints.orders}/${orderId}?${qs.toString()}`)

}



export async function updateOrder(

  orderId: string,

  payload: UpdateOrderPayload

): Promise<UpdateOrderResponse> {

  return authenticatedFetch<UpdateOrderResponse>(`${endpoints.orders}/${orderId}`, {

    method: 'PATCH',

    body: JSON.stringify(payload),

  })

}



export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {

  return authenticatedFetch<CreateOrderResponse>(endpoints.orders, {

    method: 'POST',

    body: JSON.stringify(payload),

  })

}


