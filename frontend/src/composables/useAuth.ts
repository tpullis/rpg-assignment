import { ref, computed } from 'vue'

const STORAGE_KEY = 'blog_token'

// Module-level singleton: every component shares one reactive token.
const token = ref<string | null>(localStorage.getItem(STORAGE_KEY))

// Non-reactive accessor for the Apollo auth link (read at request time).
export function getToken(): string | null {
  return token.value
}

// Read the `email` claim from a JWT's payload (the middle segment), without
// verifying the signature — display only.
function readEmail(jwt: string | null): string | null {
  if (!jwt) return null
  try {
    const payload = jwt.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const data = JSON.parse(atob(padded)) as { email?: string }
    return data.email ?? null
  } catch {
    return null
  }
}

export function useAuth() {
  const isLoggedIn = computed(() => token.value !== null)
  const currentEmail = computed(() => readEmail(token.value))

  function setToken(value: string) {
    token.value = value
    localStorage.setItem(STORAGE_KEY, value)
  }

  function logout() {
    token.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return { token, isLoggedIn, currentEmail, setToken, logout }
}
