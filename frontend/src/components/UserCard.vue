<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { User } from '../types'

defineProps<{ user: User }>()
</script>

<template>
  <RouterLink :to="`/users/${user.id}`" class="card">
    <span class="card__email">{{ user.email }}</span>
    <span class="card__count">{{ user.posts?.length ?? 0 }} posts</span>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.card:hover {
  border-color: var(--color-border-hover);
}

.card__email {
  font-weight: 600;
  color: var(--color-heading);
}

.card__count {
  font-size: 0.85rem;
  opacity: 0.7;
}
</style>
