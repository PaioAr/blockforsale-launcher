import { HashRouter, Routes, Route } from 'react-router-dom'
import Events from './pages/Events'
import Login from './pages/Login'
import Settings from './pages/Settings'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  )
}

export default App