/** True when the category has a non-empty cover image URL. */
export function categoryHasImage(imageUrl: string | null | undefined): boolean {
  return Boolean(imageUrl?.trim())
}
