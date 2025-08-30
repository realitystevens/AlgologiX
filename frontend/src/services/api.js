import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Graph API
export const graphAPI = {
  loadGraph: (data) => api.post('/graph/load', data),
}

// Vehicle API
export const vehicleAPI = {
  registerVehicles: (vehicles) => api.post('/vehicles', vehicles),
}

// Delivery API
export const deliveryAPI = {
  registerDeliveries: (deliveries) => api.post('/deliveries', deliveries),
}

// Route API
export const routeAPI = {
  getInitialRoute: () => api.post('/route/initial'),
  getAdaptiveRoute: () => api.post('/route/adaptive'),
}

// Event API
export const eventAPI = {
  postEvent: (event) => api.post('/events', event),
}

// Resilience API
export const resilienceAPI = {
  getScore: () => api.get('/score/resilience'),
}

export default api
