-- ========================================================
-- Schema: Gym Management – Complete SQL Script
-- PostgreSQL DDL
-- ========================================================

-- 1. Create reusable gender enum type
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- =========================
-- 2. Security Questions
-- =========================
CREATE TABLE security_questions
(
    question_id   SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL
);

-- 2. Roles lookup
CREATE TABLE roles
(
    role_id   SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Core employee table
CREATE TABLE employee
(
    id         SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name  VARCHAR(50) NOT NULL,
    birth_date DATE        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
    role_id    INTEGER     NOT NULL
        REFERENCES roles (role_id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
);

-- 4. Trigger function to auto-update employee.updated_at
CREATE OR REPLACE FUNCTION trg_set_employee_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach trigger to employee table
CREATE TRIGGER employee_updated_at_trg
    BEFORE UPDATE
    ON employee
    FOR EACH ROW
EXECUTE PROCEDURE trg_set_employee_updated_at();

-- 6. Employee authentication details
CREATE TABLE employee_auth
(
    id                   INTEGER PRIMARY KEY REFERENCES employee (id) ON DELETE CASCADE,
    username             CITEXT UNIQUE NOT NULL,
    password_hash        VARCHAR(255)  NOT NULL,
    question_id          INTEGER       REFERENCES security_questions (question_id) ON DELETE SET NULL,
    question_answer_hash VARCHAR(255)
);

-- 7. Employee login history
CREATE TABLE employee_login
(
    login_id    SERIAL PRIMARY KEY,
    employee_id INTEGER     NOT NULL
        REFERENCES employee (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    login_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Employee contact information
CREATE TABLE employee_contacts
(
    employee_id INTEGER PRIMARY KEY
        REFERENCES employee (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    phone       VARCHAR(11),
    address     TEXT
);

-- 9. Employee salary history
CREATE TABLE employee_salary
(
    salary_id   SERIAL PRIMARY KEY,
    employee_id INTEGER        NOT NULL
        REFERENCES employee (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    amount      NUMERIC(15, 2) NOT NULL,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);


-- 10. Employee attendance records
CREATE TABLE employee_attendance
(
    attendance_id   SERIAL PRIMARY KEY,
    employee_id     INTEGER     NOT NULL
        REFERENCES employee (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    attendance_date DATE        NOT NULL,
    check_in_time   TIMESTAMPTZ,
    check_out_time  TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'absent'
        CHECK (status IN ('present', 'absent', 'leave'))
);


-- --------------------------------------------------------
-- 11. Users (gym members) table
CREATE TABLE users
(
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(50)   NOT NULL,
    last_name   VARCHAR(50)   NOT NULL,
    birth_date  DATE          NOT NULL,
    gender      gender_type   NOT NULL,
    phone       VARCHAR(11)   NOT NULL,
    weight_kg   NUMERIC(5, 2) NOT NULL,
    height_cm   NUMERIC(5, 2) NOT NULL,
    bmi         NUMERIC(5, 2) GENERATED ALWAYS AS (
        weight_kg / ((height_cm / 100) ^ 2)
        ) STORED,
    trainer_id  INTEGER
                              REFERENCES employee (id)
                                  ON UPDATE CASCADE
                                  ON DELETE SET NULL,
    is_fee_paid BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 12. Trigger function to auto-update users.updated_at
CREATE OR REPLACE FUNCTION trg_set_users_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Attach trigger to users table
CREATE TRIGGER users_updated_at_trg
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE PROCEDURE trg_set_users_updated_at();


-- 14. Optional: User payment history
CREATE TABLE user_payments
(
    payment_id SERIAL PRIMARY KEY,
    user_id    INTEGER        NOT NULL
        REFERENCES users (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    amount     NUMERIC(10, 2) NOT NULL,
    paid_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- 15. Optional: User attendance records
CREATE TABLE user_attendance
(
    attendance_id   SERIAL PRIMARY KEY,
    user_id         INTEGER     NOT NULL
        REFERENCES users (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    attendance_date DATE        NOT NULL,
    check_in_time   TIMESTAMPTZ,
    check_out_time  TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'absent'
        CHECK (status IN ('present', 'absent', 'leave'))
);


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

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_gym_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gym_services_update_trigger
BEFORE UPDATE ON gym_services
FOR EACH ROW
EXECUTE FUNCTION update_gym_services_timestamp();

-- ========================================================
-- End of Gym Management Schema Script
-- ========================================================

-- ========================================================
-- Sample: Gym Management – Complete SQL Script
-- ========================================================

INSERT INTO roles (role_name)
VALUES ('admin'),
       ('trainer'),
       ('manager'),
       ('receptionist');


INSERT INTO employee (first_name, last_name, birth_date, role_id)
VALUES ('Ali', 'Ahmadi', '1990-01-01',
        (SELECT role_id FROM roles WHERE role_name = 'admin'));


INSERT INTO employee_auth (id, username, password_hash)
VALUES ((SELECT id FROM employee WHERE first_name = 'Ali' AND last_name = 'Ahmadi'),
        'admin_ali',
        '$2b$10$5PbFuwJz0RrbqI3dcA8nLuvCJP02VQheXzL3xWy7XD0Kp5uBtYdpq' -- hashed password123
       );

INSERT INTO security_questions (question_text)
VALUES ('نام اولین معلم شما چیست؟'),
       ('نام حیوان خانگی دوران کودکی شما چه بود؟'),
       ('نام مدرسه ابتدایی شما چیست؟'),
       ('نام بهترین دوست دوران کودکی شما چیست؟'),
       ('اولین فیلم مورد علاقه شما چه بود؟');

INSERT INTO employee_auth (id, username, password_hash, question_id, question_answer_hash)
VALUES ((SELECT id FROM employee WHERE first_name = 'parham' AND last_name = 'safiyaryi'),
        'parham',
        '$2b$10$PH4GQSF3FuigMm4zpeGY..U5TuaP7Oa9qGdgO3G2cX4vVexxCDsLm',
        (SELECT question_id FROM security_questions WHERE question_text = 'اولین فیلم مورد علاقه شما چه بود؟'),
        '$2b$10$HVRwrGS/nJ.4zqW1.1PlheMqAPM1/NquEzGorNrBjtBoRkmMVHh3y');



        -- 16. Service types table (unchanged)
CREATE TABLE service_types (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Insert basic service types (unchanged)
INSERT INTO service_types (name, description) VALUES 
('Bodybuilding', 'Strength training and muscle building'),
('Aerobic', 'Cardiovascular fitness training'),
('Nutrition', 'Diet and meal planning');

-- 17. Client service requests (updated for multiple services)
CREATE TABLE client_service_requests (
    request_id SERIAL PRIMARY KEY,
    client_phone VARCHAR(11) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES employee(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    accepted_by INTEGER REFERENCES employee(id),
    accepted_at TIMESTAMPTZ,
    notes TEXT
);

-- New table for request-service relationships
CREATE TABLE request_services (
    request_id INTEGER NOT NULL REFERENCES client_service_requests(request_id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES service_types(service_id),
    PRIMARY KEY (request_id, service_id)
);

-- 18. Trainer-client assignments (updated for multiple services)
CREATE TABLE trainer_assignments (
    assignment_id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL REFERENCES employee(id),
    client_id INTEGER NOT NULL REFERENCES users(id),
    request_id INTEGER NOT NULL REFERENCES client_service_requests(request_id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

