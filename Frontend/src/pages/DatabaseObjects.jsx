import { useState } from 'react'
import { Database, Play, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import '../pages/DatabaseObjects.css'
import { apiCall } from '../api'

export default function DatabaseObjects() {
  const [activeTab, setActiveTab] = useState('triggers')
  const [selectedItem, setSelectedItem] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState(null)

  const triggers = [
    {
      id: 'order_status_update',
      name: 'Order Status Auto-Update',
      description: 'Automatically update production order status when due date passes',
      sqlCode: `DELIMITER $$
CREATE TRIGGER before_order_update
BEFORE UPDATE ON PRODUCTION_ORDER
FOR EACH ROW
BEGIN
 IF NEW.Due_date < CURDATE() AND NEW.Status <> 'Completed' THEN
 SET NEW.Status = 'Cancelled';
 END IF;
END$$
DELIMITER ;`,
      purpose: 'Automatically sets production order status to "Cancelled" if due date has passed and not completed. Enforces production deadlines without manual updates.',
      testExample: 'Tries to update a production order with a past due date'
    },
    {
      id: 'email_unique',
      name: 'Email Uniqueness (Case-Insensitive)',
      description: 'Maintain email uniqueness case-insensitively in EMPLOYEE table',
      sqlCode: `DELIMITER $$
CREATE TRIGGER before_employee_insert
BEFORE INSERT ON EMPLOYEE
FOR EACH ROW
BEGIN
 IF (SELECT COUNT(*) FROM EMPLOYEE
 WHERE LOWER(Email) = LOWER(NEW.Email)) > 0 THEN
 SIGNAL SQLSTATE '45000'
 SET MESSAGE_TEXT = 'Duplicate email (case-insensitive) not allowed';
 END IF;
END$$
DELIMITER ;`,
      purpose: 'Ensures no two employees can have the same email ignoring letter case. MySQL\'s UNIQUE constraint is case-sensitive for VARCHAR, so this trigger prevents duplicates.',
      testExample: 'Attempts to insert duplicate email and shows error'
    }
  ]

  const functions = [
    {
      id: 'get_dept_by_emp',
      name: 'Get Department by Employee ID',
      description: 'Retrieve department name for a given employee',
      sqlCode: `DELIMITER $$
CREATE FUNCTION get_department_by_emp(p_E_ID VARCHAR(50))
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
 DECLARE deptName VARCHAR(100);
 SELECT Dept_name INTO deptName
 FROM DEPARTMENT
 WHERE Dept_ID = (SELECT Dept_ID FROM EMPLOYS WHERE E_ID = p_E_ID LIMIT 1);
 RETURN deptName;
END$$
DELIMITER ;`,
      testQuery: "SELECT get_department_by_emp('E003');",
      purpose: 'Finds an employee\'s department name using their ID by joining EMPLOYS and DEPARTMENT. Useful for quick lookups or reporting.',
      requiresInput: true,
      inputLabel: 'Employee ID',
      inputPlaceholder: 'e.g., E003'
    },
    {
      id: 'total_qty_by_product',
      name: 'Calculate Total Production Quantity',
      description: 'Get total ordered quantity for a specific product',
      sqlCode: `DELIMITER $$
CREATE FUNCTION total_qty_by_product(p_P_ID VARCHAR(50))
RETURNS INT
DETERMINISTIC
BEGIN
 DECLARE total_qty INT;
 SELECT SUM(Qty) INTO total_qty
 FROM PRODUCTION_ORDER
 WHERE Order_ID IN (SELECT Order_ID FROM MAKES WHERE P_ID = p_P_ID);
 RETURN IFNULL(total_qty, 0);
END$$
DELIMITER ;`,
      testQuery: "SELECT total_qty_by_product('P001') AS TotalQuantity;",
      purpose: 'Calculates the total ordered quantity for a given product across all production orders. Compiles order data from MAKES and PRODUCTION_ORDER.',
      requiresInput: true,
      inputLabel: 'Product ID',
      inputPlaceholder: 'e.g., P001'
    }
  ]

  const procedures = [
    {
      id: 'assign_machine',
      name: 'Assign Machine to Factory',
      description: 'Assign or reassign a machine to a factory',
      sqlCode: `DELIMITER $$
CREATE PROCEDURE assign_machine_to_factory(IN p_M_ID VARCHAR(50), IN p_F_ID VARCHAR(50))
BEGIN
 IF (SELECT COUNT(*) FROM CONTAINS WHERE M_ID = p_M_ID) = 0 THEN
 INSERT INTO CONTAINS (F_ID, M_ID) VALUES (p_F_ID, p_M_ID);
 ELSE
 UPDATE CONTAINS SET F_ID = p_F_ID WHERE M_ID = p_M_ID;
 END IF;
END$$
DELIMITER ;`,
      testCall: "CALL assign_machine_to_factory('M003', 'F001');",
      purpose: 'Either assigns a machine to a factory if not already linked, or reassigns it to a different factory. Simplifies equipment relocation management.',
      requiresInputs: true,
      inputs: [
        { label: 'Machine ID', placeholder: 'e.g., M003' },
        { label: 'Factory ID', placeholder: 'e.g., F001' }
      ]
    },
    {
      id: 'update_priority',
      name: 'Update Production Order Priority',
      description: 'Automatically classify orders by quantity and set priority',
      sqlCode: `DELIMITER $$
CREATE PROCEDURE update_priority_based_on_qty()
BEGIN
 UPDATE PRODUCTION_ORDER
 SET Priority = CASE
 WHEN Qty >= 1000 THEN 'High'
 WHEN Qty BETWEEN 500 AND 999 THEN 'Medium'
 ELSE 'Low'
 END;
END$$
DELIMITER ;`,
      testCall: "CALL update_priority_based_on_qty();",
      purpose: 'Automatically classifies all production orders based on quantity levels. Assigns "High" for >= 1000, "Medium" for 500-999, "Low" for < 500. Keeps production scheduling consistent.',
      requiresInputs: false
    }
  ]

  const executeTrigger = async (triggerId) => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await apiCall('/db-objects/triggers', {
        method: 'POST',
        body: JSON.stringify({ triggerId })
      })
      setMessage({
        type: 'success',
        text: response.message || 'Trigger test executed successfully'
      })
      setResult(response)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to execute trigger test'
      })
    }
    setLoading(false)
  }

  const executeFunction = async (functionId, inputs) => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await apiCall('/db-objects/functions', {
        method: 'POST',
        body: JSON.stringify({ functionId, inputs })
      })
      setMessage({
        type: 'success',
        text: 'Function executed successfully'
      })
      setResult(response)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to execute function'
      })
    }
    setLoading(false)
  }

  const executeProcedure = async (procedureId, inputs = []) => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await apiCall('/db-objects/procedures', {
        method: 'POST',
        body: JSON.stringify({ procedureId, inputs })
      })
      setMessage({
        type: 'success',
        text: response.message || 'Procedure executed successfully'
      })
      setResult(response)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to execute procedure'
      })
    }
    setLoading(false)
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="db-objects-container">
      <div className="db-objects-header">
        <div>
          <h1>Database Objects</h1>
          <p>Triggers, Functions & Stored Procedures</p>
        </div>
        <Database size={32} className="header-icon" />
      </div>

      <div className="db-tabs">
        <button
          className={`tab-button ${activeTab === 'triggers' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('triggers')
            setSelectedItem(null)
            setResult(null)
          }}
        >
          Triggers
        </button>
        <button
          className={`tab-button ${activeTab === 'functions' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('functions')
            setSelectedItem(null)
            setResult(null)
          }}
        >
          Functions
        </button>
        <button
          className={`tab-button ${activeTab === 'procedures' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('procedures')
            setSelectedItem(null)
            setResult(null)
          }}
        >
          Procedures
        </button>
      </div>

      <div className="db-content">
        {!selectedItem ? (
          <div className="db-list">
            {activeTab === 'triggers' && triggers.map(trigger => (
              <div key={trigger.id} className="db-card" onClick={() => setSelectedItem(trigger)}>
                <div className="card-header">
                  <h3>{trigger.name}</h3>
                  <Database size={20} />
                </div>
                <p className="card-description">{trigger.description}</p>
                <div className="card-purpose">
                  <strong>Purpose:</strong> {trigger.purpose}
                </div>
              </div>
            ))}

            {activeTab === 'functions' && functions.map(func => (
              <div key={func.id} className="db-card" onClick={() => setSelectedItem(func)}>
                <div className="card-header">
                  <h3>{func.name}</h3>
                  <Database size={20} />
                </div>
                <p className="card-description">{func.description}</p>
                <div className="card-purpose">
                  <strong>Purpose:</strong> {func.purpose}
                </div>
              </div>
            ))}

            {activeTab === 'procedures' && procedures.map(proc => (
              <div key={proc.id} className="db-card" onClick={() => setSelectedItem(proc)}>
                <div className="card-header">
                  <h3>{proc.name}</h3>
                  <Database size={20} />
                </div>
                <p className="card-description">{proc.description}</p>
                <div className="card-purpose">
                  <strong>Purpose:</strong> {proc.purpose}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="db-detail">
            <button className="btn-back" onClick={() => setSelectedItem(null)}>
              ← Back
            </button>

            <div className="detail-header">
              <h2>{selectedItem.name}</h2>
              <p>{selectedItem.description}</p>
            </div>

            <div className="detail-purpose">
              <strong>Purpose:</strong> {selectedItem.purpose}
            </div>

            <div className="code-section">
              <div className="code-header">
                <span>SQL Code</span>
                <button
                  className="btn-copy"
                  onClick={() => copyCode(selectedItem.sqlCode)}
                >
                  <Copy size={16} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="code-block">{selectedItem.sqlCode}</pre>
            </div>

            {activeTab === 'triggers' && (
              <div className="execution-section">
                <h3>Test Execution</h3>
                <p className="test-description">{selectedItem.testExample}</p>
                <button
                  className="btn-execute"
                  onClick={() => executeTrigger(selectedItem.id)}
                  disabled={loading}
                >
                  <Play size={16} />
                  {loading ? 'Executing...' : 'Execute Test'}
                </button>
              </div>
            )}

            {activeTab === 'functions' && (
              <div className="execution-section">
                <h3>Execute Function</h3>
                <p className="test-description">Test Query: {selectedItem.testQuery}</p>
                {selectedItem.requiresInput && (
                  <div className="input-group">
                    <label>{selectedItem.inputLabel}</label>
                    <input
                      type="text"
                      placeholder={selectedItem.inputPlaceholder}
                      id="func-input"
                      className="input-field"
                    />
                  </div>
                )}
                <button
                  className="btn-execute"
                  onClick={() => {
                    const input = document.getElementById('func-input')?.value || ''
                    executeFunction(selectedItem.id, [input])
                  }}
                  disabled={loading}
                >
                  <Play size={16} />
                  {loading ? 'Executing...' : 'Execute'}
                </button>
              </div>
            )}

            {activeTab === 'procedures' && (
              <div className="execution-section">
                <h3>Execute Procedure</h3>
                <p className="test-description">Test Call: {selectedItem.testCall}</p>
                {selectedItem.requiresInputs && (
                  <div className="inputs-group">
                    {selectedItem.inputs.map((input, idx) => (
                      <div key={idx} className="input-group">
                        <label>{input.label}</label>
                        <input
                          type="text"
                          placeholder={input.placeholder}
                          id={`proc-input-${idx}`}
                          className="input-field"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="btn-execute"
                  onClick={() => {
                    const inputs = selectedItem.requiresInputs
                      ? selectedItem.inputs.map((_, idx) =>
                          document.getElementById(`proc-input-${idx}`)?.value || ''
                        )
                      : []
                    executeProcedure(selectedItem.id, inputs)
                  }}
                  disabled={loading}
                >
                  <Play size={16} />
                  {loading ? 'Executing...' : 'Execute'}
                </button>
              </div>
            )}

            {message && (
              <div className={`message ${message.type}`}>
                {message.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <p>{message.text}</p>
              </div>
            )}

            {result && (
              <div className="result-section">
                <h3>Execution Result</h3>
                <pre className="result-block">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
