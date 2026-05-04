const AUTH_TOKEN_KEY = 'sikasir_auth_token'
const AUTH_META_KEY = 'sikasir_auth_meta'

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || ''
}

export function setAuthToken(token) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    return
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getAuthMeta() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AUTH_META_KEY) || '{}')
    return {
      username: parsed.username || 'guest',
      role: parsed.role || 'guest',
    }
  } catch {
    return { username: 'guest', role: 'guest' }
  }
}

export function setAuthMeta(meta) {
  localStorage.setItem(
    AUTH_META_KEY,
    JSON.stringify({
      username: meta?.username || 'guest',
      role: meta?.role || 'guest',
    })
  )
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_META_KEY)
}
