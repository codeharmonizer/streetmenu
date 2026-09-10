export function categorySectionId(sectionPrefix: string, category: string) {
  const safe = category
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

  return `${sectionPrefix}-${safe || 'uncategorized'}`
}
