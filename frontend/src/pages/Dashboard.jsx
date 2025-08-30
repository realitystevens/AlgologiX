import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'
import Card from '../components/Card'
import Button from '../components/Button'
import { graphAPI, resilienceAPI, routeAPI } from '../services/api'
import { Network, Zap, Route, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [graphLoaded, setGraphLoaded] = useState(false)
  const queryClient = useQueryClient()

  // Load graph mutation
  const loadGraphMutation = useMutation({
    mutationFn: graphAPI.loadGraph,
    onSuccess: (data) => {
      setGraphLoaded(true)
      toast.success(`Graph loaded: ${data.data.nodes} nodes, ${data.data.edges} edges`)
      queryClient.invalidateQueries(['resilience'])
    },
    onError: (error) => {
      toast.error('Failed to load graph: ' + error.message)
    }
  })

  // Resilience score query
  const { data: resilienceData, isLoading: resilienceLoading } = useQuery({
    queryKey: ['resilience'],
    queryFn: resilienceAPI.getScore,
    enabled: graphLoaded,
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Initial route mutation
  const initialRouteMutation = useMutation({
    mutationFn: routeAPI.getInitialRoute,
    onSuccess: (data) => {
      toast.success(`Initial routes computed! Total cost: ${data.data.total_cost.toFixed(2)}`)
      queryClient.invalidateQueries(['resilience'])
    },
    onError: (error) => {
      toast.error('Failed to compute initial routes: ' + error.response?.data?.detail || error.message)
    }
  })

  // Adaptive route mutation
  const adaptiveRouteMutation = useMutation({
    mutationFn: routeAPI.getAdaptiveRoute,
    onSuccess: (data) => {
      toast.success(`Adaptive routes computed! Total cost: ${data.data.total_cost.toFixed(2)}`)
      queryClient.invalidateQueries(['resilience'])
    },
    onError: (error) => {
      toast.error('Failed to compute adaptive routes: ' + error.response?.data?.detail || error.message)
    }
  })

  const handleLoadGraph = () => {
    loadGraphMutation.mutate({
      mode: 'synthetic',
      n_nodes: 50,
      seed: 42
    })
  }

  // Mock data for charts
  const resilienceHistory = [
    { time: '10:00', score: 0.85 },
    { time: '10:05', score: 0.82 },
    { time: '10:10', score: 0.78 },
    { time: '10:15', score: 0.81 },
    { time: '10:20', score: resilienceData?.data?.score || 0.75 },
  ]

  const routeStats = [
    { name: 'Vehicle 1', routes: 3, cost: 12.5 },
    { name: 'Vehicle 2', routes: 2, cost: 8.3 },
    { name: 'Vehicle 3', routes: 4, cost: 15.2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AlgoLogiX Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Adaptive logistics optimization with ACO, GA, and Q-Learning
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleLoadGraph}
              loading={loadGraphMutation.isPending}
              disabled={graphLoaded}
              size="lg"
            >
              <Network className="h-4 w-4 mr-2" />
              {graphLoaded ? 'Graph Loaded' : 'Load Graph'}
            </Button>
            
            <Button
              onClick={() => initialRouteMutation.mutate()}
              loading={initialRouteMutation.isPending}
              disabled={!graphLoaded}
              variant="secondary"
              size="lg"
            >
              <Route className="h-4 w-4 mr-2" />
              Compute Initial Routes
            </Button>
            
            <Button
              onClick={() => adaptiveRouteMutation.mutate()}
              loading={adaptiveRouteMutation.isPending}
              disabled={!graphLoaded}
              variant="success"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Adaptive Recompute
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Resilience Score
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {resilienceLoading ? 'Loading...' : resilienceData?.data?.score || 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Network className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Graph Status
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {graphLoaded ? 'Loaded' : 'Not Loaded'}
                  </dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Route className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Routes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {routeStats.reduce((sum, vehicle) => sum + vehicle.routes, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Cost
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {routeStats.reduce((sum, vehicle) => sum + vehicle.cost, 0).toFixed(1)}
                  </dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Resilience Score Over Time</h3>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resilienceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Route Distribution</h3>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="routes" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}
