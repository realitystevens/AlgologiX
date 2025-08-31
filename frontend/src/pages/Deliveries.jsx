import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Card from '../components/Card'
import Button from '../components/Button'
import { deliveryAPI } from '../services/api'
import { getDeliveryData } from '../utils/mockData'
import { Package, Plus, Trash2 } from 'lucide-react'

export default function Deliveries() {
  const { defaultDeliveries, newDeliveryTemplate } = getDeliveryData()
  
  const [deliveries, setDeliveries] = useState(defaultDeliveries)
  const [newDelivery, setNewDelivery] = useState(newDeliveryTemplate)

  const registerDeliveriesMutation = useMutation({
    mutationFn: deliveryAPI.registerDeliveries,
    onSuccess: (data) => {
      toast.success(`${data.data.count} deliveries registered successfully`)
    },
    onError: (error) => {
      toast.error('Failed to register deliveries: ' + error.message)
    }
  })

  const addDelivery = () => {
    if (!newDelivery.id) {
      toast.error('Delivery ID is required')
      return
    }
    
    if (deliveries.find(d => d.id === newDelivery.id)) {
      toast.error('Delivery ID already exists')
      return
    }

    setDeliveries([...deliveries, { ...newDelivery }])
    setNewDelivery({ ...newDeliveryTemplate })
    toast.success('Delivery added')
  }

  const removeDelivery = (id) => {
    setDeliveries(deliveries.filter(d => d.id !== id))
    toast.success('Delivery removed')
  }

  const updateDelivery = (id, field, value) => {
    setDeliveries(deliveries.map(d => 
      d.id === id ? { ...d, [field]: field === 'deadline' ? value || null : Number(value) || value } : d
    ))
  }

  const registerDeliveries = () => {
    if (deliveries.length === 0) {
      toast.error('No deliveries to register')
      return
    }
    registerDeliveriesMutation.mutate(deliveries)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Management</h1>
          <p className="mt-2 text-gray-600">
            Manage delivery jobs and destinations
          </p>
        </div>
        <Button
          onClick={registerDeliveries}
          loading={registerDeliveriesMutation.isPending}
          disabled={deliveries.length === 0}
        >
          <Package className="h-4 w-4 mr-2" />
          Register All Deliveries
        </Button>
      </div>

      {/* Add New Delivery */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-medium text-gray-900">Add New Delivery</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery ID</label>
              <input
                type="text"
                value={newDelivery.id}
                onChange={(e) => setNewDelivery({ ...newDelivery, id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., d1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination Node</label>
              <input
                type="number"
                value={newDelivery.node}
                onChange={(e) => setNewDelivery({ ...newDelivery, node: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Demand</label>
              <input
                type="number"
                value={newDelivery.demand}
                onChange={(e) => setNewDelivery({ ...newDelivery, demand: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline (Optional)</label>
              <input
                type="number"
                value={newDelivery.deadline || ''}
                onChange={(e) => setNewDelivery({ ...newDelivery, deadline: e.target.value ? Number(e.target.value) : null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.1"
                placeholder="None"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={addDelivery}>
              <Plus className="h-4 w-4 mr-2" />
              Add Delivery
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Delivery List */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-medium text-gray-900">Current Deliveries ({deliveries.length})</h2>
        </Card.Header>
        <Card.Body>
          {deliveries.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deliveries</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new delivery job.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination Node
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {delivery.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          value={delivery.node}
                          onChange={(e) => updateDelivery(delivery.id, 'node', e.target.value)}
                          className="w-20 rounded border-gray-300 text-sm"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          value={delivery.demand}
                          onChange={(e) => updateDelivery(delivery.id, 'demand', e.target.value)}
                          className="w-20 rounded border-gray-300 text-sm"
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          value={delivery.deadline || ''}
                          onChange={(e) => updateDelivery(delivery.id, 'deadline', e.target.value)}
                          className="w-20 rounded border-gray-300 text-sm"
                          min="0"
                          step="0.1"
                          placeholder="None"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => removeDelivery(delivery.id)}
                          variant="danger"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {deliveries.length}
              </div>
              <div className="text-sm text-gray-500">Total Deliveries</div>
            </div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {deliveries.reduce((sum, d) => sum + d.demand, 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Total Demand</div>
            </div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {deliveries.filter(d => d.deadline).length}
              </div>
              <div className="text-sm text-gray-500">With Deadlines</div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}
