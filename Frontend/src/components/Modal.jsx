import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import './Modal.css'

export default function Modal({ title, fields, initialData, onSave, onClose }) {
  const [form, setForm] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    // Normalize incoming data, especially dates to YYYY-MM-DD for <input type="date">
    const src = initialData || {}
    const normalized = {}
    for (const f of (fields || [])) {
      let v = src[f.key]
      if (f.type === 'date' && v) {
        const d = new Date(v)
        if (!isNaN(d)) {
          v = d.toISOString().slice(0, 10)
        }
      }
      normalized[f.key] = v ?? ''
    }
    setForm(normalized)
    setError('')
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    for (const field of fields) {
      if (!form[field.key]) {
        setError(`${field.label} is required`)
        return
      }
    }
    
    // Ensure date values are serialized as YYYY-MM-DD
    const payload = { ...form }
    for (const f of (fields || [])) {
      if (f.type === 'date' && payload[f.key]) {
        const val = payload[f.key]
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          // already OK
        } else {
          const d = new Date(val)
          if (!isNaN(d)) {
            payload[f.key] = d.toISOString().slice(0, 10)
          }
        }
      }
      if (f.type === 'number' && payload[f.key] !== '' && payload[f.key] !== null && payload[f.key] !== undefined) {
        payload[f.key] = Number(payload[f.key])
      }
    }

    setError('')
    onSave(payload)
  }

  const handleChange = (key, value, type) => {
    setForm({
      ...form,
      [key]: type === 'number' ? Number(value) : value
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose} title="Close">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          {fields.map(field => (
            <div key={field.key} className="form-group">
              <label>{field.label} *</label>
              {field.type === 'select' ? (
                <select
                  value={form[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value, field.type)}
                >
                  <option value="">-- Select {field.label} --</option>
                  {field.options && field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={form[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value, field.type)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
