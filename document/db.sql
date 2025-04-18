CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE employee (
  -- Core Identification
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  
  -- Authentication
  username VARCHAR(30) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- Store bcrypt hashes only
  token VARCHAR(255),                   -- For JWT/refresh tokens
  
  -- Role Management
  role VARCHAR(20) NOT NULL CHECK (role IN ('trainer', 'admin', 'receptionist', 'manager')),
  
  -- Contact Info
  phone VARCHAR(20) UNIQUE NOT NULL,
 
  -- Professional Details
  sport_background TEXT,
  count_of_students INTEGER DEFAULT 0 CHECK (count_of_students >= 0),
  
  -- Status Flags
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  
  -- Age/Birthdate (more flexible than just age)
  birth_date DATE,
  
  -- Constraints
  CONSTRAINT username_format CHECK (username ~* '^[a-z0-9_]+$'),
  CONSTRAINT phone_format CHECK (phone ~* '^[0-9+\- ]+$')
);

-- Indexes for performance
CREATE INDEX idx_employee_role ON employee(role);
CREATE INDEX idx_employee_is_active ON employee(is_active);
CREATE INDEX idx_employee_phone ON employee(phone);

-- Automatically update updated_at
CREATE OR REPLACE FUNCTION update_employee_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_employee_updated_at
BEFORE UPDATE ON employee
FOR EACH ROW
EXECUTE FUNCTION update_employee_updated_at();

-- For salary tracking (better than boolean flag)
CREATE TABLE salaries (
  employee_id INTEGER REFERENCES employee(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  cycle VARCHAR(10) CHECK (cycle IN ('monthly', 'weekly', 'biweekly'))
);

-- For attendance (better than is_present flag)
CREATE TABLE attendance (
  employee_id INTEGER REFERENCES employee(id),
  check_in TIMESTAMPTZ DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  notes TEXT
);