import { describe, it, expect, beforeEach } from 'vitest'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuth().logout() // reset module-level state between tests
  })

  it('starts logged out', () => {
    expect(useAuth().isLoggedIn.value).toBe(false)
  })

  it('stores the token and reports logged in', () => {
    const { isLoggedIn, setToken } = useAuth()
    setToken('abc')
    expect(isLoggedIn.value).toBe(true)
    expect(localStorage.getItem('blog_token')).toBe('abc')
  })

  it('clears the token on logout', () => {
    const { isLoggedIn, setToken, logout } = useAuth()
    setToken('abc')
    logout()
    expect(isLoggedIn.value).toBe(false)
    expect(localStorage.getItem('blog_token')).toBeNull()
  })

  it('exposes the email decoded from the JWT', () => {
    // base64url-encoded JWT: header.payload.signature
    const base64url = (obj: object) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const jwt = `${base64url({ alg: 'HS256' })}.${base64url({ sub: 1, email: 'me@example.com' })}.sig`

    const { currentEmail, setToken } = useAuth()
    expect(currentEmail.value).toBeNull()
    setToken(jwt)
    expect(currentEmail.value).toBe('me@example.com')
  })

  it('returns null email for a malformed token', () => {
    const { currentEmail, setToken } = useAuth()
    setToken('not-a-jwt')
    expect(currentEmail.value).toBeNull()
  })
})
