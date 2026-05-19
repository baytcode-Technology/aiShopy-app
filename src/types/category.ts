export type Category = {
  id: string
  store_id: string
  parent_id: string | null
  name: string
  slug: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

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
  slug: string
  sort_order?: number
  is_active?: boolean
}

export type CreateCategoryResponse = {
  success: boolean
  message: string
  data: Category
}
