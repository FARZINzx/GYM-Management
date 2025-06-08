-- ========================================================
-- Gym Management System - Complete Database Schema
-- PostgreSQL DDL Script with Required Extensions
-- ========================================================

-- Clean up existing objects if they exist
DROP TRIGGER IF EXISTS employee_updated_at_trg ON employee;
DROP TRIGGER IF EXISTS users_updated_at_trg ON users;
DROP TRIGGER IF EXISTS gym_services_update_trigger ON gym_services;

DROP TABLE IF EXISTS request_services;
DROP TABLE IF EXISTS trainer_assignments;
DROP TABLE IF EXISTS client_service_requests;
DROP TABLE IF EXISTS user_attendance;
DROP TABLE IF EXISTS user_payments;
DROP TABLE IF EXISTS employee_attendance;
DROP TABLE IF EXISTS employee_salary;
DROP TABLE IF EXISTS employee_contacts;
DROP TABLE IF EXISTS employee_login;
DROP TABLE IF EXISTS employee_auth;
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS gym_services;
DROP TABLE IF EXISTS service_types;
DROP TABLE IF EXISTS security_questions;

DROP TYPE IF EXISTS gender_type;
DROP FUNCTION IF EXISTS trg_set_employee_updated_at();
DROP FUNCTION IF EXISTS trg_set_users_updated_at();
DROP FUNCTION IF EXISTS update_gym_services_timestamp();

-- ========================================================
-- 1. Install Required Extensions
-- ========================================================

-- Enable case-insensitive text type (CITEXT)
CREATE EXTENSION IF NOT EXISTS citext;

-- Enable UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic functions for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable advanced string functions
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ========================================================
-- 2. Type Definitions
-- ========================================================

-- Gender enumeration type
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- ========================================================
-- 3. Security and Authentication Tables
-- ========================================================

-- Security questions for password recovery
CREATE TABLE security_questions (
    question_id   SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL
);

-- User roles with different permissions
CREATE TABLE roles (
    role_id   SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- ========================================================
-- 4. Employee Management Tables
-- ========================================================

-- Core employee information
CREATE TABLE employee (
    id         SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name  VARCHAR(50) NOT NULL,
    birth_date DATE        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
    role_id    INTEGER     NOT NULL REFERENCES roles (role_id)
);

-- Function to update employee timestamps automatically
CREATE OR REPLACE FUNCTION trg_set_employee_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic employee update timestamps
CREATE TRIGGER employee_updated_at_trg
    BEFORE UPDATE ON employee
    FOR EACH ROW
    EXECUTE PROCEDURE trg_set_employee_updated_at();

-- Employee authentication credentials
CREATE TABLE employee_auth (
    id                   INTEGER PRIMARY KEY REFERENCES employee (id) ON DELETE CASCADE,
    username             CITEXT UNIQUE NOT NULL,
    password_hash        VARCHAR(255)  NOT NULL,
    question_id          INTEGER REFERENCES security_questions (question_id) ON DELETE SET NULL,
    question_answer_hash VARCHAR(255)
);

-- Employee login history tracking
CREATE TABLE employee_login (
    login_id    SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employee (id),
    login_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee contact information
CREATE TABLE employee_contacts (
    employee_id INTEGER PRIMARY KEY REFERENCES employee (id),
    phone       VARCHAR(11),
    address     TEXT
);

-- Employee salary history
CREATE TABLE employee_salary (
    salary_id   SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employee (id),
    amount      NUMERIC(15, 2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee attendance records
CREATE TABLE employee_attendance (
    attendance_id   SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employee (id),
    attendance_date DATE NOT NULL,
    check_in_time   TIMESTAMPTZ,
    check_out_time  TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'absent'
        CHECK (status IN ('present', 'absent', 'leave'))
);

-- ========================================================
-- 5. Member (User) Management Tables
-- ========================================================

-- Gym member information
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(50) NOT NULL,
    last_name   VARCHAR(50) NOT NULL,
    birth_date  DATE NOT NULL,
    gender      gender_type NOT NULL,
    phone       VARCHAR(11) NOT NULL,
    weight_kg   NUMERIC(5, 2) NOT NULL,
    height_cm   NUMERIC(5, 2) NOT NULL,
    bmi         NUMERIC(5, 2) GENERATED ALWAYS AS (
        weight_kg / ((height_cm / 100) ^ 2)
    ) STORED,
    trainer_id  INTEGER REFERENCES employee (id),
    is_fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to update user timestamps automatically
CREATE OR REPLACE FUNCTION trg_set_users_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic user update timestamps
CREATE TRIGGER users_updated_at_trg
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE trg_set_users_updated_at();

-- Member payment history
CREATE TABLE user_payments (
    payment_id SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users (id),
    amount     NUMERIC(10, 2) NOT NULL,
    paid_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Member attendance records
CREATE TABLE user_attendance (
    attendance_id   SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users (id),
    attendance_date DATE NOT NULL,
    check_in_time   TIMESTAMPTZ,
    check_out_time  TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'absent'
        CHECK (status IN ('present', 'absent', 'leave'))
);

-- ========================================================
-- 6. Service Management Tables
-- ========================================================

-- Gym services offered
CREATE TABLE gym_services (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    is_active BOOLEAN DEFAULT TRUE,
    icon VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to update service timestamps automatically
CREATE OR REPLACE FUNCTION update_gym_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic service update timestamps
CREATE TRIGGER gym_services_update_trigger
BEFORE UPDATE ON gym_services
FOR EACH ROW
EXECUTE FUNCTION update_gym_services_timestamp();

-- Service types classification
CREATE TABLE service_types (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- ========================================================
-- 7. Client Request and Assignment Tables
-- ========================================================

-- Client service requests
CREATE TABLE client_service_requests (
    request_id SERIAL PRIMARY KEY,
    client_phone VARCHAR(11) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES employee(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected')),
    accepted_by INTEGER REFERENCES employee(id),
    accepted_at TIMESTAMPTZ,
    notes TEXT
);

-- Many-to-many relationship between requests and services
CREATE TABLE request_services (
    request_id INTEGER NOT NULL REFERENCES client_service_requests(request_id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES service_types(service_id),
    PRIMARY KEY (request_id, service_id)
);

-- Trainer-client assignments
CREATE TABLE trainer_assignments (
    assignment_id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL REFERENCES employee(id),
    client_id INTEGER NOT NULL REFERENCES users(id),
    request_id INTEGER NOT NULL REFERENCES client_service_requests(request_id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ========================================================
-- 8. Sample Data Insertion
-- ========================================================

-- Insert base roles
INSERT INTO roles (role_name) VALUES
('admin'),
('trainer'),
('manager'),
('receptionist');

-- Insert sample admin employee
INSERT INTO employee (first_name, last_name, birth_date, role_id)
VALUES ('Ali', 'Ahmadi', '1990-01-01',
        (SELECT role_id FROM roles WHERE role_name = 'admin'));

-- Insert admin credentials (password hashed with bcrypt)
INSERT INTO employee_auth (id, username, password_hash)
VALUES (
    (SELECT id FROM employee WHERE first_name = 'Ali' AND last_name = 'Ahmadi'),
    'admin_ali',
    crypt('password123', gen_salt('bf'))
);

-- Insert security questions
INSERT INTO security_questions (question_text) VALUES
('نام اولین معلم شما چیست؟'),
('نام حیوان خانگی دوران کودکی شما چه بود؟'),
('نام مدرسه ابتدایی شما چیست؟'),
('نام بهترین دوست دوران کودکی شما چیست؟'),
('اولین فیلم مورد علاقه شما چه بود؟');

-- Insert sample employee with security question
INSERT INTO employee (first_name, last_name, birth_date, role_id)
VALUES ('فرزین', 'همزه ئی', '2003-12-20',
        (SELECT role_id FROM roles WHERE role_name = 'manager'));

INSERT INTO employee_auth (id, username, password_hash, question_id, question_answer_hash)
VALUES (
    (SELECT id FROM employee WHERE first_name = 'فرزین' AND last_name = 'همزه ئی'),
    'farzin',
    crypt('farzin123', gen_salt('bf')),
    (SELECT question_id FROM security_questions WHERE question_text = 'اولین فیلم مورد علاقه شما چه بود؟'),
    crypt('the lion king', gen_salt('bf'))
);

-- Insert basic service types
INSERT INTO service_types (name) VALUES
('بدنسازی'),
('هوازی'),
('تغذیه');

-- ========================================================
-- End of Database Schema Script
-- ========================================================