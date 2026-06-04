<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { GET_USERS } from '../graphql/operations'
import UserCard from '../components/UserCard.vue'
import type { User } from '../types'

const { result, loading, error } = useQuery(GET_USERS)
const users = computed<User[]>(() => (result.value?.getUsers ?? []) as User[])
</script>

<template>
  <section>
    <h1>Users</h1>
    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="error">Couldn't load users: {{ error.message }}</p>
    <p v-else-if="users.length === 0">No users yet.</p>
    <div v-else class="grid">
      <UserCard v-for="user in users" :key="user.id" :user="user" />
    </div>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
</style>
