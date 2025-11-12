import { Moon, Sun, Network } from 'lucide-react'
import './Sidebar.css'

const PAGES = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'employees', icon: '👥', label: 'Employees' },
  { id: 'departments', icon: '🏢', label: 'Departments' },
  { id: 'factories', icon: '🏭', label: 'Factories' },
  { id: 'machines', icon: '⚙️', label: 'Machines' },
  { id: 'products', icon: '📦', label: 'Products' },
  { id: 'orders', icon: '📋', label: 'Orders' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
  { id: 'db-objects', icon: '🔧', label: 'DB Objects' },
  { id: 'users', icon: '🛡️', label: 'Users & Roles' },
]

export default function Sidebar({ page, onPageChange, connected, dark, onToggleDark }) {
  return (
    <aside className="sidebar">
      <div className="logo">🏭 Factory</div>
      <nav className="nav">
        {PAGES.map(p => (
          <button
            key={p.id}
            className={`nav-item ${page === p.id ? 'active' : ''}`}
            onClick={() => onPageChange(p.id)}
            title={p.label}
          >
            <span className="nav-icon">{p.icon}</span>
            <span className="nav-label">{p.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
          <Network size={16} />
          <span>{connected ? 'Connected' : 'Offline'}</span>
        </div>
        <button className="icon-btn" onClick={onToggleDark} title="Toggle dark mode">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </aside>
  )
}
