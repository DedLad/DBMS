import { useState, useEffect } from 'react'
import { Users, Building2, Factory, Cog, Package, Clipboard } from 'lucide-react'
import { api } from '../api'
import './Dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    factories: 0,
    machines: 0,
    products: 0,
    orders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const entities = [
        { key: 'employees', endpoint: '/employees' },
        { key: 'departments', endpoint: '/departments' },
        { key: 'factories', endpoint: '/factories' },
        { key: 'machines', endpoint: '/machines' },
        { key: 'products', endpoint: '/products' },
        { key: 'orders', endpoint: '/orders' }
      ]

      const results = await Promise.all(
        entities.map(entity =>
          api.get(entity.endpoint)
            .then(data => ({ key: entity.key, count: Array.isArray(data) ? data.length : 0 }))
            .catch(() => ({ key: entity.key, count: 0 }))
        )
      )

      const newStats = {}
      results.forEach(result => {
        newStats[result.key] = result.count
      })
      setStats(newStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      key: 'employees',
      label: 'Employees',
      icon: Users,
      color: '#FF6B6B',
      bgColor: 'rgba(255, 107, 107, 0.1)'
    },
    {
      key: 'departments',
      label: 'Departments',
      icon: Building2,
      color: '#4ECDC4',
      bgColor: 'rgba(78, 205, 196, 0.1)'
    },
    {
      key: 'factories',
      label: 'Factories',
      icon: Factory,
      color: '#FFE66D',
      bgColor: 'rgba(255, 230, 109, 0.1)'
    },
    {
      key: 'machines',
      label: 'Machines',
      icon: Cog,
      color: '#95E1D3',
      bgColor: 'rgba(149, 225, 211, 0.1)'
    },
    {
      key: 'products',
      label: 'Products',
      icon: Package,
      color: '#F38181',
      bgColor: 'rgba(243, 129, 129, 0.1)'
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: Clipboard,
      color: '#AA96DA',
      bgColor: 'rgba(170, 150, 218, 0.1)'
    }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Factory Management System Overview</p>
        </div>
        <button 
          className="refresh-btn"
          onClick={loadStats}
          disabled={loading}
          title="Refresh statistics"
        >
          {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </div>

      <div className="stats-grid">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <div
              key={card.key}
              className="stat-card"
              style={{
                '--color': card.color,
                '--bg-color': card.bgColor
              }}
            >
              <div className="stat-icon-wrapper">
                <Icon size={24} color={card.color} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{card.label}</p>
                <p className="stat-value">{loading ? '-' : stats[card.key]}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>📊 Quick Stats</h3>
          <p>Total Entities: {Object.values(stats).reduce((a, b) => a + b, 0)}</p>
          <p>Last Updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
}
