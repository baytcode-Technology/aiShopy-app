import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import type {
  CreateCategoryPayload,
  CreateCategoryResponse,
  ListCategoriesResponse,
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
