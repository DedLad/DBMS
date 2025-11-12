import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
})

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err.message)
)

export const apiCall = async (url, options = {}) => {
  try {
    const method = options.method || 'GET'
    const config = { ...options }
    if (options.body && typeof options.body === 'string') {
      config.data = JSON.parse(options.body)
    } else if (options.body) {
      config.data = options.body
    }
    return await api[method.toLowerCase()](url, config.data)
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
