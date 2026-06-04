<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { LOGIN, SIGNUP } from '../graphql/operations'
import { useAuth } from '../composables/useAuth'
import ModalShell from './ModalShell.vue'

const emit = defineEmits<{ close: [] }>()

const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const { setToken } = useAuth()
const { mutate: doLogin, loading: loginLoading } = useMutation(LOGIN)
const { mutate: doSignup, loading: signupLoading } = useMutation(SIGNUP)

async function submit() {
  errorMessage.value = ''
  try {
    if (mode.value === 'login') {
      const res = await doLogin({ loginInput: { email: email.value, password: password.value } })
      setToken(res!.data.login.accessToken)
    } else {
      const res = await doSignup({ signupInput: { email: email.value, password: password.value } })
      setToken(res!.data.signup.accessToken)
    }
    emit('close')
  } catch (e) {
    errorMessage.value = (e as Error).message
  }
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'signup' : 'login'
  errorMessage.value = ''
}
</script>

<template>
  <ModalShell @close="emit('close')">
    <h2>{{ mode === 'login' ? 'Log in' : 'Sign up' }}</h2>
    <form @submit.prevent="submit">
      <label>
        Email
        <input v-model="email" type="email" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" minlength="8" required />
      </label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="actions">
        <button type="submit" :disabled="loginLoading || signupLoading">
          {{ mode === 'login' ? 'Log in' : 'Sign up' }}
        </button>
        <button type="button" @click="emit('close')">Cancel</button>
      </div>
    </form>
    <button type="button" class="toggle" @click="toggleMode">
      {{ mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in' }}
    </button>
  </ModalShell>
</template>

<style scoped>
.toggle {
  margin-top: 0.75rem;
  border: none;
  background: none;
  padding: 0;
  color: var(--color-heading);
  text-decoration: underline;
}
</style>
