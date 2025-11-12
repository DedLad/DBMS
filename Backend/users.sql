
SET @DB := 'FactoryManagement';


CREATE USER IF NOT EXISTS 'admin_user'@'%' IDENTIFIED BY 'Admin#123!';
CREATE USER IF NOT EXISTS 'operator_user'@'%' IDENTIFIED BY 'Operator#123!';
CREATE USER IF NOT EXISTS 'analyst_user'@'%' IDENTIFIED BY 'Analyst#123!';


GRANT ALL PRIVILEGES ON `FactoryManagement`.* TO 'admin_user'@'%';


GRANT SELECT, INSERT, UPDATE, DELETE ON `FactoryManagement`.`EMPLOYEE` TO 'operator_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `FactoryManagement`.`DEPARTMENT` TO 'operator_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `FactoryManagement`.`FACTORY` TO 'operator_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `FactoryManagement`.`MACHINE` TO 'operator_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `FactoryManagement`.`PRODUCT` TO 'operator_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `FactoryManagement`.`PRODUCTION_ORDER` TO 'operator_user'@'%';

GRANT SELECT ON `FactoryManagement`.* TO 'analyst_user'@'%';

GRANT EXECUTE ON FUNCTION `FactoryManagement`.`get_department_by_emp` TO 'analyst_user'@'%';
GRANT EXECUTE ON FUNCTION `FactoryManagement`.`total_qty_by_product` TO 'analyst_user'@'%';

GRANT EXECUTE ON PROCEDURE `FactoryManagement`.`assign_machine_to_factory` TO 'analyst_user'@'%';
GRANT EXECUTE ON PROCEDURE `FactoryManagement`.`update_priority_based_on_qty` TO 'analyst_user'@'%';


FLUSH PRIVILEGES;


-- SHOW GRANTS FOR 'admin_user'@'%';
-- SHOW GRANTS FOR 'operator_user'@'%';
-- SHOW GRANTS FOR 'analyst_user'@'%';
