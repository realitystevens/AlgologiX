import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Card from '../components/Card'
import Button from '../components/Button'
import { eventAPI } from '../services/api'
import { AlertTriangle, Fuel, Package, Zap, Plus, Clock } from 'lucide-react'

const EVENT_TYPES = [
  {
    type: 'road_block',
    label: 'Road Block',
    icon: AlertTriangle,
    color: 'red',
    description: 'Block a road connection between two nodes'
  },
  {
    type: 'fuel_shortage',
    label: 'Fuel Shortage',
    icon: Fuel,
    color: 'orange',
    description: 'Reduce fuel capacity of a vehicle'
  },
  {
    type: 'new_order',
    label: 'New Order',
    icon: Package,
    color: 'blue',
    description: 'Add a new delivery job'
  }
]

export default function Events() {
  const [eventHistory, setEventHistory] = useState([])
  const [newEvent, setNewEvent] = useState({
    type: 'road_block',
    payload: {}
  })
  
  const queryClient = useQueryClient()

  const postEventMutation = useMutation({
    mutationFn: eventAPI.postEvent,
    onSuccess: () => {
      const eventWithTimestamp = {
        ...newEvent,
        timestamp: new Date().toISOString(),
        id: Date.now()
      }
      setEventHistory([eventWithTimestamp, ...eventHistory])
      toast.success('Event posted successfully!')
      queryClient.invalidateQueries(['resilience'])
      
      // Reset form
      setNewEvent({
        type: 'road_block',
        payload: {}
      })
    },
    onError: (error) => {
      toast.error('Failed to post event: ' + error.message)
    }
  })

  const handleEventTypeChange = (type) => {
    setNewEvent({
      type,
      payload: getDefaultPayload(type)
    })
  }

  const getDefaultPayload = (type) => {
    switch (type) {
      case 'road_block':
        return { u: 0, v: 1 }
      case 'fuel_shortage':
        return { vehicle_id: 'v1', reduction: 10.0 }
      case 'new_order':
        return { id: `d${Date.now()}`, node: 20, demand: 1.0 }
      default:
        return {}
    }
  }

  const updatePayload = (field, value) => {
    setNewEvent({
      ...newEvent,
      payload: {
        ...newEvent.payload,
        [field]: field === 'vehicle_id' || field === 'id' ? value : Number(value) || value
      }
    })
  }

  const postEvent = () => {
    if (!validatePayload()) {
      return
    }
    postEventMutation.mutate(newEvent)
  }

  const validatePayload = () => {
    const { type, payload } = newEvent
    
    switch (type) {
      case 'road_block':
        if (payload.u === undefined || payload.v === undefined) {
          toast.error('Both nodes (u and v) are required for road block')
          return false
        }
        break
      case 'fuel_shortage':
        if (!payload.vehicle_id || payload.reduction === undefined) {
          toast.error('Vehicle ID and reduction amount are required')
          return false
        }
        break
      case 'new_order':
        if (!payload.id || payload.node === undefined || payload.demand === undefined) {
          toast.error('Order ID, node, and demand are required')
          return false
        }
        break
    }
    return true
  }

  const renderPayloadForm = () => {
    const { type, payload } = newEvent

    switch (type) {
      case 'road_block':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From Node (u)</label>
              <input
                type="number"
                value={payload.u || ''}
                onChange={(e) => updatePayload('u', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To Node (v)</label>
              <input
                type="number"
                value={payload.v || ''}
                onChange={(e) => updatePayload('v', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
        )

      case 'fuel_shortage':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle ID</label>
              <input
                type="text"
                value={payload.vehicle_id || ''}
                onChange={(e) => updatePayload('vehicle_id', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., v1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reduction Amount</label>
              <input
                type="number"
                value={payload.reduction || ''}
                onChange={(e) => updatePayload('reduction', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        )

      case 'new_order':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order ID</label>
              <input
                type="text"
                value={payload.id || ''}
                onChange={(e) => updatePayload('id', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., d4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination Node</label>
              <input
                type="number"
                value={payload.node || ''}
                onChange={(e) => updatePayload('node', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Demand</label>
              <input
                type="number"
                value={payload.demand || ''}
                onChange={(e) => updatePayload('demand', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="mt-2 text-gray-600">
            Simulate real-world disruptions and changes to test adaptive routing
          </p>
        </div>
      </div>

      {/* Create New Event */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-medium text-gray-900">Create New Event</h2>
        </Card.Header>
        <Card.Body>
          {/* Event Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Event Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EVENT_TYPES.map((eventType) => {
                const Icon = eventType.icon
                const isSelected = newEvent.type === eventType.type
                return (
                  <button
                    key={eventType.type}
                    onClick={() => handleEventTypeChange(eventType.type)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      isSelected
                        ? `border-${eventType.color}-500 bg-${eventType.color}-50`
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Icon className={`h-5 w-5 mr-2 ${
                        isSelected ? `text-${eventType.color}-600` : 'text-gray-600'
                      }`} />
                      <span className="font-medium">{eventType.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{eventType.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Event Payload Form */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Event Details</label>
            {renderPayloadForm()}
          </div>

          <Button
            onClick={postEvent}
            loading={postEventMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Post Event
          </Button>
        </Card.Body>
      </Card>

      {/* Event History */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Event History</h2>
            <span className="text-sm text-gray-500">{eventHistory.length} events</span>
          </div>
        </Card.Header>
        <Card.Body>
          {eventHistory.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events posted</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by creating your first simulation event above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {eventHistory.map((event) => {
                const eventType = EVENT_TYPES.find(t => t.type === event.type)
                const Icon = eventType?.icon || AlertTriangle
                
                return (
                  <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 p-2 rounded-full bg-${eventType?.color || 'gray'}-100`}>
                      <Icon className={`h-5 w-5 text-${eventType?.color || 'gray'}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {eventType?.label || event.type}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="mt-1">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Event Impact Information */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Event Impact</h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EVENT_TYPES.map((eventType) => {
              const Icon = eventType.icon
              const count = eventHistory.filter(e => e.type === eventType.type).length
              
              return (
                <div key={eventType.type} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${eventType.color}-100`}>
                    <Icon className={`h-6 w-6 text-${eventType.color}-600`} />
                  </div>
                  <h4 className="mt-2 text-sm font-medium text-gray-900">{eventType.label}</h4>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">events posted</p>
                </div>
              )
            })}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
