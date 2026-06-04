import { watch } from 'vue'
import { useSubscription } from '@vue/apollo-composable'
import { POST_CREATED } from '../graphql/operations'
import { useNewPostBanner } from './useNewPostBanner'
import type { Post } from '../types'

// Subscribes to postCreated and pushes each new post into the banner slot.
// Call once, at the app root.
export function usePostCreatedSubscription() {
  const { result } = useSubscription(POST_CREATED)
  const { show } = useNewPostBanner()

  watch(result, (data) => {
    const post = (data as { postCreated?: Post } | null)?.postCreated
    if (post) show(post)
  })
}
