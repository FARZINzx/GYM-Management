-- Drop existing objects if they exist (for safe re-run)
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS salaries;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS employee;
DROP TYPE IF EXISTS gender_enum;
DROP DOMAIN IF EXISTS phone_e164;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Domain for E.164 phone numbers
CREATE DOMAIN phone_e164 AS VARCHAR(20)
    CHECK (VALUE ~ '^\\+?[1-9][0-9]{1,14}$');

-- Gender enumeration
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

-- Table: employee
CREATE TABLE employee
(
    id                SERIAL PRIMARY KEY,
    first_name        VARCHAR(50)        NOT NULL,
    last_name         VARCHAR(50)        NOT NULL,
    username          VARCHAR(30) UNIQUE NOT NULL,
    password_hash     VARCHAR(255)       NOT NULL,
    token             VARCHAR(255),
    role              VARCHAR(20)        NOT NULL
        CHECK (role IN ('trainer', 'admin', 'receptionist', 'manager')),
    phone             VARCHAR(20) UNIQUE NOT NULL
        CHECK (phone ~* '^[0-9+\- ]+$'),
    sport_background  TEXT,
    count_of_students INTEGER                     DEFAULT 0 CHECK (count_of_students >= 0),
    is_active         BOOLEAN                     DEFAULT FALSE,
    created_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    last_login        TIMESTAMPTZ,
    birth_date        DATE
);

-- Indexes on employee
CREATE INDEX idx_employee_role ON employee (role);
CREATE INDEX idx_employee_is_active ON employee (is_active);
CREATE INDEX idx_employee_phone ON employee (phone);

-- Trigger function: update updated_at
CREATE OR REPLACE FUNCTION update_employee_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on employee
CREATE TRIGGER trg_employee_updated_at
    BEFORE UPDATE
    ON employee
    FOR EACH ROW
EXECUTE FUNCTION update_employee_updated_at();

-- Table: salaries
CREATE TABLE salaries
(
    employee_id  INTEGER REFERENCES employee (id),
    amount       DECIMAL(10, 2) NOT NULL,
    payment_date DATE           NOT NULL,
    cycle        VARCHAR(10) CHECK (cycle IN ('monthly', 'weekly', 'biweekly'))
);

-- Table: attendance
CREATE TABLE attendance
(
    employee_id INTEGER REFERENCES employee (id),
    check_in    TIMESTAMPTZ DEFAULT NOW(),
    check_out   TIMESTAMPTZ,
    notes       TEXT
);

-- Table: users
CREATE TABLE users
(
    id          UUID PRIMARY KEY       DEFAULT gen_random_uuid(),
    first_name  CITEXT        NOT NULL,
    last_name   CITEXT        NOT NULL,
    age         INTEGER       NOT NULL CHECK (age >= 0 AND age <= 120),
    phone       phone_e164    NOT NULL,
    gender      gender_enum   NOT NULL,
    weight_kg   NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
    height_cm   NUMERIC(5, 2) NOT NULL CHECK (height_cm > 0),
    bmi         NUMERIC(5, 2) GENERATED ALWAYS AS (
        weight_kg / ((height_cm / 100) ^ 2)
        ) STORED,
    trainer_id  INTEGER       REFERENCES employee (id) ON DELETE SET NULL,
    is_fee_paid BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger function: set updated_at on users
CREATE OR REPLACE FUNCTION set_users_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on users
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE FUNCTION set_users_updated_at();

-- Indexes on users
CREATE INDEX idx_users_trainer ON users (trainer_id);
CREATE INDEX idx_users_unpaid ON users (trainer_id) WHERE NOT is_fee_paid;

-- Sample data: employees
INSERT INTO employee (id, first_name, last_name, username, password_hash, token, role, phone, sport_background,
                      count_of_students, is_active, created_at, updated_at, last_login, birth_date)
VALUES (1, 'Gym', 'Admin', 'admin', '$2b$10$NI6qOkeW.FXtOwWIR6Fqse7xXU2CzbSw3x2QIz7tePzYM9BZq2pB2', NULL, 'admin',
        '+1111111111', NULL, 0, TRUE, '2025-04-10 17:02:27.6596+03:30', '2025-04-10 17:02:27.6596+03:30', NULL,
        '1985-01-01'),
       (2, 'John', 'Trainer', 'trainer1', '$2b$10$VB2NwrTUptZpSgUCg3aYXez69r40qrbYDSkPtdT2vZZTYSYdhSNbW', NULL,
        'trainer', '+1222222222', NULL, 0, TRUE, '2025-04-10 17:02:27.742343+03:30', '2025-04-10 17:02:27.742343+03:30',
        NULL, '1990-05-15'),
       (5, 'farzin', 'hamzehi', 'farzin', '$2b$10$0RBZ2q0IVcPejf6P6OnaiOh3XIUXbyUMeWOH8HMaOMqNF0LvNoJc6', NULL,
        'trainer', '+1222222223', NULL, 0, TRUE, '2025-04-16 07:27:21.080563+03:30', '2025-04-16 07:27:21.080563+03:30',
        NULL, '1990-05-15'),
       (7, 'farzin', 'hamzehi', 'manager', '$2b$10$Y/7Qi1NkaV0FtIsZ4e35GeIfgeHClB.g9DgeB3Zu5qb4zI1cA2nRG', NULL,
        'manager', '+1222222223', NULL, 0, TRUE, '2025-04-21 21:27:58.050629+03:30', '2025-04-21 21:27:58.050629+03:30',
        NULL, '1990-05-15');

-- Sample data: users
INSERT INTO users (id, first_name, last_name, age, phone, gender, weight_kg, height_cm, is_fee_paid, created_at,
                   updated_at)
VALUES ('0012715d-9a9e-4874-92de-58d52b31ada3', 'همزه یی', 'همزه یی', 20, '09187997434', 'male', 82.00, 180.00, FALSE,
        '2025-04-22 23:15:40.888656+03:30', '2025-04-22 23:15:40.888656+03:30'),
       ('3504c909-75fb-4391-9485-4a5ac05d8e1e', 'همزه ئی', 'همزه ئی', 20, '09187997434', 'male', 81.00, 176.00, FALSE,
        '2025-04-24 20:47:59.60248+03:30', '2025-04-24 20:47:59.60248+03:30'),
       ('557c7cd6-9b84-43bb-8a8a-3c2ae2f77eff', 'علی', 'حسینی', 32, '09127487894', 'male', 80.00, 180.00, FALSE,
        '2025-04-26 23:13:08.083669+03:30', '2025-04-26 23:13:08.083669+03:30'),
       ('6ad1249b-f36d-46d1-84b0-2301bad36fe6', 'علی', 'حسینی', 20, '09127487894', 'male', 80.00, 180.00, FALSE,
        '2025-04-26 17:39:39.686432+03:30', '2025-04-26 17:39:39.686432+03:30'),
       ('77a6b762-c538-4228-8a63-edd1b2c73dd9', 'فرزین', 'همزه ئی', 20, '09187997434', 'male', 81.00, 176.00, FALSE,
        '2025-04-24 20:50:36.462065+03:30', '2025-04-24 20:50:36.462065+03:30'),
       ('9232d059-2bbb-46aa-9ea7-ae6731254468', 'فرزین', 'همزه ئی', 20, '09187997434', 'male', 81.00, 176.00, FALSE,
        '2025-04-24 21:17:08.732672+03:30', '2025-04-24 21:17:08.732672+03:30'),
       ('c7acf06d-1817-478c-b232-bdbf5c18c0a0', 'همزه یی', 'همزه یی', 20, '09187997434', 'male', 80.00, 180.00, FALSE,
        '2025-04-22 23:11:59.877289+03:30', '2025-04-22 23:11:59.877289+03:30'),
       ('c7df6010-e762-407d-8621-dfd239601a20', 'علی', 'حسینی', 60, '09127487894', 'female', 80.00, 180.00, FALSE,
        '2025-04-24 21:37:31.23963+03:30', '2025-04-24 21:37:31.23963+03:30'),
       ('e3f006d3-9d36-440f-a857-3a42dc4e9a6b', 'همزه یی', 'همزه یی', 20, '09187997434', 'male', 80.00, 180.00, FALSE,
        '2025-04-22 22:08:46.715561+03:30', '2025-04-22 22:08:46.715561+03:30'),
       ('efe28d92-16bd-4236-94c9-4419adb7e06f', 'همزه ئی', 'همزه ئی', 20, '09187997434', 'male', 81.00, 176.00, FALSE,
        '2025-04-24 20:43:16.83638+03:30', '2025-04-24 20:43:16.83638+03:30');
