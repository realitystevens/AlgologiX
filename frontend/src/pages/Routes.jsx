import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Card from '../components/Card'
import Button from '../components/Button'
import { routeAPI } from '../services/api'
import { Route, Zap, MapPin, Clock } from 'lucide-react'

export default function Routes() {
  const [routes, setRoutes] = useState({})
  const [routeDetails, setRouteDetails] = useState({})
  const [totalCost, setTotalCost] = useState(0)

  const initialRouteMutation = useMutation({
    mutationFn: routeAPI.getInitialRoute,
    onSuccess: (data) => {
      setRoutes(data.data.routes)
      setTotalCost(data.data.total_cost)
      setRouteDetails({})
      toast.success('Initial routes computed successfully!')
    },
    onError: (error) => {
      toast.error('Failed to compute initial routes: ' + error.response?.data?.detail || error.message)
    }
  })

  const adaptiveRouteMutation = useMutation({
    mutationFn: routeAPI.getAdaptiveRoute,
    onSuccess: (data) => {
      setRoutes(data.data.routes)
      setTotalCost(data.data.total_cost)
      setRouteDetails(data.data.details || {})
      toast.success('Adaptive routes computed successfully!')
    },
    onError: (error) => {
      toast.error('Failed to compute adaptive routes: ' + error.response?.data?.detail || error.message)
    }
  })

  const hasRoutes = Object.keys(routes).length > 0
  const vehicleIds = Object.keys(routes)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Route Management</h1>
          <p className="mt-2 text-gray-600">
            Compute and manage delivery routes using Dijkstra, ACO, and GA algorithms
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => initialRouteMutation.mutate()}
            loading={initialRouteMutation.isPending}
            variant="secondary"
          >
            <Route className="h-4 w-4 mr-2" />
            Compute Initial Routes
          </Button>
          <Button
            onClick={() => adaptiveRouteMutation.mutate()}
            loading={adaptiveRouteMutation.isPending}
            variant="success"
          >
            <Zap className="h-4 w-4 mr-2" />
            Adaptive Recompute
          </Button>
        </div>
      </div>

      {/* Route Summary */}
      {hasRoutes && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <Card.Body>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {vehicleIds.length}
                </div>
                <div className="text-sm text-gray-500">Active Vehicles</div>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(routes).reduce((sum, route) => sum + route.length, 0)}
                </div>
                <div className="text-sm text-gray-500">Total Waypoints</div>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Total Cost</div>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(routeDetails?.segments || {}).length}
                </div>
                <div className="text-sm text-gray-500">Route Segments</div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Route Details */}
      {hasRoutes ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vehicleIds.map((vehicleId) => {
            const route = routes[vehicleId]
            const segments = routeDetails?.segments?.[vehicleId] || []
            
            return (
              <Card key={vehicleId}>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Route className="h-5 w-5 mr-2 text-blue-600" />
                      {vehicleId}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {route.length} stops
                      </span>
                      {segments.length > 0 && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {segments.length} segments
                        </span>
                      )}
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body>
                  {/* Route Path */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Route Path:</h4>
                    <div className="flex flex-wrap gap-1">
                      {route.map((node, index) => (
                        <span key={index} className="inline-flex items-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            index === 0 ? 'bg-green-100 text-green-800' : 
                            index === route.length - 1 ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {node}
                          </span>
                          {index < route.length - 1 && (
                            <span className="mx-1 text-gray-400">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Segments Details */}
                  {segments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Segment Details:</h4>
                      <div className="space-y-2">
                        {segments.map((segment, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">
                              {segment.from} → {segment.to}
                            </span>
                            <span className="text-xs text-gray-500">
                              {segment.len} hops
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <Card.Body>
            <div className="text-center py-12">
              <Route className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No routes computed</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by computing initial routes or use adaptive recomputation.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Button
                  onClick={() => initialRouteMutation.mutate()}
                  loading={initialRouteMutation.isPending}
                  variant="secondary"
                >
                  <Route className="h-4 w-4 mr-2" />
                  Compute Initial Routes
                </Button>
                <Button
                  onClick={() => adaptiveRouteMutation.mutate()}
                  loading={adaptiveRouteMutation.isPending}
                  variant="success"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Adaptive Recompute
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Algorithm Information */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Algorithm Information</h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Initial Routes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Uses Dijkstra's algorithm for shortest paths</li>
                <li>• Clarke-Wright savings heuristic for VRP</li>
                <li>• Considers vehicle capacity constraints</li>
                <li>• Assigns deliveries to nearest available vehicle</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Adaptive Routes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Genetic Algorithm for job reassignment</li>
                <li>• Ant Colony Optimization for pathfinding</li>
                <li>• Q-Learning for continuous improvement</li>
                <li>• Adapts to road blocks and capacity changes</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
