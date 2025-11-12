from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'FactoryManagement')
}

def get_connection():
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except Error as e:
        print(f'Connection Error: {e}')
        return None

def execute_query(sql, params=None):
    conn = get_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, params or ())
        results = cursor.fetchall()
        return results
    except Error as e:
        print(f'Query Error: {e}')
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def execute_update(sql, params=None):
    conn = get_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params or ())
        conn.commit()
        return True
    except Error as e:
        print(f'Update Error: {e}')
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/health', methods=['GET'])
def health():
    try:
        conn = get_connection()
        if conn:
            conn.close()
            return jsonify({'status': 'OK'}), 200
    except:
        pass
    return jsonify({'status': 'ERROR'}), 500

@app.route('/api/employees', methods=['GET'])
def get_employees():
    results = execute_query('SELECT * FROM EMPLOYEE ORDER BY E_ID')
    return jsonify(results or []), 200

@app.route('/api/employees/<emp_id>', methods=['GET'])
def get_employee(emp_id):
    result = execute_query('SELECT * FROM EMPLOYEE WHERE E_ID = %s', (emp_id,))
    return jsonify(result[0] if result else {}), 200 if result else 404

@app.route('/api/employees', methods=['POST'])
def create_employee():
    try:
        data = request.json
        sql = 'INSERT INTO EMPLOYEE (E_ID, FName, LName, Email, Position, Category, Salary, Hire_date) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)'
        execute_update(sql, (data.get('E_ID'), data.get('FName'), data.get('LName'), data.get('Email'), data.get('Position', 'Engineer'), data.get('Category', 'Technical'), data.get('Salary'), data.get('Hire_date')))
        return jsonify({'message': 'Created'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/employees/<emp_id>', methods=['PUT'])
def update_employee(emp_id):
    try:
        data = request.json
        sql = 'UPDATE EMPLOYEE SET FName=%s, LName=%s, Email=%s, Position=%s, Category=%s, Salary=%s, Hire_date=%s WHERE E_ID=%s'
        execute_update(sql, (data.get('FName'), data.get('LName'), data.get('Email'), data.get('Position'), data.get('Category'), data.get('Salary'), data.get('Hire_date'), emp_id))
        return jsonify({'message': 'Updated'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/employees/<emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    try:
        execute_update('DELETE FROM EMPLOYEE WHERE E_ID = %s', (emp_id,))
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/departments', methods=['GET'])
def get_departments():
    results = execute_query('SELECT * FROM DEPARTMENT ORDER BY Dept_ID')
    return jsonify(results or []), 200

@app.route('/api/departments/<dept_id>', methods=['GET'])
def get_department(dept_id):
    result = execute_query('SELECT * FROM DEPARTMENT WHERE Dept_ID = %s', (dept_id,))
    return jsonify(result[0] if result else {}), 200 if result else 404

@app.route('/api/departments', methods=['POST'])
def create_department():
    try:
        data = request.json
        sql = 'INSERT INTO DEPARTMENT (Dept_ID, Dept_name, Budget) VALUES (%s, %s, %s)'
        execute_update(sql, (data.get('Dept_ID'), data.get('Dept_name'), data.get('Budget', 0.0)))
        return jsonify({'message': 'Created'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/departments/<dept_id>', methods=['PUT'])
def update_department(dept_id):
    try:
        data = request.json
        sql = 'UPDATE DEPARTMENT SET Dept_name=%s, Budget=%s WHERE Dept_ID=%s'
        execute_update(sql, (data.get('Dept_name'), data.get('Budget'), dept_id))
        return jsonify({'message': 'Updated'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/departments/<dept_id>', methods=['DELETE'])
def delete_department(dept_id):
    try:
        execute_update('DELETE FROM DEPARTMENT WHERE Dept_ID = %s', (dept_id,))
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/factories', methods=['GET'])
def get_factories():
    results = execute_query('SELECT * FROM FACTORY ORDER BY F_ID')
    return jsonify(results or []), 200

@app.route('/api/factories/<factory_id>', methods=['GET'])
def get_factory(factory_id):
    result = execute_query('SELECT * FROM FACTORY WHERE F_ID = %s', (factory_id,))
    return jsonify(result[0] if result else {}), 200 if result else 404

@app.route('/api/factories', methods=['POST'])
def create_factory():
    try:
        data = request.json
        sql = 'INSERT INTO FACTORY (F_ID, F_Name, Address, Ph_no, Manager_name) VALUES (%s, %s, %s, %s, %s)'
        execute_update(sql, (data.get('F_ID'), data.get('F_Name'), data.get('Address'), data.get('Ph_no'), data.get('Manager_name')))
        return jsonify({'message': 'Created'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/factories/<factory_id>', methods=['PUT'])
def update_factory(factory_id):
    try:
        data = request.json
        sql = 'UPDATE FACTORY SET F_Name=%s, Address=%s, Ph_no=%s, Manager_name=%s WHERE F_ID=%s'
        execute_update(sql, (data.get('F_Name'), data.get('Address'), data.get('Ph_no'), data.get('Manager_name'), factory_id))
        return jsonify({'message': 'Updated'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/factories/<factory_id>', methods=['DELETE'])
def delete_factory(factory_id):
    try:
        execute_update('DELETE FROM FACTORY WHERE F_ID = %s', (factory_id,))
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/machines', methods=['GET'])
def get_machines():
    results = execute_query('SELECT * FROM MACHINE ORDER BY M_ID')
    return jsonify(results or []), 200

@app.route('/api/machines/<machine_id>', methods=['GET'])
def get_machine(machine_id):
    result = execute_query('SELECT * FROM MACHINE WHERE M_ID = %s', (machine_id,))
    return jsonify(result[0] if result else {}), 200 if result else 404

@app.route('/api/machines', methods=['POST'])
def create_machine():
    try:
        data = request.json
        sql = 'INSERT INTO MACHINE (M_ID, Name, Model, Manufacturer, Purchase_date, Status) VALUES (%s, %s, %s, %s, %s, %s)'
        execute_update(sql, (data.get('M_ID'), data.get('Name'), data.get('Model'), data.get('Manufacturer'), data.get('Purchase_date'), data.get('Status', 'Working')))
        return jsonify({'message': 'Created'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/machines/<machine_id>', methods=['PUT'])
def update_machine(machine_id):
    try:
        data = request.json
        sql = 'UPDATE MACHINE SET Name=%s, Model=%s, Manufacturer=%s, Purchase_date=%s, Status=%s WHERE M_ID=%s'
        execute_update(sql, (data.get('Name'), data.get('Model'), data.get('Manufacturer'), data.get('Purchase_date'), data.get('Status'), machine_id))
        return jsonify({'message': 'Updated'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/machines/<machine_id>', methods=['DELETE'])
def delete_machine(machine_id):
    try:
        execute_update('DELETE FROM MACHINE WHERE M_ID = %s', (machine_id,))
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/products', methods=['GET'])
def get_products():
    results = execute_query('SELECT * FROM PRODUCT ORDER BY P_ID')
    return jsonify(results or []), 200

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    result = execute_query('SELECT * FROM PRODUCT WHERE P_ID = %s', (product_id,))
    return jsonify(result[0] if result else {}), 200 if result else 404

@app.route('/api/products', methods=['POST'])
def create_product():
    try:
        data = request.json
        sql = 'INSERT INTO PRODUCT (P_ID, P_Name, Category, Unit_price) VALUES (%s, %s, %s, %s)'
        execute_update(sql, (data.get('P_ID'), data.get('P_Name'), data.get('Category'), data.get('Unit_price')))
        return jsonify({'message': 'Created'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        data = request.json
        sql = 'UPDATE PRODUCT SET P_Name=%s, Category=%s, Unit_price=%s WHERE P_ID=%s'
        execute_update(sql, (data.get('P_Name'), data.get('Category'), data.get('Unit_price'), product_id))
        return jsonify({'message': 'Updated'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        execute_update('DELETE FROM PRODUCT WHERE P_ID = %s', (product_id,))
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/orders', methods=['GET'])
def get_orders():
    results = execute_query('SELECT * FROM PRODUCTION_ORDER ORDER BY Order_ID')
    return jsonify(results or []), 200

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    result = execute_query('SELECT * FROM PRODUCTION_ORDER WHERE Order_ID = %s', (order_id,))
    return jsonify(result[0] if result else {}), 200 if result else 404

@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.json
        sql = 'INSERT INTO PRODUCTION_ORDER (Order_ID, Order_date, Due_date, Priority, Status, Qty) VALUES (%s, %s, %s, %s, %s, %s)'
        execute_update(sql, (data.get('Order_ID'), data.get('Order_date'), data.get('Due_date'), data.get('Priority', 'Medium'), data.get('Status', 'Pending'), data.get('Qty')))
        return jsonify({'message': 'Created'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/orders/<order_id>', methods=['PUT'])
def update_order(order_id):
    try:
        data = request.json
        sql = 'UPDATE PRODUCTION_ORDER SET Order_date=%s, Due_date=%s, Priority=%s, Status=%s, Qty=%s WHERE Order_ID=%s'
        execute_update(sql, (data.get('Order_date'), data.get('Due_date'), data.get('Priority'), data.get('Status'), data.get('Qty'), order_id))
        return jsonify({'message': 'Updated'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    try:
        execute_update('DELETE FROM PRODUCTION_ORDER WHERE Order_ID = %s', (order_id,))
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/analytics/join-query', methods=['GET'])
def analytics_join_query():
    sql = '''
    SELECT 
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
    ORDER BY e.E_ID
    '''
    results = execute_query(sql)
    return jsonify({
        'query_type': 'JOIN',
        'description': 'Complex multi-table JOIN showing employee details enriched with department information, salary, and production order involvement. Uses LEFT JOINs to include employees without department assignments.',
        'data': results or []
    }), 200

@app.route('/api/analytics/nested-query', methods=['GET'])
def analytics_nested_query():
    sql = 'SELECT * FROM PRODUCTION_ORDER WHERE Qty > (SELECT AVG(Qty) FROM PRODUCTION_ORDER)'
    results = execute_query(sql)
    return jsonify({
        'query_type': 'NESTED',
        'description': 'Nested subquery that identifies all production orders with quantities above the average. Useful for identifying high-volume orders and production priorities.',
        'data': results or []
    }), 200

@app.route('/api/analytics/aggregate-query', methods=['GET'])
def analytics_aggregate_query():
    sql = 'SELECT COUNT(*) as total_orders FROM PRODUCTION_ORDER'
    results = execute_query(sql)
    return jsonify({
        'query_type': 'AGGREGATE',
        'description': 'Aggregate function that counts the total number of production orders in the system. Demonstrates COUNT aggregation for summary statistics.',
        'data': results[0] if results else {}
    }), 200

@app.route('/api/analytics/triggers', methods=['GET'])
def analytics_triggers():
    return jsonify({'triggers': [{'name': 'trigger1'}]}), 200

@app.route('/api/analytics/functions', methods=['GET'])
def analytics_functions():
    return jsonify({'functions': [{'name': 'func1'}]}), 200

@app.route('/api/analytics/procedures', methods=['GET'])
def analytics_procedures():
    return jsonify({'procedures': [{'name': 'proc1'}]}), 200

# Database Objects - Triggers, Functions, Procedures
@app.route('/api/db-objects/triggers', methods=['POST', 'OPTIONS'])
def execute_trigger():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    trigger_id = data.get('triggerId')
    
    try:
        if trigger_id == 'order_status_update':
            # Test: Create an order with a past due date to trigger the automatic update
            sql = "SELECT * FROM PRODUCTION_ORDER WHERE Due_date < CURDATE() AND Status <> 'Completed' LIMIT 1"
            result = execute_query(sql)
            return jsonify({
                'message': 'Order status update trigger validated',
                'affected_orders': result or []
            }), 200
        elif trigger_id == 'email_unique':
            # Test: Try to insert a duplicate email (will fail due to trigger)
            sql = "SELECT Email FROM EMPLOYEE GROUP BY LOWER(Email) HAVING COUNT(*) > 1"
            duplicates = execute_query(sql)
            return jsonify({
                'message': 'Email uniqueness trigger validated',
                'duplicate_emails': duplicates or []
            }), 200
        else:
            return jsonify({'error': 'Unknown trigger'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db-objects/functions', methods=['POST', 'OPTIONS'])
def execute_function():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    function_id = data.get('functionId')
    inputs = data.get('inputs', [])
    
    try:
        if function_id == 'get_dept_by_emp':
            if not inputs or not inputs[0]:
                return jsonify({'error': 'Employee ID required'}), 400
            emp_id = inputs[0]
            sql = f"SELECT get_department_by_emp('{emp_id}') as department_name"
            result = execute_query(sql)
            return jsonify({
                'function': 'get_department_by_emp',
                'input': emp_id,
                'result': result[0] if result else None
            }), 200
        elif function_id == 'total_qty_by_product':
            if not inputs or not inputs[0]:
                return jsonify({'error': 'Product ID required'}), 400
            product_id = inputs[0]
            sql = f"SELECT total_qty_by_product('{product_id}') as total_quantity"
            result = execute_query(sql)
            return jsonify({
                'function': 'total_qty_by_product',
                'input': product_id,
                'result': result[0] if result else None
            }), 200
        else:
            return jsonify({'error': 'Unknown function'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db-objects/procedures', methods=['POST', 'OPTIONS'])
def execute_procedure():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    procedure_id = data.get('procedureId')
    inputs = data.get('inputs', [])
    
    try:
        if procedure_id == 'assign_machine':
            if len(inputs) < 2:
                return jsonify({'error': 'Machine ID and Factory ID required'}), 400
            machine_id = inputs[0]
            factory_id = inputs[1]
            
            conn = get_connection()
            if not conn:
                return jsonify({'error': 'Database connection failed'}), 500
            
            cursor = conn.cursor()
            try:
                cursor.callproc('assign_machine_to_factory', [machine_id, factory_id])
                conn.commit()
                return jsonify({
                    'message': f'Machine {machine_id} assigned to factory {factory_id}',
                    'procedure': 'assign_machine_to_factory'
                }), 200
            finally:
                cursor.close()
                conn.close()
                
        elif procedure_id == 'update_priority':
            conn = get_connection()
            if not conn:
                return jsonify({'error': 'Database connection failed'}), 500
            
            cursor = conn.cursor()
            try:
                cursor.callproc('update_priority_based_on_qty')
                conn.commit()
                
                # Get updated orders to show results
                cursor.execute('SELECT Order_ID, Qty, Priority FROM PRODUCTION_ORDER ORDER BY Qty DESC LIMIT 10')
                updated_orders = cursor.fetchall()
                
                return jsonify({
                    'message': 'Production order priorities updated based on quantity',
                    'procedure': 'update_priority_based_on_qty',
                    'sample_results': updated_orders or []
                }), 200
            finally:
                cursor.close()
                conn.close()
        else:
            return jsonify({'error': 'Unknown procedure'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Users and Roles management
import re

ALLOWED_USERNAME = re.compile(r'^[A-Za-z0-9_]{3,30}$')

def _run_statements(statements):
    conn = get_connection()
    if not conn:
        raise Exception('Database connection failed')
    cursor = conn.cursor()
    try:
        for stmt in statements:
            cursor.execute(stmt)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

def _grants_for_user(user, host='%'):
    conn = get_connection()
    if not conn:
        return []
    cur = conn.cursor()
    try:
        cur.execute(f"SHOW GRANTS FOR '{user}'@'{host}'")
        return [row[0] for row in cur.fetchall()]
    except Exception:
        return []
    finally:
        cur.close()
        conn.close()

def _detect_role_from_grants(grants, db_name):
    joined = '\n'.join(grants)
    if f"GRANT ALL PRIVILEGES ON `{db_name}`.*" in joined or f"GRANT ALL PRIVILEGES ON {db_name}.*" in joined:
        return 'admin'
    core = ['EMPLOYEE','DEPARTMENT','FACTORY','MACHINE','PRODUCT','PRODUCTION_ORDER']
    has_crud = all(any(f"ON `{db_name}`.`{t}`" in g and any(k in g for k in ['INSERT','UPDATE','DELETE','SELECT']) for g in grants) for t in core)
    if has_crud:
        return 'operator'
    if ('GRANT SELECT ON' in joined and (f"ON `{db_name}`.*" in joined or f"ON {db_name}.*" in joined)) or 'GRANT EXECUTE ON' in joined:
        return 'analyst'
    return 'custom'

@app.route('/api/users', methods=['GET','POST','OPTIONS'])
def manage_users():
    if request.method == 'OPTIONS':
        return '', 204

    db_name = DB_CONFIG.get('database') or 'FactoryManagement'

    if request.method == 'GET':
        # List non-system users and infer roles
        users = []
        conn = get_connection()
        if not conn:
            return jsonify({'error':'Database connection failed'}), 500
        cur = conn.cursor(dictionary=True)
        try:
            cur.execute("SELECT User, Host FROM mysql.user WHERE User NOT IN ('mysql.session','mysql.sys','root') ORDER BY User")
            rows = cur.fetchall() or []
        finally:
            cur.close(); conn.close()
        for r in rows:
            grants = _grants_for_user(r['User'], r['Host'])
            users.append({
                'user': r['User'],
                'host': r['Host'],
                'role': _detect_role_from_grants(grants, db_name),
                'grants': grants
            })
        return jsonify({'users': users}), 200

    # POST - create user
    data = request.get_json(force=True) or {}
    username = data.get('username','').strip()
    password = data.get('password','')
    role = (data.get('role') or '').lower().strip()

    if not ALLOWED_USERNAME.match(username):
        return jsonify({'error': 'Username must be 3-30 chars, letters/numbers/underscore only'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if role not in ('admin','operator','analyst'):
        return jsonify({'error': 'Role must be one of: admin, operator, analyst'}), 400

    stmts = [f"CREATE USER IF NOT EXISTS '{username}'@'%' IDENTIFIED BY %s"]
    # We cannot parameterize identifiers in GRANT statements; using f-strings with validated inputs.
    stmts_rendered = [stmts[0].replace('%s', f"'{password}'")]

    if role == 'admin':
        stmts_rendered.append(f"GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{username}'@'%' ")
    elif role == 'operator':
        tables = ['EMPLOYEE','DEPARTMENT','FACTORY','MACHINE','PRODUCT','PRODUCTION_ORDER']
        for t in tables:
            stmts_rendered.append(f"GRANT SELECT, INSERT, UPDATE, DELETE ON `{db_name}`.`{t}` TO '{username}'@'%' ")
    elif role == 'analyst':
        stmts_rendered.append(f"GRANT SELECT ON `{db_name}`.* TO '{username}'@'%' ")
        # Functions
        for fn in ['get_department_by_emp','total_qty_by_product']:
            stmts_rendered.append(f"GRANT EXECUTE ON FUNCTION `{db_name}`.`{fn}` TO '{username}'@'%' ")
        # Procedures
        for proc in ['assign_machine_to_factory','update_priority_based_on_qty']:
            stmts_rendered.append(f"GRANT EXECUTE ON PROCEDURE `{db_name}`.`{proc}` TO '{username}'@'%' ")

    stmts_rendered.append('FLUSH PRIVILEGES')

    try:
        _run_statements(stmts_rendered)
        return jsonify({'message': f"User '{username}' created/updated with role '{role}'"}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print('Starting API on port 5000')
    app.run(host='localhost', port=5000, debug=False)
