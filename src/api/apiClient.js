// src/api/apiClient.js
import { getUUID } from '../uuid'

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.hyeonserver.shop'

export async function apiFetch(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {
    'X-USER-UUID': getUUID(),
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