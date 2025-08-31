import mockData from '../data/mockData.json'

// Dashboard data
export const getDashboardData = () => ({
  resilienceHistory: mockData.dashboard.resilienceHistory,
  routeStats: mockData.dashboard.routeStats
})

// Vehicle data
export const getVehicleData = () => ({
  defaultVehicles: mockData.vehicles.defaultVehicles,
  newVehicleTemplate: mockData.vehicles.newVehicleTemplate
})

// Delivery data
export const getDeliveryData = () => ({
  defaultDeliveries: mockData.deliveries.defaultDeliveries,
  newDeliveryTemplate: mockData.deliveries.newDeliveryTemplate
})

// Event data
export const getEventData = () => ({
  eventTypes: mockData.events.eventTypes,
  newEventTemplate: mockData.events.newEventTemplate
})

// Graph data
export const getGraphData = () => mockData.graph.defaultSettings

// Utility function to update resilience history with real data
export const updateResilienceHistory = (currentScore) => {
  const history = [...mockData.dashboard.resilienceHistory]
  history[history.length - 1] = {
    ...history[history.length - 1],
    score: currentScore
  }
  return history
}
