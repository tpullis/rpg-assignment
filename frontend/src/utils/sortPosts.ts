import type { Post } from '../types'

// Posts have no timestamp yet, so the auto-increment `id` is the chronological
// proxy: newest = highest id. Swap the compare key to `createdAt` once the API
// exposes one.
export function sortPostsByIdDesc(posts: readonly Post[]): Post[] {
  return [...posts].sort((a, b) => Number(b.id) - Number(a.id))
}
