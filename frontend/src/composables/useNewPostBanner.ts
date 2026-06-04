import { ref } from 'vue'
import type { Post } from '../types'

// Single shared slot. Showing a new post overwrites the previous one, so at most
// one banner is ever visible (latest-wins).
const latestPost = ref<Post | null>(null)

export function useNewPostBanner() {
  function show(post: Post) {
    latestPost.value = post
  }
  function dismiss() {
    latestPost.value = null
  }
  return { latestPost, show, dismiss }
}
