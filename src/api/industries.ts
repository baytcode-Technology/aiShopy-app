import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import type { ListIndustriesResponse } from '@src/types/industry'

export async function fetchIndustries(): Promise<ListIndustriesResponse> {
  return authenticatedFetch<ListIndustriesResponse>(endpoints.industries)
}
