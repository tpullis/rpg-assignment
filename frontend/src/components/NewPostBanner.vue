<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useNewPostBanner } from '../composables/useNewPostBanner'

const { latestPost, dismiss } = useNewPostBanner()
const router = useRouter()

function goToAuthor() {
  const post = latestPost.value
  if (!post) return
  dismiss()
  router.push(`/users/${post.author.id}`)
}
</script>

<template>
  <div v-if="latestPost" class="banner">
    <button class="banner__body" type="button" @click="goToAuthor">
      New post: "{{ latestPost.title }}" by {{ latestPost.author.email }}
    </button>
    <button class="banner__close" type="button" aria-label="Dismiss" @click="dismiss">×</button>
  </div>
</template>

<style scoped>
.banner {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-background-mute);
  border-bottom: 1px solid var(--color-border);
}

.banner__body {
  flex: 1;
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  text-align: left;
  color: var(--color-text);
}

.banner__close {
  border: none;
  background: none;
  padding: 0 0.25rem;
  font-size: 1.25rem;
  line-height: 1;
  color: var(--color-text);
}
</style>
