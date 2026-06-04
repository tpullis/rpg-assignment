<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { GET_POSTS_BY_USER } from '../graphql/operations'
import { sortPostsByIdDesc } from '../utils/sortPosts'
import { useNewPostBanner } from '../composables/useNewPostBanner'
import PostItem from '../components/PostItem.vue'
import type { Post } from '../types'

const route = useRoute()
// getPostsByUser takes a Float; route params are strings.
const userId = computed(() => Number(route.params.id))

const { result, loading, error, refetch } = useQuery(GET_POSTS_BY_USER, () => ({
  id: userId.value,
}))

const posts = computed<Post[]>(() =>
  sortPostsByIdDesc((result.value?.getPostsByUser ?? []) as Post[]),
)

const authorEmail = computed(() => posts.value[0]?.author.email ?? '')

// Reuse the single app-wide postCreated subscription (it feeds the banner).
// When the latest new post belongs to the user being viewed, refetch the list
// so it updates in real time — whether the post was created here or elsewhere.
const { latestPost } = useNewPostBanner()
watch(latestPost, (post) => {
  if (post && Number(post.author.id) === userId.value) refetch()
})
</script>

<template>
  <section>
    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="error">Couldn't load posts: {{ error.message }}</p>
    <template v-else>
      <h1>{{ authorEmail ? `Posts by ${authorEmail}` : 'Posts' }}</h1>
      <p v-if="posts.length === 0">No posts yet.</p>
      <PostItem v-for="post in posts" :key="post.id" :post="post" @deleted="refetch" />
    </template>
  </section>
</template>
