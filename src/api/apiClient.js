// src/api/apiClient.js
const API_BASE = 'https://api.hyeonserver.shop'
const USER_UUID = 'test-uuid-001' // TODO: 로그인 붙이면 교체

export async function apiFetch(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {
    'X-USER-UUID': USER_UUID,
  }

  if (body && !isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  if (res.status === 204) return null

  const text = await res.text()
  // const data = text ? JSON.parse(text) : null
  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  
  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}