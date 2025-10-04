
CREATE TABLE departments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_departments_createdat (createdAt)
);

CREATE TABLE employees (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  departmentId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_employees_department (departmentId),
  INDEX idx_employees_email (email),
  INDEX idx_employees_createdat (createdAt),
  FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE TABLE leave_requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employeeId VARCHAR(36) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PENDING_APPROVAL') NOT NULL DEFAULT 'PENDING',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  processedAt TIMESTAMP NULL,
  idempotencyKey VARCHAR(255) UNIQUE,
  INDEX idx_leave_requests_employee (employeeId),
  INDEX idx_leave_requests_status (status),
  INDEX idx_leave_requests_dates (startDate, endDate),
  INDEX idx_leave_requests_createdat (createdAt),
  INDEX idx_leave_requests_idempotency (idempotencyKey),
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);