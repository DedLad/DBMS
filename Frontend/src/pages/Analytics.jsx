import { useState, useEffect } from 'react'
import { RefreshCw, Database, AlertCircle } from 'lucide-react'
import '../pages/Analytics.css'
import { apiCall } from '../api'

export default function Analytics() {
  const [activeQuery, setActiveQuery] = useState('join')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const queries = [
    { id: 'join', name: 'Join Query', description: 'Query demonstrating table joins', icon: Database },
    { id: 'nested', name: 'Nested Query', description: 'Query with nested subqueries', icon: Database },
    { id: 'aggregate', name: 'Aggregate Query', description: 'Aggregation and grouping', icon: Database }
  ]

  useEffect(() => {
    fetchQueryData()
  }, [activeQuery])

  const fetchQueryData = async () => {
    setLoading(true)
    setError(null)
    try {
      let endpoint = `/analytics/${activeQuery}-query`
      const response = await apiCall(endpoint, {
        method: 'GET'
      })
      setData(response)
    } catch (err) {
      setError('Failed to fetch data. Please try again.')
      console.error('Error:', err)
      setData(null)
    }
    setLoading(false)
  }

  const queryText = () => {
    switch (activeQuery) {
      case 'join':
        return `SELECT 
  e.E_ID,
  CONCAT(e.FName, ' ', e.LName) as FullName,
  e.Email,
  e.Position,
  d.Dept_name as Department,
  d.Budget as DepartmentBudget,
  e.Salary,
  e.Hire_date,
  COUNT(DISTINCT po.Order_ID) as OrdersInvolved,
  SUM(po.Qty) as TotalQuantityHandled
FROM EMPLOYEE e
LEFT JOIN EMPLOYS emp ON e.E_ID = emp.E_ID
LEFT JOIN DEPARTMENT d ON emp.Dept_ID = d.Dept_ID
LEFT JOIN PRODUCTION_ORDER po ON e.E_ID = po.Order_ID OR 1=0
GROUP BY e.E_ID, e.FName, e.LName, e.Email, e.Position, d.Dept_name, d.Budget, e.Salary, e.Hire_date
ORDER BY e.E_ID`;
      case 'nested':
        return `SELECT * FROM PRODUCTION_ORDER 
WHERE Qty > (SELECT AVG(Qty) FROM PRODUCTION_ORDER)`;
      case 'aggregate':
        return `SELECT COUNT(*) as total_orders FROM PRODUCTION_ORDER`;
      default:
        return ''
    }
  }

  const queryDescription = () => {
    if (!data || !data.description) return ''
    return data.description
  }

  const renderResults = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading query results...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="error-state">
          <AlertCircle size={24} />
          <p className="error-message">{error}</p>
          <button className="btn-primary" onClick={fetchQueryData}>
            Try Again
          </button>
        </div>
      )
    }

    if (!data) {
      return (
        <div className="empty-state">
          <p>No data available</p>
        </div>
      )
    }

    // Handle aggregate query
    if (activeQuery === 'aggregate' && data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      return (
        <div className="results-container">
          <div className="stats-row">
            {Object.entries(data.data).map(([key, value]) => (
              <div key={key} className="stat-box">
                <div className="stat-label">{key.replace(/_/g, ' ')}</div>
                <div className="stat-val ue">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Handle array results
    const results = Array.isArray(data) ? data : data.data || []
    if (!Array.isArray(results) || results.length === 0) {
      return (
        <div className="empty-state">
          <p>No results found for this query</p>
        </div>
      )
    }

    return (
      <div className="results-container">
        <div className="results-info">
          <p className="result-count">Showing {results.length} result{results.length !== 1 ? 's' : ''}</p>
        </div>
        {results.map((item, idx) => (
          <div key={idx} className="result-item">
            <pre>{JSON.stringify(item, null, 2)}</pre>
          </div>
        ))}
      </div>
    )
  }

  const currentQuery = queries.find(q => q.id === activeQuery)

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1>Advanced Analytics</h1>
          <p className="analytics-subtitle">Execute complex database queries and analysis</p>
        </div>
        <button className="refresh-btn" onClick={fetchQueryData} disabled={loading} title="Refresh results">
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="analytics-tabs">
        {queries.map(query => (
          <button
            key={query.id}
            className={`tab-btn ${activeQuery === query.id ? 'active' : ''}`}
            onClick={() => setActiveQuery(query.id)}
            title={query.description}
          >
            <Database size={16} />
            {query.name}
          </button>
        ))}
      </div>

      {currentQuery && (
        <div className="query-info">
          <p>{currentQuery.description}</p>
        </div>
      )}

      <div className="analytics-results">
        <div className="query-sql" style={{marginBottom:'12px'}}>
          <div style={{fontWeight:600, color:'var(--accent-blue)', marginBottom:'8px'}}>Query Description</div>
          {queryDescription() && (
            <div style={{background:'rgba(59,130,246,0.1)', padding:'12px', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-secondary)', marginBottom:'12px', lineHeight:'1.5'}}>
              {queryDescription()}
            </div>
          )}
          <div style={{fontWeight:600, color:'var(--accent-blue)', marginBottom:'8px'}}>SQL</div>
          <pre style={{background:'rgba(0,0,0,0.35)', padding:'10px', border:'1px solid var(--border-color)', borderRadius:'6px', overflowX:'auto', fontSize:'0.85rem', lineHeight:'1.4'}}>{queryText()}</pre>
        </div>
        {renderResults()}
      </div>
    </div>
  )
}
