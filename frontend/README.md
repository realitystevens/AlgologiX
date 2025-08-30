# AlgoLogiX Frontend

Dashboard for the AlgoLogiX adaptive logistics optimizer. Provides a web interface to interact with the backend and visualize the optimization algorithms in action. Built using React.js.

URL to Frontend - [algologi-x.vercel.app/](https://algologi-x.vercel.app/)

## Features

- **Dashboard**: Real-time monitoring of system status and resilience scores
- **Vehicle Management**: Add, edit, and register delivery vehicles
- **Delivery Management**: Manage delivery jobs and destinations
- **Route Visualization**: View computed routes from Dijkstra, ACO, and GA algorithms
- **Event Simulation**: Post disruption events (road blocks, fuel shortages, new orders)
- **Real-time Updates**: Live monitoring with automatic data refresh

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and state management
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- The AlgoLogiX backend running on `http://localhost:8000`

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage Workflow

### 1. Load Graph

- Go to Dashboard
- Click "Load Graph" to initialize a synthetic road network
- This creates a 50-node graph with weighted edges

### 2. Register Vehicles

- Navigate to "Vehicles" page
- Add vehicles with their starting positions and capacities
- Click "Register All Vehicles" to send to backend

### 3. Register Deliveries

- Navigate to "Deliveries" page
- Add delivery jobs with destinations and demand
- Click "Register All Deliveries" to send to backend

### 4. Compute Routes

- Go to "Routes" page
- Click "Compute Initial Routes" for Dijkstra + VRP solution
- Use "Adaptive Recompute" for ACO/GA optimization

### 5. Simulate Events

- Navigate to "Events" page
- Post disruption events:
  - **Road Block**: Block connections between nodes
  - **Fuel Shortage**: Reduce vehicle fuel capacity
  - **New Order**: Add urgent delivery jobs
- After posting events, go back to Routes and run "Adaptive Recompute"

### 6. Monitor Performance

- Dashboard shows real-time resilience scores
- View route costs and optimization metrics
- Track how the system adapts to disruptions

## API Integration

The frontend communicates with the backend via REST API:

- `POST /graph/load` - Load synthetic graph
- `POST /vehicles` - Register vehicle fleet
- `POST /deliveries` - Register delivery jobs
- `POST /route/initial` - Compute initial routes (Dijkstra + VRP)
- `POST /route/adaptive` - Recompute routes (ACO + GA + RL)
- `POST /events` - Post disruption events
- `GET /score/resilience` - Get current resilience score

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main app layout with navigation
│   ├── Button.jsx      # Button component with variants
│   └── Card.jsx        # Card container component
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # System overview and quick actions
│   ├── Vehicles.jsx    # Vehicle fleet management
│   ├── Deliveries.jsx  # Delivery job management
│   ├── Routes.jsx      # Route visualization and computation
│   └── Events.jsx      # Event simulation and history
├── services/           # API integration
│   └── api.js         # Axios HTTP client and API functions
├── App.jsx            # Main app component with routing
└── main.jsx           # App entry point
```

## Environment Variables

Create a `.env` file for custom configuration:

```env
VITE_API_URL=http://localhost:8000
```

## Algorithms Visualized

### Initial Routing

- **Dijkstra's Algorithm**: Shortest path computation
- **Clarke-Wright Savings**: Vehicle Routing Problem heuristic
- **Capacity Constraints**: Respects vehicle load limits

### Adaptive Routing

- **Genetic Algorithm**: Job reassignment optimization
- **Ant Colony Optimization**: Dynamic pathfinding with pheromones
- **Q-Learning**: Reinforcement learning for continuous improvement
- **Event Response**: Adapts to road blocks, capacity changes, new orders

## Demo Scenarios

### Basic Flow

1. Load graph → Register 2 vehicles → Add 3 deliveries → Compute initial routes
2. Post a road block event → Run adaptive recompute → See route changes

### Stress Testing

1. Add many vehicles and deliveries
2. Post multiple disruption events rapidly
3. Monitor resilience score degradation and recovery
4. Compare initial vs adaptive route costs

### Algorithm Comparison

1. Compute initial routes and note the cost
2. Post events to create suboptimal conditions
3. Run adaptive recompute to see ACO/GA optimization
4. Compare costs to measure improvement

## Contributing

1. Follow React best practices and hooks patterns
2. Use Tailwind utility classes for styling
3. Implement proper error handling with toast notifications
4. Add loading states for all async operations
5. Keep components focused and reusable

## Hackathon Notes

This frontend was built for the AlgoFest Hackathon to demonstrate:

- Real-time adaptive logistics optimization
- Integration of multiple AI/ML algorithms (ACO, GA, Q-Learning)
- Interactive visualization of complex optimization problems
- Practical applications of graph theory and operations research

The interface prioritizes functionality and clear visualization over polish, perfect for technical demonstrations and algorithm testing.
