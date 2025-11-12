import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import './Modal.css'

export default function Modal({ title, fields, initialData, onSave, onClose }) {
  const [form, setForm] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(initialData || {})
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
    
    setError('')
    onSave(form)
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
