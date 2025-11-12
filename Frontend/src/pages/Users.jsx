import { useEffect, useState } from 'react'
import { Shield, UserPlus, RefreshCcw, AlertCircle, CheckCircle } from 'lucide-react'
import './Users.css'
import { apiCall } from '../api'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', role: 'operator' })
  const [message, setMessage] = useState(null)

  const load = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await apiCall('/users', { method: 'GET' })
      setUsers(data.users || [])
    } catch (e) {
      setMessage({ type: 'error', text: e?.message || 'Failed to load users' })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setMessage({ type: 'error', text: 'Username and password are required' })
      return
    }
    setLoading(true)
    try {
      const res = await apiCall('/users', { method: 'POST', body: JSON.stringify(form) })
      setMessage({ type: 'success', text: res.message || 'User created' })
      setForm({ username: '', password: '', role: form.role })
      load()
    } catch (e) {
      setMessage({ type: 'error', text: e?.message || 'Failed to create user' })
    } finally { setLoading(false) }
  }

  return (
    <div className="users-page">
      <div className="header">
        <div>
          <h1>Users & Roles</h1>
          <p>Create MySQL users and assign scoped privileges</p>
        </div>
        <Shield className="icon" size={32} />
      </div>

      {message && (
        <div className={`msg ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid">
        <form className="card" onSubmit={submit}>
          <h3>Create User</h3>
          <div className="row">
            <label>Username</label>
            <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} placeholder="e.g., analyst01" />
          </div>
          <div className="row">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="min 6 chars" />
          </div>
          <div className="row">
            <label>Role</label>
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              <option value="admin">Admin (full privileges)</option>
              <option value="operator">Operator (CRUD on core tables)</option>
              <option value="analyst">Analyst (SELECT + EXECUTE)</option>
            </select>
          </div>
          <button className="btn" disabled={loading}>
            <UserPlus size={16} /> {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>

        <div className="card">
          <div className="list-header">
            <h3>Existing Users</h3>
            <button className="btn ghost" onClick={load} disabled={loading}><RefreshCcw size={16} /> Refresh</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Host</th>
                  <th>Role (inferred)</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan="3" className="empty">No users found</td></tr>
                )}
                {users.map((u,i)=> (
                  <tr key={i}>
                    <td>{u.user}</td>
                    <td>{u.host}</td>
                    <td><span className={`pill ${u.role}`}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
