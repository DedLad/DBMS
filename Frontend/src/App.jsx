import { useState, useEffect } from 'react'
import { api } from './api'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CRUD from './pages/CRUD'
import Analytics from './pages/Analytics'
import DatabaseObjects from './pages/DatabaseObjects'
import Users from './pages/Users'
import './App.css'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [connected, setConnected] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('dark') === 'true')

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem('dark', dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const checkConnection = async () => {
    try {
      await api.get('/employees')
      setConnected(true)
    } catch {
      setConnected(false)
    }
  }

  return (
    <div className="app">
      <Sidebar 
        page={page} 
        onPageChange={setPage}
        connected={connected}
        dark={dark}
        onToggleDark={() => setDark(!dark)}
      />
      <main className="main">
        {page === 'dashboard' && <Dashboard />}
        {['employees', 'departments', 'factories', 'machines', 'products', 'orders'].includes(page) && 
          <CRUD entity={page} />}
        {page === 'analytics' && <Analytics />}
        {page === 'db-objects' && <DatabaseObjects />}
        {page === 'users' && <Users />}
      </main>
    </div>
  )
}
