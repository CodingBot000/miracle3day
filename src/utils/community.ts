export const ANONYMOUS_CATEGORY_NAME = 'anonymous'

export function isAnonymousCategoryName(name?: string | null) {
  if (!name) return false
  return name.trim().toLowerCase() === ANONYMOUS_CATEGORY_NAME
}

export const ANONYMOUS_FALLBACK = {
  name: 'Anonymous',
  avatar: '/logo/logo_icon.png',
}
