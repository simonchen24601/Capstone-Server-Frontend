import axios from 'axios'

// Base HTTP client for the IoT control panel
export const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: log errors in dev
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (import.meta.env.DEV) {
      console.error('API error:', err?.response?.status, err?.message)
    }
    return Promise.reject(err)
  }
)

// Common endpoints — adjust to your backend routes
export const health = () => api.get('/health')
// Accept optional config so callers can pass headers like X-API-Key
export const getDevices = (config) => api.get('/devices', config)
export const getDeviceById = (id) => api.get(`/devices/${id}`)
export const updateDevice = (id, payload) => api.put(`/devices/${id}`, payload)
export const triggerAction = (id, action, payload) => api.post(`/devices/${id}/actions/${action}`, payload)

// Generic helpers
export const get = (url, config) => api.get(url, config)
export const post = (url, data, config) => api.post(url, data, config)
export const put = (url, data, config) => api.put(url, data, config)
export const del = (url, config) => api.delete(url, config)

// Temperature APIs
// List latest 100 records; optional device_id filter
export const getTemperatureList = (params = {}, config = {}) =>
  api.get('/sensor/temperature', { ...config, params })

// Create a temperature record
export const postTemperature = (data, config = {}) =>
  api.post('/sensor/temperature', data, config)

// Get a single record by id
export const getTemperatureById = (id, config = {}) =>
  api.get(`/sensor/temperature/${id}`, config)

// Get the latest record; optional device_id filter
export const getTemperatureLatest = (params = {}, config = {}) =>
  api.get('/sensor/temperature/latest', { ...config, params })
