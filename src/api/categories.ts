import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import type {
  Category,
  CreateCategoryPayload,
  CreateCategoryResponse,
  ListCategoriesResponse,
  UpdateCategoryPayload,
} from '@src/types/category'

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('You are not signed in')
  }
  return apiFetch<T>(path, { ...init, token })
}

export async function fetchCategories(storeId: string): Promise<ListCategoriesResponse> {
  const qs = new URLSearchParams({ store_id: storeId })
  return authFetch<ListCategoriesResponse>(`${endpoints.categories}?${qs.toString()}`)
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<CreateCategoryResponse> {
  return authFetch<CreateCategoryResponse>(endpoints.categories, {
    method: 'POST',
    body: JSON.stringify({
      sort_order: 0,
      is_active: true,
      ...payload,
    }),
  })
}

export type SyncCategoryProductsResponse = {
  success: boolean
  message: string
  data: { assigned: number; removed: number }
}

export type UpdateCategoryResponse = {
  success: boolean
  message: string
  data: Category
}

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryPayload
): Promise<UpdateCategoryResponse> {
  return authFetch<UpdateCategoryResponse>(`${endpoints.categories}/${categoryId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteCategory(
  categoryId: string
): Promise<{ success: boolean; message: string }> {
  return authFetch(`${endpoints.categories}/${categoryId}`, {
    method: 'DELETE',
  })
}

export async function syncCategoryProducts(
  storeId: string,
  categoryId: string,
  productIds: string[]
): Promise<SyncCategoryProductsResponse> {
  return authFetch<SyncCategoryProductsResponse>(
    `${endpoints.categories}/${categoryId}/products`,
    {
      method: 'PUT',
      body: JSON.stringify({ store_id: storeId, product_ids: productIds }),
    }
  )
}
