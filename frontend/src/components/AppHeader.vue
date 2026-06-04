<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AuthModal from './AuthModal.vue'
import CreatePostModal from './CreatePostModal.vue'

const { isLoggedIn, currentEmail, logout } = useAuth()
const showAuth = ref(false)
const showCreate = ref(false)
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="header__brand">Blog</RouterLink>
    <nav class="header__nav">
      <template v-if="isLoggedIn">
        <span class="header__user">Signed in as <strong>{{ currentEmail }}</strong></span>
        <button type="button" @click="showCreate = true">+ New Post</button>
        <button type="button" @click="logout">Log out</button>
      </template>
      <template v-else>
        <button type="button" @click="showAuth = true">Log in / Sign up</button>
      </template>
    </nav>
  </header>

  <AuthModal v-if="showAuth" @close="showAuth = false" />
  <CreatePostModal v-if="showCreate" @close="showCreate = false" />
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.header__brand {
  font-weight: 600;
  color: var(--color-heading);
}

.header__nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header__user {
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.8;
}
</style>
