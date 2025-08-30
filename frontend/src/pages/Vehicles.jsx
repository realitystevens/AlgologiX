import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Card from '../components/Card'
import Button from '../components/Button'
import { vehicleAPI } from '../services/api'
import { Truck, Plus, Trash2 } from 'lucide-react'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([
    { id: 'v1', start_node: 0, fuel_capacity: 100, load_capacity: 10 },
    { id: 'v2', start_node: 1, fuel_capacity: 100, load_capacity: 10 },
  ])

  const [newVehicle, setNewVehicle] = useState({
    id: '',
    start_node: 0,
    fuel_capacity: 100,
    load_capacity: 10
  })

  const registerVehiclesMutation = useMutation({
    mutationFn: vehicleAPI.registerVehicles,
    onSuccess: (data) => {
      toast.success(`${data.data.count} vehicles registered successfully`)
    },
    onError: (error) => {
      toast.error('Failed to register vehicles: ' + error.message)
    }
  })

  const addVehicle = () => {
    if (!newVehicle.id) {
      toast.error('Vehicle ID is required')
      return
    }
    
    if (vehicles.find(v => v.id === newVehicle.id)) {
      toast.error('Vehicle ID already exists')
      return
    }

    setVehicles([...vehicles, { ...newVehicle }])
    setNewVehicle({ id: '', start_node: 0, fuel_capacity: 100, load_capacity: 10 })
    toast.success('Vehicle added')
  }

  const removeVehicle = (id) => {
    setVehicles(vehicles.filter(v => v.id !== id))
    toast.success('Vehicle removed')
  }

  const updateVehicle = (id, field, value) => {
    setVehicles(vehicles.map(v => 
      v.id === id ? { ...v, [field]: Number(value) || value } : v
    ))
  }

  const registerVehicles = () => {
    if (vehicles.length === 0) {
      toast.error('No vehicles to register')
      return
    }
    registerVehiclesMutation.mutate(vehicles)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your fleet of delivery vehicles
          </p>
        </div>
        <Button
          onClick={registerVehicles}
          loading={registerVehiclesMutation.isPending}
          disabled={vehicles.length === 0}
        >
          <Truck className="h-4 w-4 mr-2" />
          Register All Vehicles
        </Button>
      </div>

      {/* Add New Vehicle */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-medium text-gray-900">Add New Vehicle</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle ID</label>
              <input
                type="text"
                value={newVehicle.id}
                onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., v1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Node</label>
              <input
                type="number"
                value={newVehicle.start_node}
                onChange={(e) => setNewVehicle({ ...newVehicle, start_node: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Capacity</label>
              <input
                type="number"
                value={newVehicle.fuel_capacity}
                onChange={(e) => setNewVehicle({ ...newVehicle, fuel_capacity: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Load Capacity</label>
              <input
                type="number"
                value={newVehicle.load_capacity}
                onChange={(e) => setNewVehicle({ ...newVehicle, load_capacity: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={addVehicle}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Vehicle List */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-medium text-gray-900">Current Vehicles ({vehicles.length})</h2>
        </Card.Header>
        <Card.Body>
          {vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new vehicle.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Node
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fuel Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vehicle.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          value={vehicle.start_node}
                          onChange={(e) => updateVehicle(vehicle.id, 'start_node', e.target.value)}
                          className="w-20 rounded border-gray-300 text-sm"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          value={vehicle.fuel_capacity}
                          onChange={(e) => updateVehicle(vehicle.id, 'fuel_capacity', e.target.value)}
                          className="w-20 rounded border-gray-300 text-sm"
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          value={vehicle.load_capacity}
                          onChange={(e) => updateVehicle(vehicle.id, 'load_capacity', e.target.value)}
                          className="w-20 rounded border-gray-300 text-sm"
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => removeVehicle(vehicle.id)}
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
    </div>
  )
}
