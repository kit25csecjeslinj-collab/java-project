-- ==================================================================
-- BloodLink AI - MySQL Relational Schema & Synthetic Data Seed
-- Target Engine: MySQL 8.0+
-- ==================================================================

CREATE DATABASE IF NOT EXISTS bloodlink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bloodlink_db;

-- 1. USERS & AUTHENTICATION TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL, -- ROLE_ADMIN, ROLE_STAFF, ROLE_DONOR
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_username (username),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. DONORS TABLE
CREATE TABLE IF NOT EXISTS donors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_code VARCHAR(30) NOT NULL UNIQUE, -- e.g., BL-D1001
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INT NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    city VARCHAR(100) NOT NULL,
    last_donation_date DATE NULL,
    availability_status ENUM('AVAILABLE', 'UNAVAILABLE', 'ON_HOLD') NOT NULL DEFAULT 'AVAILABLE',
    eligibility_status ENUM('ELIGIBLE', 'PENDING_REVIEW', 'INELIGIBLE') NOT NULL DEFAULT 'ELIGIBLE',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_donations INT NOT NULL DEFAULT 0,
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_donor_blood_group (blood_group),
    INDEX idx_donor_city (city),
    INDEX idx_donor_availability (availability_status),
    INDEX idx_donor_eligibility (eligibility_status)
) ENGINE=InnoDB;

-- 3. BLOOD INVENTORY TABLE
CREATE TABLE IF NOT EXISTS blood_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL UNIQUE,
    available_units INT NOT NULL DEFAULT 0 CHECK (available_units >= 0),
    minimum_threshold INT NOT NULL DEFAULT 15,
    critical_threshold INT NOT NULL DEFAULT 6,
    reserved_units INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. INVENTORY TRANSACTIONS TABLE (Audit log for every stock modification)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(40) NOT NULL UNIQUE,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units INT NOT NULL,
    transaction_type ENUM('COLLECTION', 'DISPATCH', 'ADJUSTMENT', 'DISPOSAL') NOT NULL,
    transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    reference_id VARCHAR(50),
    batch_number VARCHAR(50) NOT NULL,
    INDEX idx_txn_blood_group (blood_group),
    INDEX idx_txn_type (transaction_type),
    INDEX idx_txn_date (transaction_timestamp)
) ENGINE=InnoDB;

-- 5. BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS blood_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(40) NOT NULL UNIQUE,
    hospital_name VARCHAR(200) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_required INT NOT NULL CHECK (units_required > 0),
    units_dispatched INT NOT NULL DEFAULT 0,
    city VARCHAR(100) NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority ENUM('NORMAL', 'URGENT', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    status ENUM('PENDING', 'PROCESSING', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    contact_person VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(40) NOT NULL,
    patient_condition TEXT,
    fulfilled_at TIMESTAMP NULL,
    notes TEXT,
    INDEX idx_req_blood_group (blood_group),
    INDEX idx_req_priority (priority),
    INDEX idx_req_status (status)
) ENGINE=InnoDB;

-- 6. SYSTEM ALERTS TABLE
CREATE TABLE IF NOT EXISTS system_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_code VARCHAR(40) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    alert_type ENUM('CRITICAL_SHORTAGE', 'LOW_STOCK', 'EMERGENCY_REQUEST', 'INVENTORY_UPDATE', 'EXPIRY_WARNING') NOT NULL,
    severity ENUM('CRITICAL', 'WARNING', 'INFO') NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_id VARCHAR(50),
    INDEX idx_alert_is_read (is_read),
    INDEX idx_alert_severity (severity)
) ENGINE=InnoDB;

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(80) NOT NULL,
    user_performed VARCHAR(100) NOT NULL,
    entity_name VARCHAR(80) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- INITIAL SEED DATA
-- Passwords are BCrypt hashed: 'admin123', 'staff123', 'donor123'
-- ------------------------------------------------------------------

INSERT INTO users (username, password_hash, full_name, email, role, enabled) VALUES
('admin@bloodlink.org', '$2a$10$7b6/vXwSGBM9G6d.865gIeM9M7i59Vv0.BqmzU2W/bC1F034W1j1y', 'Dr. Sarah Chen', 'admin@bloodlink.org', 'ROLE_ADMIN', TRUE),
('staff@bloodlink.org', '$2a$10$7b6/vXwSGBM9G6d.865gIeM9M7i59Vv0.BqmzU2W/bC1F034W1j1y', 'Marcus Vance', 'staff@bloodlink.org', 'ROLE_STAFF', TRUE),
('donor@bloodlink.org', '$2a$10$7b6/vXwSGBM9G6d.865gIeM9M7i59Vv0.BqmzU2W/bC1F034W1j1y', 'Elena Rostova', 'donor@bloodlink.org', 'ROLE_DONOR', TRUE);

INSERT INTO blood_inventory (blood_group, available_units, minimum_threshold, critical_threshold, reserved_units) VALUES
('A+', 34, 15, 8, 4),
('A-', 12, 15, 6, 2),
('B+', 28, 15, 8, 3),
('B-', 5, 12, 6, 2),
('AB+', 19, 10, 5, 1),
('AB-', 8, 10, 4, 0),
('O+', 42, 20, 10, 6),
('O-', 4, 18, 8, 3);
