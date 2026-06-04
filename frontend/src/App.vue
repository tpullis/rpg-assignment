<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import NewPostBanner from './components/NewPostBanner.vue'
import { usePostCreatedSubscription } from './composables/usePostCreatedSubscription'

// Start the realtime subscription once for the whole app.
usePostCreatedSubscription()
</script>

<template>
  <NewPostBanner />
  <AppHeader />
  <main class="container">
    <RouterView />
  </main>
</template>

<style scoped>
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
</style>
