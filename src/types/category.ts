export type Category = {
  id: string
  store_id: string
  parent_id: string | null
  name: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  description?: string | null
  created_at: string
  product_count?: number
}

export type UpdateCategoryPayload = Partial<{
  name: string
  image_url: string | null
  is_active: boolean
  description: string | null
}>

export type ListCategoriesResponse = {
  success: boolean
  message: string
  data: {
    store_id: string
    categories: Category[]
    count: number
  }
}

export type CreateCategoryPayload = {
  store_id: string
  name: string
  image_url?: string | null
  parent_id?: string
  sort_order?: number
  is_active?: boolean
}

export type CreateCategoryResponse = {
  success: boolean
  message: string
  data: Category
}
