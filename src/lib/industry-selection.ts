import type { IndustryGroup } from '@src/types/industry'

export const INDUSTRY_OTHER_VALUE = '__other__'

export function formatIndustryLabel(parentName: string, childName: string): string {
  return `${parentName} › ${childName}`
}

export type ResolvedIndustrySelection =
  | { mode: 'none' }
  | { mode: 'preset'; parentId: string; childId: string; label: string; storedValue: string }
  | { mode: 'other'; custom: string; label: string }

export function resolveIndustrySelection(
  value: string | null | undefined,
  groups: IndustryGroup[]
): ResolvedIndustrySelection {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return { mode: 'none' }

  for (const group of groups) {
    for (const child of group.children) {
      const label = formatIndustryLabel(group.name, child.name)
      if (trimmed === child.name || trimmed === label) {
        return {
          mode: 'preset',
          parentId: group.id,
          childId: child.id,
          label,
          storedValue: child.name,
        }
      }
    }
  }

  return { mode: 'other', custom: trimmed, label: trimmed }
}
