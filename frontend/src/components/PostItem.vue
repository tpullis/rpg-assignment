<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { DELETE_POST } from '../graphql/operations'
import type { Post } from '../types'

const props = defineProps<{ post: Post }>()
const emit = defineEmits<{ deleted: [] }>()

const errorMessage = ref('')
const { mutate: deletePost, loading } = useMutation(DELETE_POST)

async function onDelete() {
  if (!confirm('Delete this post?')) return
  errorMessage.value = ''
  try {
    await deletePost({ id: props.post.id })
    emit('deleted')
  } catch (e) {
    errorMessage.value = (e as Error).message
  }
}
</script>

<template>
  <article class="post">
    <div class="post__head">
      <h2 class="post__title">{{ post.title }}</h2>
      <button type="button" :disabled="loading" @click="onDelete">Delete</button>
    </div>
    <p class="post__body">{{ post.body }}</p>
    <p class="post__meta">by {{ post.author.email }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </article>
</template>

<style scoped>
.post {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border);
}

.post__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.post__title {
  font-size: 1.1rem;
  color: var(--color-heading);
}

.post__body {
  white-space: pre-wrap;
  margin: 0.5rem 0;
}

.post__meta {
  font-size: 0.85rem;
  opacity: 0.7;
}
</style>
