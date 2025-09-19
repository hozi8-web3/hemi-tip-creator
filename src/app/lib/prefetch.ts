// Simple in-memory prefetch cache for creator profiles
const prefetchedCreators: Map<string, any> = new Map()

export async function prefetchCreator(address: string) {
  if (!address) return null
  const key = address.toLowerCase()
  if (prefetchedCreators.has(key)) return prefetchedCreators.get(key)

  try {
    const res = await fetch(`/api/creator/${key}`)
    if (!res.ok) return null
    const data = await res.json()
    prefetchedCreators.set(key, data)

    // Warm up avatar image if present
    if (data?.profile?.avatarURI) {
      const img = new Image()
      img.src = data.profile.avatarURI
    }

    return data
  } catch (e) {
    console.error('Prefetch failed', e)
    return null
  }
}

export function getPrefetchedCreator(address: string) {
  if (!address) return undefined
  return prefetchedCreators.get(address.toLowerCase())
}

export function clearPrefetchedCreator(address: string) {
  if (!address) return
  prefetchedCreators.delete(address.toLowerCase())
}

export function clearAllPrefetched() {
  prefetchedCreators.clear()
}
