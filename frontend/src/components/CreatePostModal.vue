<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { CREATE_POST } from '../graphql/operations'
import ModalShell from './ModalShell.vue'

const emit = defineEmits<{ close: [] }>()

const title = ref('')
const body = ref('')
const errorMessage = ref('')

const { mutate: createPost, loading } = useMutation(CREATE_POST)

async function submit() {
  errorMessage.value = ''
  try {
    await createPost({ createPostInput: { title: title.value, body: body.value } })
    emit('close')
  } catch (e) {
    errorMessage.value = (e as Error).message
  }
}
</script>

<template>
  <ModalShell @close="emit('close')">
    <h2>New post</h2>
    <form @submit.prevent="submit">
      <label>
        Title
        <input v-model="title" required />
      </label>
      <label>
        Body
        <textarea v-model="body" required></textarea>
      </label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="actions">
        <button type="submit" :disabled="loading">Publish</button>
        <button type="button" @click="emit('close')">Cancel</button>
      </div>
    </form>
  </ModalShell>
</template>
