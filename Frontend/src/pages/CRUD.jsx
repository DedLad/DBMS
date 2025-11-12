import { useState, useEffect } from 'react'
import { Trash2, Edit2, Plus, AlertCircle } from 'lucide-react'
import Modal from '../components/Modal'
import '../pages/CRUD.css'
import { apiCall } from '../api'

export default function CRUD({ entity }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const getConfig = () => {
    const configs = {
      employees: {
        title: 'Employees',
        idField: 'E_ID',
        fields: [
          { key: 'E_ID', label: 'Employee ID', type: 'text', required: true },
          { key: 'FName', label: 'First Name', type: 'text', required: true },
          { key: 'LName', label: 'Last Name', type: 'text', required: true },
          { key: 'Email', label: 'Email', type: 'email', required: true },
          { key: 'Position', label: 'Position', type: 'text', required: true },
          { key: 'Category', label: 'Category', type: 'text', required: true },
          { key: 'Salary', label: 'Salary', type: 'number', required: true },
          { key: 'Hire_date', label: 'Hire Date', type: 'date', required: true }
        ],
        api: '/employees'
      },
      departments: {
        title: 'Departments',
        idField: 'Dept_ID',
        fields: [
          { key: 'Dept_ID', label: 'Department ID', type: 'text', required: true },
          { key: 'Dept_name', label: 'Department Name', type: 'text', required: true },
          { key: 'Budget', label: 'Budget', type: 'number', required: true }
        ],
        api: '/departments'
      },
      factories: {
        title: 'Factories',
        idField: 'F_ID',
        fields: [
          { key: 'F_ID', label: 'Factory ID', type: 'text', required: true },
          { key: 'F_Name', label: 'Factory Name', type: 'text', required: true },
          { key: 'Address', label: 'Address', type: 'text', required: true },
          { key: 'Ph_no', label: 'Phone Number', type: 'tel', required: true },
          { key: 'Manager_name', label: 'Manager Name', type: 'text', required: true }
        ],
        api: '/factories'
      },
      machines: {
        title: 'Machines',
        idField: 'M_ID',
        fields: [
          { key: 'M_ID', label: 'Machine ID', type: 'text', required: true },
          { key: 'Name', label: 'Machine Name', type: 'text', required: true },
          { key: 'Model', label: 'Model', type: 'text', required: true },
          { key: 'Manufacturer', label: 'Manufacturer', type: 'text', required: true },
          { key: 'Purchase_date', label: 'Purchase Date', type: 'date', required: true },
          { key: 'Status', label: 'Status', type: 'text', required: true }
        ],
        api: '/machines'
      },
      products: {
        title: 'Products',
        idField: 'P_ID',
        fields: [
          { key: 'P_ID', label: 'Product ID', type: 'text', required: true },
          { key: 'P_Name', label: 'Product Name', type: 'text', required: true },
          { key: 'Category', label: 'Category', type: 'text', required: true },
          { key: 'Unit_price', label: 'Unit Price', type: 'number', required: true }
        ],
        api: '/products'
      },
      orders: {
        title: 'Production Orders',
        idField: 'Order_ID',
        fields: [
          { key: 'Order_ID', label: 'Order ID', type: 'text', required: true },
          { key: 'Order_date', label: 'Order Date', type: 'date', required: true },
          { key: 'Due_date', label: 'Due Date', type: 'date', required: true },
          { key: 'Priority', label: 'Priority', type: 'text', required: true },
          { key: 'Status', label: 'Status', type: 'text', required: true },
          { key: 'Qty', label: 'Quantity', type: 'number', required: true }
        ],
        api: '/orders'
      }
    }
    return configs[entity] || configs.employees
  }

  const config = getConfig()

  useEffect(() => {
    fetchData()
  }, [entity])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall(config.api, { method: 'GET' })
      console.log(`Fetched ${entity}:`, response)
      setData(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error(`Error fetching ${entity}:`, error)
      setError(`Failed to load ${config.title.toLowerCase()}`)
      setData([])
    }
    setLoading(false)
  }

  const handleModalSave = async (data) => {
    try {
      if (editingId) {
        await apiCall(`${config.api}/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        })
        setSuccess(`${config.title.slice(0, -1)} updated successfully`)
      } else {
        await apiCall(config.api, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        })
        setSuccess(`${config.title.slice(0, -1)} added successfully`)
      }
      setFormData({})
      setEditingId(null)
      setShowModal(false)
      setTimeout(() => setSuccess(null), 3000)
      fetchData()
    } catch (error) {
      console.error('Error saving:', error)
      setError(`Failed to save ${config.title.toLowerCase()}`)
    }
  }

  const handleEdit = (record) => {
    setFormData(record)
    setEditingId(record[config.idField])
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm(`Delete this ${config.title.slice(0, -1)}?`)) {
      try {
        await apiCall(`${config.api}/${id}`, { method: 'DELETE' })
        setSuccess(`${config.title.slice(0, -1)} deleted successfully`)
        setTimeout(() => setSuccess(null), 3000)
        fetchData()
      } catch (error) {
        console.error('Error deleting:', error)
        setError(`Failed to delete ${config.title.toLowerCase()}`)
      }
    }
  }

  const openAddModal = () => {
    setFormData({})
    setEditingId(null)
    setShowModal(true)
  }

  const columns = config.fields.map(f => ({ header: f.label, accessor: f.key }))

  return (
    <div className="crud-container">
      <div className="crud-header">
        <div>
          <h1>{config.title}</h1>
          <p className="crud-subtitle">Manage {config.title.toLowerCase()}</p>
        </div>
        <button className="btn-primary" onClick={openAddModal} title={`Add new ${config.title.slice(0, -1)}`}>
          <Plus size={16} />
          Add {config.title.slice(0, -1)}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✓ {success}</span>
          <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading {config.title.toLowerCase()}...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-title">No {config.title.toLowerCase()} found</p>
          <p className="empty-description">Get started by adding a new {config.title.slice(0, -1).toLowerCase()}</p>
          <button className="btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            Add {config.title.slice(0, -1)}
          </button>
        </div>
      ) : (
        <div className="crud-table-wrapper">
          <table className="crud-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.accessor}>{col.header}</th>
                ))}
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, idx) => (
                <tr key={idx}>
                  {columns.map(col => (
                    <td key={col.accessor}>
                      <span className="cell-content">
                        {record[col.accessor] !== null && record[col.accessor] !== undefined
                          ? String(record[col.accessor]).substring(0, 50)
                          : '-'}
                      </span>
                    </td>
                  ))}
                  <td className="actions-cell">
                    <button
                      className="btn-icon edit"
                      onClick={() => handleEdit(record)}
                      title={`Edit ${config.title.slice(0, -1)}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(record[config.idField])}
                      title={`Delete ${config.title.slice(0, -1)}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal
          title={editingId ? `Edit ${config.title.slice(0, -1)}` : `Add ${config.title.slice(0, -1)}`}
          fields={config.fields}
          initialData={formData}
          onSave={handleModalSave}
          onClose={() => {
            setShowModal(false)
            setFormData({})
            setEditingId(null)
          }}
        />
      )}
    </div>
  )
}
