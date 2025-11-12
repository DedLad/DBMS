import { Trash2, Edit2 } from 'lucide-react'
import './Table.css'

export default function Table({ data, columns, idField = 'id', onEdit, onDelete }) {
  if (data.length === 0) {
    return <div className="empty-table">No data</div>
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>
                {col.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col}>
                  {row[col] !== null && row[col] !== undefined ? String(row[col]).slice(0, 50) : '-'}
                </td>
              ))}
              <td className="actions">
                <button className="btn-icon edit" onClick={() => onEdit(row)} title="Edit">
                  <Edit2 size={18} />
                </button>
                <button className="btn-icon delete" onClick={() => onDelete(row[idField])} title="Delete">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
