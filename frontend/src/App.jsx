import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Deliveries from './pages/Deliveries'
import RoutesPage from './pages/Routes'
import Events from './pages/Events'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </Layout>
  )
}

export default App
