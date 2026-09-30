-- =====================================================================
-- MEDICARE NEXUS — RELATIONAL DATABASE SCHEMA & COMPLETE SEED DATA
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench / MariaDB 10.3+
-- Generated for MediCare Nexus: Autonomous Hospital Resource Orchestration
-- =====================================================================

-- Step 1: Database Setup
CREATE DATABASE IF NOT EXISTS `medicare_nexus`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `medicare_nexus`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- TABLE 1: wards
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `wards`;
CREATE TABLE `wards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ward_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `type` ENUM('ICU', 'Emergency', 'General', 'Surgical', 'Pediatric', 'Cardiology') NOT NULL,
  `floor` INT DEFAULT 1,
  `total_beds` INT DEFAULT 10,
  `available_beds` INT DEFAULT 5,
  `occupied_beds` INT DEFAULT 5,
  `location` VARCHAR(150) DEFAULT 'Wing A',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ward_type` (`type`),
  INDEX `idx_ward_floor` (`floor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 2: beds
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `beds`;
CREATE TABLE `beds` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bed_id` VARCHAR(50) NOT NULL UNIQUE,
  `ward_id` VARCHAR(50) NOT NULL,
  `room_number` VARCHAR(50) NOT NULL,
  `bed_type` ENUM('ICU', 'Standard', 'Isolation', 'Emergency', 'Pediatric', 'Recovery') DEFAULT 'Standard',
  `status` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE') DEFAULT 'AVAILABLE',
  `patient_id` VARCHAR(50) DEFAULT NULL,
  `location` VARCHAR(150) DEFAULT 'Floor 1, Room 101',
  `isolation_capable` BOOLEAN DEFAULT FALSE,
  `equipment` JSON DEFAULT NULL,
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bed_ward` (`ward_id`),
  INDEX `idx_bed_status` (`status`),
  INDEX `idx_bed_type` (`bed_type`),
  INDEX `idx_bed_patient` (`patient_id`),
  CONSTRAINT `fk_bed_ward` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`ward_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 3: equipment
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `equipment`;
CREATE TABLE `equipment` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `equipment_id` VARCHAR(50) NOT NULL UNIQUE,
  `type` ENUM('Ventilator', 'ECG', 'Patient Monitor', 'X-Ray', 'Ultrasound', 'CT', 'MRI', 'Infusion Pump', 'Defibrillator') NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `status` ENUM('AVAILABLE', 'IN_USE', 'RESERVED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
  `current_location` VARCHAR(150) DEFAULT 'Equipment Storage A',
  `assigned_patient` VARCHAR(50) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT 'Emergency',
  `maintenance_status` ENUM('GOOD', 'SERVICE_DUE', 'UNDER_REPAIR') DEFAULT 'GOOD',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_equipment_type` (`type`),
  INDEX `idx_equipment_status` (`status`),
  INDEX `idx_equipment_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 4: staff
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `staff_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `role` ENUM('Doctor', 'Nurse', 'Technician', 'Surgeon', 'Anesthetist', 'Support Staff') NOT NULL,
  `specialization` VARCHAR(150) DEFAULT 'General',
  `department` VARCHAR(100) DEFAULT 'Emergency',
  `shift_start` VARCHAR(20) DEFAULT '08:00',
  `shift_end` VARCHAR(20) DEFAULT '20:00',
  `status` ENUM('ON_DUTY', 'OFF_DUTY', 'ON_CALL', 'IN_SURGERY', 'BREAK') DEFAULT 'ON_DUTY',
  `workload` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
  `workload_score` INT DEFAULT 20,
  `current_location` VARCHAR(150) DEFAULT 'Emergency Desk',
  `assigned_patients` JSON DEFAULT NULL,
  `skills` JSON DEFAULT NULL,
  `emergency_eligible` BOOLEAN DEFAULT TRUE,
  `contact` VARCHAR(50) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_staff_role` (`role`),
  INDEX `idx_staff_dept` (`department`),
  INDEX `idx_staff_status` (`status`),
  INDEX `idx_staff_workload` (`workload`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 5: operating_theatres
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `operating_theatres`;
CREATE TABLE `operating_theatres` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ot_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `type` ENUM('General', 'Cardiac', 'Orthopedic', 'Neuro', 'Emergency', 'Maternity') DEFAULT 'General',
  `status` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
  `current_procedure` VARCHAR(150) DEFAULT NULL,
  `assigned_surgeon` VARCHAR(150) DEFAULT NULL,
  `anesthetist` VARCHAR(150) DEFAULT NULL,
  `assigned_nurses` JSON DEFAULT NULL,
  `available_from` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `equipment` JSON DEFAULT NULL,
  `location` VARCHAR(150) DEFAULT 'Surgical Wing, 3rd Floor',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ot_type` (`type`),
  INDEX `idx_ot_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 6: diagnostic_resources
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `diagnostic_resources`;
CREATE TABLE `diagnostic_resources` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `resource_id` VARCHAR(50) NOT NULL UNIQUE,
  `type` ENUM('X-Ray', 'MRI', 'CT', 'Ultrasound', 'Blood Lab', 'ECG', 'Pathology') NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `department` VARCHAR(100) DEFAULT 'Radiology',
  `status` ENUM('AVAILABLE', 'BUSY', 'MAINTENANCE') DEFAULT 'AVAILABLE',
  `queue_length` INT DEFAULT 0,
  `average_wait_time` INT DEFAULT 10,
  `current_patient` VARCHAR(50) DEFAULT NULL,
  `capacity` INT DEFAULT 20,
  `location` VARCHAR(150) DEFAULT 'Diagnostic Block Ground Floor',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_diag_type` (`type`),
  INDEX `idx_diag_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 7: patients
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `age` INT NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `contact` VARCHAR(50) DEFAULT '',
  `blood_group` VARCHAR(10) DEFAULT 'O+',
  `department` VARCHAR(100) DEFAULT 'Emergency',
  `acuity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
  `current_status` ENUM('Waiting', 'Triage', 'Doctor', 'Diagnostic', 'In-Surgery', 'Admitted', 'Discharged') DEFAULT 'Waiting',
  `current_ward` VARCHAR(50) DEFAULT NULL,
  `current_bed` VARCHAR(50) DEFAULT NULL,
  `admission_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `discharge_estimate` TIMESTAMP NULL DEFAULT NULL,
  `heart_rate` INT DEFAULT 75,
  `sp_o2` INT DEFAULT 98,
  `bp` VARCHAR(20) DEFAULT '120/80',
  `temperature` DECIMAL(4,1) DEFAULT 98.6,
  `respiratory_rate` INT DEFAULT 16,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_patient_acuity` (`acuity`),
  INDEX `idx_patient_status` (`current_status`),
  INDEX `idx_patient_dept` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 8: doctors
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mongo_id` VARCHAR(50) UNIQUE DEFAULT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `specialization` VARCHAR(150) DEFAULT '',
  `image_url` VARCHAR(255) DEFAULT NULL,
  `experience` VARCHAR(50) DEFAULT '',
  `qualifications` VARCHAR(150) DEFAULT '',
  `location` VARCHAR(150) DEFAULT '',
  `about` TEXT DEFAULT NULL,
  `fee` DECIMAL(10,2) DEFAULT 0.00,
  `availability` ENUM('Available', 'Unavailable') DEFAULT 'Available',
  `rating` DECIMAL(3,2) DEFAULT 0.00,
  `success_rate` VARCHAR(20) DEFAULT '',
  `patients_count` VARCHAR(20) DEFAULT '',
  `schedule` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_doctor_specialization` (`specialization`),
  INDEX `idx_doctor_availability` (`availability`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 9: appointments
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mongo_id` VARCHAR(50) UNIQUE DEFAULT NULL,
  `owner` VARCHAR(100) NOT NULL DEFAULT 'major_admin_id',
  `created_by` VARCHAR(100) DEFAULT NULL,
  `patient_name` VARCHAR(150) NOT NULL,
  `mobile` VARCHAR(50) NOT NULL,
  `age` INT DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT '',
  `doctor_mongo_id` VARCHAR(50) NOT NULL,
  `doctor_name` VARCHAR(150) DEFAULT '',
  `speciality` VARCHAR(150) DEFAULT '',
  `date` VARCHAR(20) NOT NULL,
  `time` VARCHAR(20) NOT NULL,
  `fees` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Pending', 'Confirmed', 'Completed', 'Canceled', 'Rescheduled') DEFAULT 'Pending',
  `rescheduled_date` VARCHAR(20) DEFAULT NULL,
  `rescheduled_time` VARCHAR(20) DEFAULT NULL,
  `payment_method` ENUM('Cash', 'Online') DEFAULT 'Cash',
  `payment_status` ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
  `payment_amount` DECIMAL(10,2) DEFAULT 0.00,
  `payment_provider_id` VARCHAR(100) DEFAULT '',
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_appt_date` (`date`),
  INDEX `idx_appt_status` (`status`),
  INDEX `idx_appt_doctor` (`doctor_mongo_id`),
  INDEX `idx_appt_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 10: services
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mongo_id` VARCHAR(50) UNIQUE DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `about` TEXT DEFAULT NULL,
  `short_description` VARCHAR(255) DEFAULT '',
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `available` BOOLEAN DEFAULT TRUE,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `instructions` JSON DEFAULT NULL,
  `dates` JSON DEFAULT NULL,
  `slots` JSON DEFAULT NULL,
  `total_appointments` INT DEFAULT 0,
  `completed` INT DEFAULT 0,
  `canceled` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_service_available` (`available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 11: service_appointments
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `service_appointments`;
CREATE TABLE `service_appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mongo_id` VARCHAR(50) UNIQUE DEFAULT NULL,
  `created_by` VARCHAR(100) DEFAULT NULL,
  `patient_name` VARCHAR(150) NOT NULL,
  `mobile` VARCHAR(50) NOT NULL,
  `age` INT DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT '',
  `service_mongo_id` VARCHAR(50) NOT NULL,
  `service_name` VARCHAR(150) NOT NULL,
  `fees` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `date` VARCHAR(20) NOT NULL,
  `hour` INT NOT NULL,
  `minute` INT NOT NULL,
  `ampm` ENUM('AM', 'PM') NOT NULL,
  `status` ENUM('Pending', 'Confirmed', 'Rescheduled', 'Completed', 'Canceled') DEFAULT 'Pending',
  `payment_method` ENUM('Cash', 'Online') DEFAULT 'Cash',
  `payment_status` ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
  `payment_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_serv_appt_date` (`date`),
  INDEX `idx_serv_appt_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 12: patient_queues
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `patient_queues`;
CREATE TABLE `patient_queues` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `queue_id` VARCHAR(50) NOT NULL UNIQUE,
  `patient_id` VARCHAR(50) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `priority` ENUM('P1-Emergency', 'P2-Urgent', 'P3-Standard', 'P4-Routine') DEFAULT 'P3-Standard',
  `waiting_since` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `estimated_service_time` TIMESTAMP NULL DEFAULT NULL,
  `status` ENUM('WAITING', 'IN_SERVICE', 'COMPLETED', 'CANCELLED') DEFAULT 'WAITING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_queue_dept` (`department`),
  INDEX `idx_queue_status` (`status`),
  INDEX `idx_queue_priority` (`priority`),
  CONSTRAINT `fk_queue_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 13: emergency_events
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `emergency_events`;
CREATE TABLE `emergency_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emergency_id` VARCHAR(50) NOT NULL UNIQUE,
  `patient_id` VARCHAR(50) NOT NULL,
  `patient_name` VARCHAR(150) DEFAULT 'Emergency Patient',
  `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
  `heart_rate` INT DEFAULT 120,
  `sp_o2` INT DEFAULT 88,
  `bp` VARCHAR(20) DEFAULT '90/60',
  `temperature` DECIMAL(4,1) DEFAULT 99.1,
  `respiratory_rate` INT DEFAULT 24,
  `required_resources` JSON DEFAULT NULL,
  `status` ENUM('ACTIVE', 'CONTAINED', 'ESCALATED', 'RESOLVED') DEFAULT 'ACTIVE',
  `assigned_bed_id` VARCHAR(50) DEFAULT NULL,
  `assigned_doctor_id` VARCHAR(50) DEFAULT NULL,
  `assigned_doctor_name` VARCHAR(150) DEFAULT NULL,
  `assigned_nurse_id` VARCHAR(50) DEFAULT NULL,
  `assigned_nurse_name` VARCHAR(150) DEFAULT NULL,
  `assigned_equipment_ids` JSON DEFAULT NULL,
  `assigned_ot_id` VARCHAR(50) DEFAULT NULL,
  `assigned_diagnostic_id` VARCHAR(50) DEFAULT NULL,
  `escalation_level` INT DEFAULT 1,
  `response_time_seconds` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_emg_severity` (`severity`),
  INDEX `idx_emg_status` (`status`),
  INDEX `idx_emg_patient` (`patient_id`),
  CONSTRAINT `fk_emg_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 14: emergency_audit_logs
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `emergency_audit_logs`;
CREATE TABLE `emergency_audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emergency_id` VARCHAR(50) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `action` VARCHAR(150) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `actor` VARCHAR(100) DEFAULT 'Nexus Orchestrator',
  INDEX `idx_audit_emg` (`emergency_id`),
  CONSTRAINT `fk_audit_emg` FOREIGN KEY (`emergency_id`) REFERENCES `emergency_events` (`emergency_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 15: resource_assignments
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `resource_assignments`;
CREATE TABLE `resource_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` VARCHAR(50) NOT NULL UNIQUE,
  `patient_id` VARCHAR(50) NOT NULL,
  `emergency_id` VARCHAR(50) DEFAULT NULL,
  `bed_id` VARCHAR(50) DEFAULT NULL,
  `doctor_id` VARCHAR(50) DEFAULT NULL,
  `nurse_id` VARCHAR(50) DEFAULT NULL,
  `equipment_ids` JSON DEFAULT NULL,
  `diagnostic_resource_id` VARCHAR(50) DEFAULT NULL,
  `ot_id` VARCHAR(50) DEFAULT NULL,
  `allocation_score` INT DEFAULT 85,
  `allocation_reason` JSON DEFAULT NULL,
  `status` ENUM('ACTIVE', 'REALLOCATED', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  `conflict_detected` BOOLEAN DEFAULT FALSE,
  `reallocation_reason` VARCHAR(255) DEFAULT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_assign_patient` (`patient_id`),
  INDEX `idx_assign_status` (`status`),
  CONSTRAINT `fk_assign_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 16: forecasts
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `forecasts`;
CREATE TABLE `forecasts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department` ENUM('Emergency', 'ICU', 'General Ward', 'Diagnostics', 'Operating Theatre') NOT NULL,
  `time_window` ENUM('Current', '1 Hour', '2 Hours', '4 Hours') NOT NULL,
  `current_load` INT NOT NULL,
  `predicted_load` INT NOT NULL,
  `confidence` INT DEFAULT 92,
  `risk_level` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  `recommended_actions` JSON DEFAULT NULL,
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_forecast_dept` (`department`),
  INDEX `idx_forecast_risk` (`risk_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 17: alerts
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `alerts`;
CREATE TABLE `alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `alert_id` VARCHAR(50) NOT NULL UNIQUE,
  `type` ENUM('EMERGENCY', 'BOTTLENECK', 'STAFF_OVERLOAD', 'BED_SHORTAGE', 'REALLOCATION', 'MAINTENANCE', 'SYSTEM') NOT NULL,
  `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'INFO') DEFAULT 'MEDIUM',
  `recipient_role` ENUM('ADMIN', 'DOCTOR', 'NURSE', 'OPERATIONS', 'TECHNICIAN', 'ALL') DEFAULT 'ALL',
  `recipient_id` VARCHAR(50) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('UNREAD', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'UNREAD',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_alert_type` (`type`),
  INDEX `idx_alert_severity` (`severity`),
  INDEX `idx_alert_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 18: rtls_locations
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `rtls_locations`;
CREATE TABLE `rtls_locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `resource_id` VARCHAR(50) NOT NULL UNIQUE,
  `resource_type` ENUM('Doctor', 'Nurse', 'Ventilator', 'ECG', 'Wheelchair', 'Patient', 'Monitor') NOT NULL,
  `resource_name` VARCHAR(150) NOT NULL,
  `location` ENUM('Emergency', 'ICU', 'General Ward A', 'General Ward B', 'Operating Theatre', 'Diagnostics', 'OPD', 'Pharmacy') NOT NULL,
  `x` DECIMAL(5,2) DEFAULT 50.00,
  `y` DECIMAL(5,2) DEFAULT 50.00,
  `floor` INT DEFAULT 1,
  `battery_level` INT DEFAULT 95,
  `status` VARCHAR(50) DEFAULT 'ACTIVE',
  `last_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_rtls_res_type` (`resource_type`),
  INDEX `idx_rtls_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- STEP 2: COMPLETE DEMO SEED DATA INSERTION
-- =====================================================================

-- Insert Wards
INSERT INTO `wards` (`ward_id`, `name`, `type`, `floor`, `total_beds`, `available_beds`, `occupied_beds`, `location`) VALUES
  ('WARD-ICU', 'Intensive Care Unit (ICU)', 'ICU', 2, 10, 2, 8, 'Floor 2, Wing A'),
  ('WARD-EMG', 'Emergency Department', 'Emergency', 1, 10, 3, 7, 'Floor 1, West Entrance'),
  ('WARD-GEN-A', 'General Ward A', 'General', 3, 10, 4, 6, 'Floor 3, East Wing'),
  ('WARD-GEN-B', 'General Ward B', 'General', 3, 10, 5, 5, 'Floor 3, West Wing'),
  ('WARD-SURG', 'Surgical Recovery Ward', 'Surgical', 4, 8, 3, 5, 'Floor 4, North Wing');

-- Insert Patients
INSERT INTO `patients` (`patient_id`, `name`, `age`, `gender`, `contact`, `blood_group`, `department`, `acuity`, `current_status`, `current_ward`, `current_bed`, `admission_time`, `discharge_estimate`, `heart_rate`, `sp_o2`, `bp`, `temperature`, `respiratory_rate`, `notes`) VALUES
  ('P-101', 'Emma Patel', 25, 'Male', '+91 9810000832', 'A+', 'ICU', 'CRITICAL', 'Admitted', 'WARD-ICU', 'ICU-02', '2026-09-30 08:59:42', '2026-10-02 09:44:42', 68, 83, '85/55', 98.9, 26, 'Patient assessed in ICU triage.'),
  ('P-102', 'Liam Johnson', 32, 'Female', '+91 9810001664', 'B+', 'Cardiology', 'CRITICAL', 'Admitted', 'WARD-ICU', 'ICU-03', '2026-09-30 08:14:42', '2026-10-03 09:44:42', 71, 84, '85/55', 99.4, 26, 'Patient assessed in Cardiology triage.'),
  ('P-103', 'Olivia Sharma', 39, 'Male', '+91 9810002496', 'AB+', 'Neurology', 'CRITICAL', 'Admitted', 'WARD-ICU', 'ICU-04', '2026-09-30 07:29:42', '2026-10-04 09:44:42', 74, 85, '85/55', 98.4, 26, 'Patient assessed in Neurology triage.'),
  ('P-104', 'Noah Williams', 46, 'Female', '+91 9810003328', 'O-', 'Pediatrics', 'CRITICAL', 'Admitted', 'WARD-ICU', 'ICU-05', '2026-09-30 06:44:42', '2026-10-01 09:44:42', 77, 86, '85/55', 98.9, 26, 'Patient assessed in Pediatrics triage.'),
  ('P-105', 'Ava Verma', 53, 'Male', '+91 9810004160', 'A-', 'General Medicine', 'CRITICAL', 'Admitted', 'WARD-ICU', 'ICU-06', '2026-09-30 05:59:42', '2026-10-02 09:44:42', 80, 87, '85/55', 99.4, 26, 'Patient assessed in General Medicine triage.'),
  ('P-106', 'William Brown', 60, 'Female', '+91 9810004992', 'B-', 'Orthopedics', 'CRITICAL', 'Admitted', 'WARD-ICU', 'ICU-07', '2026-09-30 05:14:42', '2026-10-03 09:44:42', 83, 82, '85/55', 98.4, 26, 'Patient assessed in Orthopedics triage.'),
  ('P-107', 'Sophia Rao', 67, 'Male', '+91 9810005824', 'O+', 'Emergency', 'HIGH', 'Admitted', 'WARD-GEN-A', 'GEN-08', '2026-09-30 04:29:42', '2026-10-04 09:44:42', 86, 97, '120/80', 98.9, 17, 'Patient assessed in Emergency triage.'),
  ('P-108', 'Benjamin Jones', 74, 'Female', '+91 9810006656', 'A+', 'ICU', 'HIGH', 'Admitted', 'WARD-GEN-A', 'GEN-09', '2026-09-30 03:44:42', '2026-10-01 09:44:42', 89, 98, '120/80', 99.4, 18, 'Patient assessed in ICU triage.'),
  ('P-109', 'Isabella Gupta', 81, 'Male', '+91 9810007488', 'B+', 'Cardiology', 'HIGH', 'Admitted', 'WARD-GEN-A', 'GEN-10', '2026-09-30 02:59:42', '2026-10-02 09:44:42', 92, 99, '120/80', 98.4, 19, 'Patient assessed in Cardiology triage.'),
  ('P-110', 'Aarav Miller', 23, 'Female', '+91 9810008320', 'AB+', 'Neurology', 'HIGH', 'Admitted', 'WARD-GEN-A', 'GEN-01', '2026-09-30 02:14:42', '2026-10-03 09:44:42', 95, 95, '120/80', 98.9, 20, 'Patient assessed in Neurology triage.'),
  ('P-111', 'Priya Mehta', 30, 'Male', '+91 9810009152', 'O-', 'Pediatrics', 'HIGH', 'Admitted', 'WARD-GEN-A', 'GEN-02', '2026-09-30 01:29:42', '2026-10-04 09:44:42', 98, 96, '120/80', 99.4, 21, 'Patient assessed in Pediatrics triage.'),
  ('P-112', 'Rohan Davis', 37, 'Female', '+91 9810009984', 'A-', 'General Medicine', 'HIGH', 'Admitted', 'WARD-GEN-A', 'GEN-03', '2026-09-30 00:44:42', '2026-10-01 09:44:42', 101, 97, '120/80', 98.4, 16, 'Patient assessed in General Medicine triage.'),
  ('P-113', 'Ananya Kumar', 44, 'Male', '+91 9810010816', 'B-', 'Orthopedics', 'HIGH', 'Admitted', 'WARD-GEN-A', 'GEN-04', '2026-09-29 23:59:42', '2026-10-02 09:44:42', 104, 98, '120/80', 98.9, 17, 'Patient assessed in Orthopedics triage.'),
  ('P-114', 'Vikram Wilson', 51, 'Female', '+91 9810011648', 'O+', 'Emergency', 'HIGH', 'Admitted', 'WARD-GEN-A', 'GEN-05', '2026-09-29 23:14:42', '2026-10-03 09:44:42', 107, 99, '120/80', 99.4, 18, 'Patient assessed in Emergency triage.'),
  ('P-115', 'Sneha Chopra', 58, 'Male', '+91 9810012480', 'A+', 'ICU', 'HIGH', 'Admitted', 'WARD-GEN-A', 'GEN-06', '2026-09-29 22:29:42', '2026-10-04 09:44:42', 110, 95, '120/80', 98.4, 19, 'Patient assessed in ICU triage.'),
  ('P-116', 'Kabir Smith', 65, 'Female', '+91 9810013312', 'B+', 'Cardiology', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 21:44:42', '2026-10-01 09:44:42', 113, 96, '120/80', 98.9, 20, 'Patient assessed in Cardiology triage.'),
  ('P-117', 'Meera Patel', 72, 'Male', '+91 9810014144', 'AB+', 'Neurology', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 20:59:42', '2026-10-02 09:44:42', 116, 97, '120/80', 99.4, 21, 'Patient assessed in Neurology triage.'),
  ('P-118', 'Arjun Johnson', 79, 'Female', '+91 9810014976', 'O-', 'Pediatrics', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 20:14:42', '2026-10-03 09:44:42', 119, 98, '120/80', 98.4, 16, 'Patient assessed in Pediatrics triage.'),
  ('P-119', 'Pooja Sharma', 21, 'Male', '+91 9810015808', 'A-', 'General Medicine', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 19:29:42', '2026-10-04 09:44:42', 67, 99, '120/80', 98.9, 17, 'Patient assessed in General Medicine triage.'),
  ('P-120', 'James Williams', 28, 'Female', '+91 9810016640', 'B-', 'Orthopedics', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 18:44:42', '2026-10-01 09:44:42', 70, 95, '120/80', 99.4, 18, 'Patient assessed in Orthopedics triage.'),
  ('P-121', 'Emma Verma', 35, 'Male', '+91 9810017472', 'O+', 'Emergency', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 17:59:42', '2026-10-02 09:44:42', 73, 96, '120/80', 98.4, 19, 'Patient assessed in Emergency triage.'),
  ('P-122', 'Liam Brown', 42, 'Female', '+91 9810018304', 'A+', 'ICU', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 17:14:42', '2026-10-03 09:44:42', 76, 97, '120/80', 98.9, 20, 'Patient assessed in ICU triage.'),
  ('P-123', 'Olivia Rao', 49, 'Male', '+91 9810019136', 'B+', 'Cardiology', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 16:29:42', '2026-10-04 09:44:42', 79, 98, '120/80', 99.4, 21, 'Patient assessed in Cardiology triage.'),
  ('P-124', 'Noah Jones', 56, 'Female', '+91 9810019968', 'AB+', 'Neurology', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 15:44:42', '2026-10-01 09:44:42', 82, 99, '120/80', 98.4, 16, 'Patient assessed in Neurology triage.'),
  ('P-125', 'Ava Gupta', 63, 'Male', '+91 9810020800', 'O-', 'Pediatrics', 'HIGH', 'Doctor', NULL, NULL, '2026-09-29 14:59:42', '2026-10-02 09:44:42', 85, 95, '120/80', 98.9, 17, 'Patient assessed in Pediatrics triage.'),
  ('P-126', 'William Miller', 70, 'Female', '+91 9810021632', 'A-', 'General Medicine', 'MEDIUM', 'Doctor', NULL, NULL, '2026-09-29 14:14:42', '2026-10-03 09:44:42', 88, 96, '120/80', 99.4, 18, 'Patient assessed in General Medicine triage.'),
  ('P-127', 'Sophia Mehta', 77, 'Male', '+91 9810022464', 'B-', 'Orthopedics', 'MEDIUM', 'Doctor', NULL, NULL, '2026-09-29 13:29:42', '2026-10-04 09:44:42', 91, 97, '120/80', 98.4, 19, 'Patient assessed in Orthopedics triage.'),
  ('P-128', 'Benjamin Davis', 19, 'Female', '+91 9810023296', 'O+', 'Emergency', 'MEDIUM', 'Doctor', NULL, NULL, '2026-09-29 12:44:42', '2026-10-01 09:44:42', 94, 98, '120/80', 98.9, 20, 'Patient assessed in Emergency triage.'),
  ('P-129', 'Isabella Kumar', 26, 'Male', '+91 9810024128', 'A+', 'ICU', 'MEDIUM', 'Doctor', NULL, NULL, '2026-09-29 11:59:42', '2026-10-02 09:44:42', 97, 99, '120/80', 99.4, 21, 'Patient assessed in ICU triage.'),
  ('P-130', 'Aarav Wilson', 33, 'Female', '+91 9810024960', 'B+', 'Cardiology', 'MEDIUM', 'Doctor', NULL, NULL, '2026-09-29 11:14:42', '2026-10-03 09:44:42', 100, 95, '120/80', 98.4, 16, 'Patient assessed in Cardiology triage.'),
  ('P-131', 'Priya Chopra', 40, 'Male', '+91 9810025792', 'AB+', 'Neurology', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 10:29:42', '2026-10-04 09:44:42', 103, 96, '120/80', 98.9, 17, 'Patient assessed in Neurology triage.'),
  ('P-132', 'Rohan Smith', 47, 'Female', '+91 9810026624', 'O-', 'Pediatrics', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 09:44:42', '2026-10-01 09:44:42', 106, 97, '120/80', 99.4, 18, 'Patient assessed in Pediatrics triage.'),
  ('P-133', 'Ananya Patel', 54, 'Male', '+91 9810027456', 'A-', 'General Medicine', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 08:59:42', '2026-10-02 09:44:42', 109, 98, '120/80', 98.4, 19, 'Patient assessed in General Medicine triage.'),
  ('P-134', 'Vikram Johnson', 61, 'Female', '+91 9810028288', 'B-', 'Orthopedics', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 08:14:42', '2026-10-03 09:44:42', 112, 99, '120/80', 98.9, 20, 'Patient assessed in Orthopedics triage.'),
  ('P-135', 'Sneha Sharma', 68, 'Male', '+91 9810029120', 'O+', 'Emergency', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 07:29:42', '2026-10-04 09:44:42', 115, 95, '120/80', 99.4, 21, 'Patient assessed in Emergency triage.'),
  ('P-136', 'Kabir Williams', 75, 'Female', '+91 9810029952', 'A+', 'ICU', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 06:44:42', '2026-10-01 09:44:42', 118, 96, '120/80', 98.4, 16, 'Patient assessed in ICU triage.'),
  ('P-137', 'Meera Verma', 82, 'Male', '+91 9810030784', 'B+', 'Cardiology', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 05:59:42', '2026-10-02 09:44:42', 66, 97, '120/80', 98.9, 17, 'Patient assessed in Cardiology triage.'),
  ('P-138', 'Arjun Brown', 24, 'Female', '+91 9810031616', 'AB+', 'Neurology', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 05:14:42', '2026-10-03 09:44:42', 69, 98, '120/80', 99.4, 18, 'Patient assessed in Neurology triage.'),
  ('P-139', 'Pooja Rao', 31, 'Male', '+91 9810032448', 'O-', 'Pediatrics', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 04:29:42', '2026-10-04 09:44:42', 72, 99, '120/80', 98.4, 19, 'Patient assessed in Pediatrics triage.'),
  ('P-140', 'James Jones', 38, 'Female', '+91 9810033280', 'A-', 'General Medicine', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 03:44:42', '2026-10-01 09:44:42', 75, 95, '120/80', 98.9, 20, 'Patient assessed in General Medicine triage.'),
  ('P-141', 'Emma Gupta', 45, 'Male', '+91 9810034112', 'B-', 'Orthopedics', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 02:59:42', '2026-10-02 09:44:42', 78, 96, '120/80', 99.4, 21, 'Patient assessed in Orthopedics triage.'),
  ('P-142', 'Liam Miller', 52, 'Female', '+91 9810034944', 'O+', 'Emergency', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 02:14:42', '2026-10-03 09:44:42', 81, 97, '120/80', 98.4, 16, 'Patient assessed in Emergency triage.'),
  ('P-143', 'Olivia Mehta', 59, 'Male', '+91 9810035776', 'A+', 'ICU', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 01:29:42', '2026-10-04 09:44:42', 84, 98, '120/80', 98.9, 17, 'Patient assessed in ICU triage.'),
  ('P-144', 'Noah Davis', 66, 'Female', '+91 9810036608', 'B+', 'Cardiology', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-29 00:44:42', '2026-10-01 09:44:42', 87, 99, '120/80', 99.4, 18, 'Patient assessed in Cardiology triage.'),
  ('P-145', 'Ava Kumar', 73, 'Male', '+91 9810037440', 'AB+', 'Neurology', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 23:59:42', '2026-10-02 09:44:42', 90, 95, '120/80', 98.4, 19, 'Patient assessed in Neurology triage.'),
  ('P-146', 'William Wilson', 80, 'Female', '+91 9810038272', 'O-', 'Pediatrics', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 23:14:42', '2026-10-03 09:44:42', 93, 96, '120/80', 98.9, 20, 'Patient assessed in Pediatrics triage.'),
  ('P-147', 'Sophia Chopra', 22, 'Male', '+91 9810039104', 'A-', 'General Medicine', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 22:29:42', '2026-10-04 09:44:42', 96, 97, '120/80', 99.4, 21, 'Patient assessed in General Medicine triage.'),
  ('P-148', 'Benjamin Smith', 29, 'Female', '+91 9810039936', 'B-', 'Orthopedics', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 21:44:42', '2026-10-01 09:44:42', 99, 98, '120/80', 98.4, 16, 'Patient assessed in Orthopedics triage.'),
  ('P-149', 'Isabella Patel', 36, 'Male', '+91 9810040768', 'O+', 'Emergency', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 20:59:42', '2026-10-02 09:44:42', 102, 99, '120/80', 98.9, 17, 'Patient assessed in Emergency triage.'),
  ('P-150', 'Aarav Johnson', 43, 'Female', '+91 9810041600', 'A+', 'ICU', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 20:14:42', '2026-10-03 09:44:42', 105, 95, '120/80', 99.4, 18, 'Patient assessed in ICU triage.'),
  ('P-151', 'Priya Sharma', 50, 'Male', '+91 9810042432', 'B+', 'Cardiology', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 19:29:42', '2026-10-04 09:44:42', 108, 96, '120/80', 98.4, 19, 'Patient assessed in Cardiology triage.'),
  ('P-152', 'Rohan Williams', 57, 'Female', '+91 9810043264', 'AB+', 'Neurology', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 18:44:42', '2026-10-01 09:44:42', 111, 97, '120/80', 98.9, 20, 'Patient assessed in Neurology triage.'),
  ('P-153', 'Ananya Verma', 64, 'Male', '+91 9810044096', 'O-', 'Pediatrics', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 17:59:42', '2026-10-02 09:44:42', 114, 98, '120/80', 99.4, 21, 'Patient assessed in Pediatrics triage.'),
  ('P-154', 'Vikram Brown', 71, 'Female', '+91 9810044928', 'A-', 'General Medicine', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 17:14:42', '2026-10-03 09:44:42', 117, 99, '120/80', 98.4, 16, 'Patient assessed in General Medicine triage.'),
  ('P-155', 'Sneha Rao', 78, 'Male', '+91 9810045760', 'B-', 'Orthopedics', 'MEDIUM', 'Diagnostic', NULL, NULL, '2026-09-28 16:29:42', '2026-10-04 09:44:42', 65, 95, '120/80', 98.9, 17, 'Patient assessed in Orthopedics triage.'),
  ('P-156', 'Kabir Jones', 20, 'Female', '+91 9810046592', 'O+', 'Emergency', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 15:44:42', '2026-10-01 09:44:42', 68, 96, '120/80', 99.4, 18, 'Patient assessed in Emergency triage.'),
  ('P-157', 'Meera Gupta', 27, 'Male', '+91 9810047424', 'A+', 'ICU', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 14:59:42', '2026-10-02 09:44:42', 71, 97, '120/80', 98.4, 19, 'Patient assessed in ICU triage.'),
  ('P-158', 'Arjun Miller', 34, 'Female', '+91 9810048256', 'B+', 'Cardiology', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 14:14:42', '2026-10-03 09:44:42', 74, 98, '120/80', 98.9, 20, 'Patient assessed in Cardiology triage.'),
  ('P-159', 'Pooja Mehta', 41, 'Male', '+91 9810049088', 'AB+', 'Neurology', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 13:29:42', '2026-10-04 09:44:42', 77, 99, '120/80', 99.4, 21, 'Patient assessed in Neurology triage.'),
  ('P-160', 'James Davis', 48, 'Female', '+91 9810049920', 'O-', 'Pediatrics', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 12:44:42', '2026-10-01 09:44:42', 80, 95, '120/80', 98.4, 16, 'Patient assessed in Pediatrics triage.'),
  ('P-161', 'Emma Kumar', 55, 'Male', '+91 9810050752', 'A-', 'General Medicine', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 11:59:42', '2026-10-02 09:44:42', 83, 96, '120/80', 98.9, 17, 'Patient assessed in General Medicine triage.'),
  ('P-162', 'Liam Wilson', 62, 'Female', '+91 9810051584', 'B-', 'Orthopedics', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 11:14:42', '2026-10-03 09:44:42', 86, 97, '120/80', 99.4, 18, 'Patient assessed in Orthopedics triage.'),
  ('P-163', 'Olivia Chopra', 69, 'Male', '+91 9810052416', 'O+', 'Emergency', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 10:29:42', '2026-10-04 09:44:42', 89, 98, '120/80', 98.4, 19, 'Patient assessed in Emergency triage.'),
  ('P-164', 'Noah Smith', 76, 'Female', '+91 9810053248', 'A+', 'ICU', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 09:44:42', '2026-10-01 09:44:42', 92, 99, '120/80', 98.9, 20, 'Patient assessed in ICU triage.'),
  ('P-165', 'Ava Patel', 18, 'Male', '+91 9810054080', 'B+', 'Cardiology', 'MEDIUM', 'Triage', NULL, NULL, '2026-09-28 08:59:42', '2026-10-02 09:44:42', 95, 95, '120/80', 99.4, 21, 'Patient assessed in Cardiology triage.'),
  ('P-166', 'William Johnson', 25, 'Female', '+91 9810054912', 'AB+', 'Neurology', 'LOW', 'Triage', NULL, NULL, '2026-09-28 08:14:42', '2026-10-03 09:44:42', 98, 96, '120/80', 98.4, 16, 'Patient assessed in Neurology triage.'),
  ('P-167', 'Sophia Sharma', 32, 'Male', '+91 9810055744', 'O-', 'Pediatrics', 'LOW', 'Triage', NULL, NULL, '2026-09-28 07:29:42', '2026-10-04 09:44:42', 101, 97, '120/80', 98.9, 17, 'Patient assessed in Pediatrics triage.'),
  ('P-168', 'Benjamin Williams', 39, 'Female', '+91 9810056576', 'A-', 'General Medicine', 'LOW', 'Triage', NULL, NULL, '2026-09-28 06:44:42', '2026-10-01 09:44:42', 104, 98, '120/80', 99.4, 18, 'Patient assessed in General Medicine triage.'),
  ('P-169', 'Isabella Verma', 46, 'Male', '+91 9810057408', 'B-', 'Orthopedics', 'LOW', 'Triage', NULL, NULL, '2026-09-28 05:59:42', '2026-10-02 09:44:42', 107, 99, '120/80', 98.4, 19, 'Patient assessed in Orthopedics triage.'),
  ('P-170', 'Aarav Brown', 53, 'Female', '+91 9810058240', 'O+', 'Emergency', 'LOW', 'Triage', NULL, NULL, '2026-09-28 05:14:42', '2026-10-03 09:44:42', 110, 95, '120/80', 98.9, 20, 'Patient assessed in Emergency triage.'),
  ('P-171', 'Priya Rao', 60, 'Male', '+91 9810059072', 'A+', 'ICU', 'LOW', 'Triage', NULL, NULL, '2026-09-28 04:29:42', '2026-10-04 09:44:42', 113, 96, '120/80', 99.4, 21, 'Patient assessed in ICU triage.'),
  ('P-172', 'Rohan Jones', 67, 'Female', '+91 9810059904', 'B+', 'Cardiology', 'LOW', 'Triage', NULL, NULL, '2026-09-28 03:44:42', '2026-10-01 09:44:42', 116, 97, '120/80', 98.4, 16, 'Patient assessed in Cardiology triage.'),
  ('P-173', 'Ananya Gupta', 74, 'Male', '+91 9810060736', 'AB+', 'Neurology', 'LOW', 'Triage', NULL, NULL, '2026-09-28 02:59:42', '2026-10-02 09:44:42', 119, 98, '120/80', 98.9, 17, 'Patient assessed in Neurology triage.'),
  ('P-174', 'Vikram Miller', 81, 'Female', '+91 9810061568', 'O-', 'Pediatrics', 'LOW', 'Triage', NULL, NULL, '2026-09-28 02:14:42', '2026-10-03 09:44:42', 67, 99, '120/80', 99.4, 18, 'Patient assessed in Pediatrics triage.'),
  ('P-175', 'Sneha Mehta', 23, 'Male', '+91 9810062400', 'A-', 'General Medicine', 'LOW', 'Triage', NULL, NULL, '2026-09-28 01:29:42', '2026-10-04 09:44:42', 70, 95, '120/80', 98.4, 19, 'Patient assessed in General Medicine triage.'),
  ('P-176', 'Kabir Davis', 30, 'Female', '+91 9810063232', 'B-', 'Orthopedics', 'LOW', 'Waiting', NULL, NULL, '2026-09-28 00:44:42', '2026-10-01 09:44:42', 73, 96, '120/80', 98.9, 20, 'Patient assessed in Orthopedics triage.'),
  ('P-177', 'Meera Kumar', 37, 'Male', '+91 9810064064', 'O+', 'Emergency', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 23:59:42', '2026-10-02 09:44:42', 76, 97, '120/80', 99.4, 21, 'Patient assessed in Emergency triage.'),
  ('P-178', 'Arjun Wilson', 44, 'Female', '+91 9810064896', 'A+', 'ICU', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 23:14:42', '2026-10-03 09:44:42', 79, 98, '120/80', 98.4, 16, 'Patient assessed in ICU triage.'),
  ('P-179', 'Pooja Chopra', 51, 'Male', '+91 9810065728', 'B+', 'Cardiology', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 22:29:42', '2026-10-04 09:44:42', 82, 99, '120/80', 98.9, 17, 'Patient assessed in Cardiology triage.'),
  ('P-180', 'James Smith', 58, 'Female', '+91 9810066560', 'AB+', 'Neurology', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 21:44:42', '2026-10-01 09:44:42', 85, 95, '120/80', 99.4, 18, 'Patient assessed in Neurology triage.'),
  ('P-181', 'Emma Patel', 65, 'Male', '+91 9810067392', 'O-', 'Pediatrics', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 20:59:42', '2026-10-02 09:44:42', 88, 96, '120/80', 98.4, 19, 'Patient assessed in Pediatrics triage.'),
  ('P-182', 'Liam Johnson', 72, 'Female', '+91 9810068224', 'A-', 'General Medicine', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 20:14:42', '2026-10-03 09:44:42', 91, 97, '120/80', 98.9, 20, 'Patient assessed in General Medicine triage.'),
  ('P-183', 'Olivia Sharma', 79, 'Male', '+91 9810069056', 'B-', 'Orthopedics', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 19:29:42', '2026-10-04 09:44:42', 94, 98, '120/80', 99.4, 21, 'Patient assessed in Orthopedics triage.'),
  ('P-184', 'Noah Williams', 21, 'Female', '+91 9810069888', 'O+', 'Emergency', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 18:44:42', '2026-10-01 09:44:42', 97, 99, '120/80', 98.4, 16, 'Patient assessed in Emergency triage.'),
  ('P-185', 'Ava Verma', 28, 'Male', '+91 9810070720', 'A+', 'ICU', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 17:59:42', '2026-10-02 09:44:42', 100, 95, '120/80', 98.9, 17, 'Patient assessed in ICU triage.'),
  ('P-186', 'William Brown', 35, 'Female', '+91 9810071552', 'B+', 'Cardiology', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 17:14:42', '2026-10-03 09:44:42', 103, 96, '120/80', 99.4, 18, 'Patient assessed in Cardiology triage.'),
  ('P-187', 'Sophia Rao', 42, 'Male', '+91 9810072384', 'AB+', 'Neurology', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 16:29:42', '2026-10-04 09:44:42', 106, 97, '120/80', 98.4, 19, 'Patient assessed in Neurology triage.'),
  ('P-188', 'Benjamin Jones', 49, 'Female', '+91 9810073216', 'O-', 'Pediatrics', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 15:44:42', '2026-10-01 09:44:42', 109, 98, '120/80', 98.9, 20, 'Patient assessed in Pediatrics triage.'),
  ('P-189', 'Isabella Gupta', 56, 'Male', '+91 9810074048', 'A-', 'General Medicine', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 14:59:42', '2026-10-02 09:44:42', 112, 99, '120/80', 99.4, 21, 'Patient assessed in General Medicine triage.'),
  ('P-190', 'Aarav Miller', 63, 'Female', '+91 9810074880', 'B-', 'Orthopedics', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 14:14:42', '2026-10-03 09:44:42', 115, 95, '120/80', 98.4, 16, 'Patient assessed in Orthopedics triage.'),
  ('P-191', 'Priya Mehta', 70, 'Male', '+91 9810075712', 'O+', 'Emergency', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 13:29:42', '2026-10-04 09:44:42', 118, 96, '120/80', 98.9, 17, 'Patient assessed in Emergency triage.'),
  ('P-192', 'Rohan Davis', 77, 'Female', '+91 9810076544', 'A+', 'ICU', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 12:44:42', '2026-10-01 09:44:42', 66, 97, '120/80', 99.4, 18, 'Patient assessed in ICU triage.'),
  ('P-193', 'Ananya Kumar', 19, 'Male', '+91 9810077376', 'B+', 'Cardiology', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 11:59:42', '2026-10-02 09:44:42', 69, 98, '120/80', 98.4, 19, 'Patient assessed in Cardiology triage.'),
  ('P-194', 'Vikram Wilson', 26, 'Female', '+91 9810078208', 'AB+', 'Neurology', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 11:14:42', '2026-10-03 09:44:42', 72, 99, '120/80', 98.9, 20, 'Patient assessed in Neurology triage.'),
  ('P-195', 'Sneha Chopra', 33, 'Male', '+91 9810079040', 'O-', 'Pediatrics', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 10:29:42', '2026-10-04 09:44:42', 75, 95, '120/80', 99.4, 21, 'Patient assessed in Pediatrics triage.'),
  ('P-196', 'Kabir Smith', 40, 'Female', '+91 9810079872', 'A-', 'General Medicine', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 09:44:42', '2026-10-01 09:44:42', 78, 96, '120/80', 98.4, 16, 'Patient assessed in General Medicine triage.'),
  ('P-197', 'Meera Patel', 47, 'Male', '+91 9810080704', 'B-', 'Orthopedics', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 08:59:42', '2026-10-02 09:44:42', 81, 97, '120/80', 98.9, 17, 'Patient assessed in Orthopedics triage.'),
  ('P-198', 'Arjun Johnson', 54, 'Female', '+91 9810081536', 'O+', 'Emergency', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 08:14:42', '2026-10-03 09:44:42', 84, 98, '120/80', 99.4, 18, 'Patient assessed in Emergency triage.'),
  ('P-199', 'Pooja Sharma', 61, 'Male', '+91 9810082368', 'A+', 'ICU', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 07:29:42', '2026-10-04 09:44:42', 87, 99, '120/80', 98.4, 19, 'Patient assessed in ICU triage.'),
  ('P-200', 'James Williams', 68, 'Female', '+91 9810083200', 'B+', 'Cardiology', 'LOW', 'Waiting', NULL, NULL, '2026-09-27 06:44:42', '2026-10-01 09:44:42', 90, 95, '120/80', 98.9, 20, 'Patient assessed in Cardiology triage.'),
  ('P-1005', 'Rahul Verma (Demo Urgent)', 42, 'Male', '+91 9876543299', 'O+', 'Emergency', 'CRITICAL', 'Triage', NULL, NULL, '2026-09-30 09:44:42', NULL, 124, 86, '85/55', 99.2, 26, 'Severe dyspnea, acute hypoxemia, cardiac distress. Code Red standby.');

-- Insert Beds
INSERT INTO `beds` (`bed_id`, `ward_id`, `room_number`, `bed_type`, `status`, `patient_id`, `location`, `isolation_capable`, `equipment`, `last_updated`) VALUES
  ('ICU-01', 'WARD-ICU', '201', 'ICU', 'OCCUPIED', 'P-101', 'Floor 2, ICU Pod 1', TRUE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ICU-02', 'WARD-ICU', '202', 'ICU', 'OCCUPIED', 'P-102', 'Floor 2, ICU Pod 1', FALSE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ICU-03', 'WARD-ICU', '203', 'ICU', 'OCCUPIED', 'P-103', 'Floor 2, ICU Pod 2', FALSE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ICU-04', 'WARD-ICU', '204', 'ICU', 'OCCUPIED', 'P-104', 'Floor 2, ICU Pod 2', FALSE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ICU-05', 'WARD-ICU', '205', 'ICU', 'AVAILABLE', NULL, 'Floor 2, ICU Pod 3', TRUE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ICU-06', 'WARD-ICU', '206', 'ICU', 'OCCUPIED', 'P-106', 'Floor 2, ICU Pod 3', FALSE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ICU-07', 'WARD-ICU', '207', 'ICU', 'OCCUPIED', 'P-107', 'Floor 2, ICU Pod 4', FALSE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ICU-08', 'WARD-ICU', '208', 'ICU', 'AVAILABLE', NULL, 'Floor 2, ICU Pod 4', FALSE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ICU-09', 'WARD-ICU', '209', 'ICU', 'OCCUPIED', 'P-109', 'Floor 2, ICU Pod 5', FALSE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ICU-10', 'WARD-ICU', '2010', 'ICU', 'OCCUPIED', 'P-110', 'Floor 2, ICU Pod 5', FALSE, '["Ventilator","Patient Monitor","Infusion Pump","ECG"]', '2026-09-30 09:44:42'),
  ('ER-01', 'WARD-EMG', '101', 'Emergency', 'OCCUPIED', 'P-111', 'Floor 1, ER Bay 1', TRUE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('ER-02', 'WARD-EMG', '102', 'Emergency', 'AVAILABLE', NULL, 'Floor 1, ER Bay 2', FALSE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('ER-03', 'WARD-EMG', '103', 'Emergency', 'OCCUPIED', 'P-113', 'Floor 1, ER Bay 3', FALSE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('ER-04', 'WARD-EMG', '104', 'Emergency', 'OCCUPIED', 'P-114', 'Floor 1, ER Bay 4', FALSE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('ER-05', 'WARD-EMG', '105', 'Emergency', 'OCCUPIED', 'P-115', 'Floor 1, ER Bay 5', FALSE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('ER-06', 'WARD-EMG', '106', 'Emergency', 'OCCUPIED', 'P-116', 'Floor 1, ER Bay 6', FALSE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('ER-07', 'WARD-EMG', '107', 'Emergency', 'AVAILABLE', NULL, 'Floor 1, ER Bay 7', FALSE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('ER-08', 'WARD-EMG', '108', 'Emergency', 'OCCUPIED', 'P-118', 'Floor 1, ER Bay 8', FALSE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('ER-09', 'WARD-EMG', '109', 'Emergency', 'AVAILABLE', NULL, 'Floor 1, ER Bay 9', FALSE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('ER-10', 'WARD-EMG', '1010', 'Emergency', 'OCCUPIED', 'P-120', 'Floor 1, ER Bay 10', FALSE, '["Patient Monitor","Defibrillator"]', '2026-09-30 09:44:42'),
  ('GEN-01', 'WARD-GEN-A', '301', 'Standard', 'OCCUPIED', 'P-121', 'Floor 3, Room 1', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-02', 'WARD-GEN-A', '302', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 2', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-03', 'WARD-GEN-A', '303', 'Standard', 'OCCUPIED', 'P-123', 'Floor 3, Room 3', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-04', 'WARD-GEN-A', '304', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 4', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-05', 'WARD-GEN-A', '305', 'Standard', 'OCCUPIED', 'P-125', 'Floor 3, Room 5', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-06', 'WARD-GEN-A', '306', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 6', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-07', 'WARD-GEN-A', '307', 'Standard', 'OCCUPIED', 'P-127', 'Floor 3, Room 7', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-08', 'WARD-GEN-A', '308', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 8', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-09', 'WARD-GEN-A', '309', 'Standard', 'OCCUPIED', 'P-129', 'Floor 3, Room 9', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-10', 'WARD-GEN-A', '3010', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 10', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-11', 'WARD-GEN-B', '3011', 'Standard', 'OCCUPIED', 'P-131', 'Floor 3, Room 11', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-12', 'WARD-GEN-B', '3012', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 12', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-13', 'WARD-GEN-B', '3013', 'Standard', 'OCCUPIED', 'P-133', 'Floor 3, Room 13', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-14', 'WARD-GEN-B', '3014', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 14', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-15', 'WARD-GEN-B', '3015', 'Standard', 'OCCUPIED', 'P-135', 'Floor 3, Room 15', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-16', 'WARD-GEN-B', '3016', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 16', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-17', 'WARD-GEN-B', '3017', 'Standard', 'OCCUPIED', 'P-137', 'Floor 3, Room 17', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-18', 'WARD-GEN-B', '3018', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 18', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-19', 'WARD-GEN-B', '3019', 'Standard', 'OCCUPIED', 'P-139', 'Floor 3, Room 19', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('GEN-20', 'WARD-GEN-B', '3020', 'Standard', 'AVAILABLE', NULL, 'Floor 3, Room 20', FALSE, '["Patient Monitor"]', '2026-09-30 09:44:42'),
  ('SURG-01', 'WARD-SURG', '401', 'Recovery', 'OCCUPIED', 'P-141', 'Floor 4, Recovery 1', TRUE, '["Patient Monitor","Infusion Pump"]', '2026-09-30 09:44:42'),
  ('SURG-02', 'WARD-SURG', '402', 'Recovery', 'OCCUPIED', 'P-142', 'Floor 4, Recovery 2', TRUE, '["Patient Monitor","Infusion Pump"]', '2026-09-30 09:44:42'),
  ('SURG-03', 'WARD-SURG', '403', 'Recovery', 'OCCUPIED', 'P-143', 'Floor 4, Recovery 3', TRUE, '["Patient Monitor","Infusion Pump"]', '2026-09-30 09:44:42'),
  ('SURG-04', 'WARD-SURG', '404', 'Recovery', 'OCCUPIED', 'P-144', 'Floor 4, Recovery 4', TRUE, '["Patient Monitor","Infusion Pump"]', '2026-09-30 09:44:42'),
  ('SURG-05', 'WARD-SURG', '405', 'Recovery', 'OCCUPIED', 'P-145', 'Floor 4, Recovery 5', TRUE, '["Patient Monitor","Infusion Pump"]', '2026-09-30 09:44:42'),
  ('SURG-06', 'WARD-SURG', '406', 'Recovery', 'AVAILABLE', NULL, 'Floor 4, Recovery 6', TRUE, '["Patient Monitor","Infusion Pump"]', '2026-09-30 09:44:42'),
  ('SURG-07', 'WARD-SURG', '407', 'Recovery', 'AVAILABLE', NULL, 'Floor 4, Recovery 7', TRUE, '["Patient Monitor","Infusion Pump"]', '2026-09-30 09:44:42'),
  ('SURG-08', 'WARD-SURG', '408', 'Recovery', 'AVAILABLE', NULL, 'Floor 4, Recovery 8', TRUE, '["Patient Monitor","Infusion Pump"]', '2026-09-30 09:44:42');

-- Insert Equipment
INSERT INTO `equipment` (`equipment_id`, `type`, `name`, `status`, `current_location`, `department`, `maintenance_status`) VALUES
  ('V-01', 'Ventilator', 'Hamilton-G5 High-End Ventilator', 'IN_USE', 'ICU Floor 2', 'ICU', 'GOOD'),
  ('V-02', 'Ventilator', 'Hamilton-G5 High-End Ventilator', 'IN_USE', 'ICU Floor 2', 'ICU', 'GOOD'),
  ('V-03', 'Ventilator', 'Puritan Bennett 980', 'IN_USE', 'Emergency Ward', 'Emergency', 'GOOD'),
  ('V-04', 'Ventilator', 'Puritan Bennett 980 (Demo Ready)', 'AVAILABLE', 'Emergency Ward', 'Emergency', 'GOOD'),
  ('V-05', 'Ventilator', 'Maquet SERVO-u', 'AVAILABLE', 'Equipment Storage A', 'ICU', 'GOOD'),
  ('ECG-01', 'ECG', 'GE MAC 2000 12-Lead ECG', 'IN_USE', 'Cardiology OPD', 'Cardiology', 'GOOD'),
  ('ECG-02', 'ECG', 'Philips PageWriter TC70', 'AVAILABLE', 'Emergency Ward', 'Emergency', 'GOOD'),
  ('ECG-03', 'ECG', 'GE MAC 2000 12-Lead ECG', 'AVAILABLE', 'ICU Floor 2', 'ICU', 'GOOD'),
  ('MON-01', 'Patient Monitor', 'Philips IntelliVue MX750', 'IN_USE', 'ICU Floor 2', 'ICU', 'GOOD'),
  ('MON-02', 'Patient Monitor', 'Mindray BeneVision N17', 'AVAILABLE', 'Emergency Ward', 'Emergency', 'GOOD'),
  ('MON-03', 'Patient Monitor', 'Mindray BeneVision N17', 'AVAILABLE', 'Equipment Storage B', 'General', 'GOOD'),
  ('XRAY-M01', 'X-Ray', 'Carestream Mobile X-Ray unit', 'AVAILABLE', 'Diagnostics Block', 'Radiology', 'GOOD'),
  ('US-01', 'Ultrasound', 'GE Voluson E10 Ultrasound', 'IN_USE', 'Diagnostics Room 3', 'Radiology', 'GOOD'),
  ('US-02', 'Ultrasound', 'Philips Affiniti 70 Mobile', 'AVAILABLE', 'Emergency Bay', 'Emergency', 'GOOD'),
  ('PUMP-01', 'Infusion Pump', 'Alaris Infusion System', 'AVAILABLE', 'ICU Floor 2', 'ICU', 'GOOD'),
  ('PUMP-02', 'Infusion Pump', 'Alaris Infusion System', 'AVAILABLE', 'Emergency Ward', 'Emergency', 'GOOD'),
  ('PUMP-03', 'Infusion Pump', 'Baxter Sigma Spectrum', 'IN_USE', 'Surgical Recovery', 'Surgical', 'GOOD'),
  ('DEF-01', 'Defibrillator', 'ZOLL R Series Plus', 'AVAILABLE', 'Emergency Crash Cart 1', 'Emergency', 'GOOD'),
  ('DEF-02', 'Defibrillator', 'ZOLL R Series Plus', 'AVAILABLE', 'ICU Crash Cart', 'ICU', 'GOOD'),
  ('DEF-03', 'Defibrillator', 'Philips HeartStart XL+', 'MAINTENANCE', 'Bio-Med Workshop', 'Emergency', 'UNDER_REPAIR');

-- Insert Staff
INSERT INTO `staff` (`staff_id`, `name`, `role`, `specialization`, `department`, `status`, `workload`, `workload_score`, `current_location`, `emergency_eligible`, `skills`) VALUES
  ('DOC-01', 'Dr. Sarah Johnson', 'Doctor', 'Cardiologist', 'Cardiology', 'ON_DUTY', 'LOW', 25, 'Emergency Desk', TRUE, '["Advanced Cardiac Life Support","Angioplasty","Echo"]'),
  ('DOC-02', 'Dr. Michael Chen', 'Doctor', 'Neurologist', 'Neurology', 'ON_DUTY', 'MEDIUM', 55, 'NeuroCare Room 2', TRUE, '["Stroke Intervention","EEG","Neuro-Critical Care"]'),
  ('DOC-03', 'Dr. Emily Rodriguez', 'Doctor', 'Pediatrician', 'Pediatrics', 'ON_DUTY', 'LOW', 30, 'Pediatric Wing', TRUE, '["PALS","Neonatal Resuscitation"]'),
  ('DOC-04', 'Dr. James Wilson', 'Surgeon', 'Orthopedic Surgeon', 'Surgery', 'ON_DUTY', 'MEDIUM', 60, 'OT Floor 3', TRUE, '["Trauma Surgery","Arthroplasty"]'),
  ('DOC-05', 'Dr. Priya Sharma', 'Doctor', 'Critical Care Specialist', 'ICU', 'ON_DUTY', 'HIGH', 78, 'ICU Floor 2', TRUE, '["Intubation","Ventilator Management","Central Line"]'),
  ('DOC-06', 'Dr. Robert Brown', 'Doctor', 'General Physician', 'Emergency', 'ON_DUTY', 'MEDIUM', 50, 'ER Triage', TRUE, '["Emergency Medicine","Triage"]'),
  ('DOC-07', 'Dr. Lisa Wang', 'Surgeon', 'General Surgeon', 'Surgery', 'ON_CALL', 'LOW', 10, 'Doctors Lounge', TRUE, '["Emergency Laparotomy","Trauma"]'),
  ('DOC-08', 'Dr. David Kim', 'Anesthetist', 'Cardiac Anesthetist', 'Surgery', 'ON_DUTY', 'LOW', 35, 'OT Complex', TRUE, '["Cardiac Anesthesia","Airway Management"]'),
  ('N-07', 'Nurse Sarah Jenkins (N-07)', 'Nurse', 'ICU Critical Care', 'ICU', 'ON_DUTY', 'LOW', 20, 'ICU Station 1', TRUE, '["Vitals Monitoring","IV Cannulation","Emergency Drug Admin","Ventilator Suctioning"]'),
  ('N-12', 'Nurse Kevin Lee (N-12)', 'Nurse', 'Emergency Nursing', 'Emergency', 'ON_DUTY', 'MEDIUM', 45, 'Emergency Station', TRUE, '["Triage Support","IV Infusion","BLS"]'),
  ('TECH-01', 'Technician Rajesh Sharma', 'Technician', 'Radiology', 'Diagnostics', 'ON_DUTY', 'MEDIUM', 45, 'Diagnostics Floor G', TRUE, '["CT Scan Op","MRI Op","X-Ray Acquisition"]'),
  ('TECH-02', 'Technician Anita Roy', 'Technician', 'Pathology/Lab', 'Diagnostics', 'ON_DUTY', 'LOW', 30, 'Floor 1 Central Lab', TRUE, '["Rapid Blood Testing","Troponin Analyzer"]');

-- Insert Operating Theatres
INSERT INTO `operating_theatres` (`ot_id`, `name`, `type`, `status`, `current_procedure`, `assigned_surgeon`, `location`, `equipment`) VALUES
  ('OT-01', 'Cardiac Surgical Suite 1', 'Cardiac', 'OCCUPIED', 'CABG', 'Dr. James Wilson', 'Floor 4, West Wing', '["Bypass Machine","C-Arm","Anesthesia Workstation"]'),
  ('OT-02', 'Neuro Surgical Suite', 'Neuro', 'OCCUPIED', 'Craniotomy', 'Dr. Michael Chen', 'Floor 4, West Wing', '["Neuro-Navigation","Microscope"]'),
  ('OT-03', 'Orthopedic Suite 1', 'Orthopedic', 'RESERVED', 'Knee Replacement Prep', 'Dr. James Wilson', 'Floor 4, Central', '["Arthroscope","Fluoroscopy"]'),
  ('OT-04', 'Emergency Hybrid OT (Demo Ready)', 'Emergency', 'AVAILABLE', NULL, NULL, 'Floor 4, Immediate Elevator Access', '["C-Arm Fluoroscopy","Rapid Infuser","Anesthesia Workstation","Ventilator V-05"]'),
  ('OT-05', 'General Surgery Suite 1', 'General', 'AVAILABLE', NULL, NULL, 'Floor 4, East Wing', '["Laparoscopic Tower","Electrocautery"]'),
  ('OT-06', 'General Surgery Suite 2', 'General', 'OCCUPIED', 'Appendectomy', 'Dr. Lisa Wang', 'Floor 4, East Wing', '["Laparoscopic Tower"]'),
  ('OT-07', 'Maternity / C-Section OT', 'Maternity', 'AVAILABLE', NULL, NULL, 'Floor 3, Maternity', '["Infant Resuscitation","Ultrasound"]'),
  ('OT-08', 'Minor Day-Care OT', 'General', 'MAINTENANCE', NULL, NULL, 'Floor 4, Bio-Med Inspection', '[]');

-- Insert Diagnostic Resources
INSERT INTO `diagnostic_resources` (`resource_id`, `type`, `name`, `department`, `status`, `queue_length`, `average_wait_time`, `capacity`, `location`) VALUES
  ('DIAG-XR1', 'X-Ray', 'Digital X-Ray Suite 1', 'Radiology', 'BUSY', 7, 38, 40, 'Ground Floor Room G-12'),
  ('DIAG-XR2', 'X-Ray', 'Digital X-Ray Suite 2 (Fast-Track)', 'Radiology', 'AVAILABLE', 1, 6, 40, 'Ground Floor Room G-14'),
  ('DIAG-CT1', 'CT', '128-Slice Trauma CT Scanner', 'Radiology', 'BUSY', 4, 25, 25, 'Ground Floor Room G-18'),
  ('DIAG-MRI1', 'MRI', '3.0 Tesla High-Res MRI', 'Radiology', 'BUSY', 6, 45, 16, 'Basement 1, Room B-04'),
  ('DIAG-US1', 'Ultrasound', 'Doppler Ultrasound Room 1', 'Radiology', 'BUSY', 5, 20, 30, 'Ground Floor Room G-20'),
  ('DIAG-US2', 'Ultrasound', 'Point-of-Care Ultrasound 2', 'Radiology', 'AVAILABLE', 0, 4, 30, 'Emergency Annex G-02'),
  ('DIAG-LAB-CBC', 'Blood Lab', 'Automated Hematology Lab (CBC)', 'Pathology', 'BUSY', 12, 15, 150, 'Floor 1 Central Lab'),
  ('DIAG-LAB-BIO', 'Blood Lab', 'Biochemistry & Cardiac Markers (Troponin/LFT)', 'Pathology', 'AVAILABLE', 3, 8, 150, 'Floor 1 Stat Lab'),
  ('DIAG-ECG1', 'ECG', 'Emergency ECG Station', 'Cardiology', 'AVAILABLE', 1, 5, 60, 'Emergency Bay Room 04'),
  ('DIAG-ECHO1', 'ECG', 'Echocardiography Unit', 'Cardiology', 'BUSY', 3, 22, 20, 'Floor 2 Room 210'),
  ('DIAG-PATH1', 'Pathology', 'Rapid Histopathology Center', 'Pathology', 'AVAILABLE', 2, 30, 25, 'Floor 1 Room 115'),
  ('DIAG-PFT1', 'Pathology', 'Pulmonary Function Test Room', 'Pulmonology', 'MAINTENANCE', 0, 0, 15, 'Floor 2 Room 225');

-- Insert Doctors
INSERT INTO `doctors` (`mongo_id`, `name`, `email`, `password`, `specialization`, `image_url`, `experience`, `qualifications`, `location`, `about`, `fee`, `rating`, `success_rate`, `patients_count`) VALUES
  ('6a3820c82cecc9714b826111', 'Dr. Sarah Johnson', 'sarah@medicare.com', 'password123', 'Cardiologist', '/assets/HD1.png', '12 years', 'MBBS, MD (Cardiology)', 'City Hospital, Block A', 'Expert in heart rhythm, cardiac care, and coronary interventions.', 700, 4.9, '98%', '2k+'),
  ('6a3820c82cecc9714b826112', 'Dr. Michael Chen', 'michael@medicare.com', 'password123', 'Neurologist', '/assets/HD2.png', '15 years', 'MBBS, DM (Neurology)', 'NeuroCare Center, 2nd Floor', 'Expert in migraine, stroke, epilepsy and neuro disorders.', 900, 4.5, '89%', '1.8k+'),
  ('6a3820c82cecc9714b826113', 'Dr. Emily Rodriguez', 'emily@medicare.com', 'password123', 'Pediatrician', '/assets/HD3.png', '8 years', 'MBBS, DCH', 'Sunrise Pediatrics, Sector 12', 'Child specialist focusing on growth, nutrition, and immunity.', 500, 4.8, '97%', '3.2k+'),
  ('6a3820c82cecc9714b826114', 'Dr. James Wilson', 'james@medicare.com', 'password123', 'Orthopedic Surgeon', '/assets/HD4.png', '18 years', 'MBBS, MS (Orthopedics)', 'OrthoPlus Clinic', 'Joint replacement & sports injury expert.', 1200, 4.6, '92%', '1.5k+'),
  ('6a3820c82cecc9714b826115', 'Dr. Priya Sharma', 'priya@medicare.com', 'password123', 'Critical Care Specialist', '/assets/HD5.png', '10 years', 'MBBS, MD', 'ICU Floor 2', 'Critical care, intubation, ventilator management.', 600, 4.7, '94%', '2.7k+'),
  ('6a3820c82cecc9714b826116', 'Dr. Robert Brown', 'robert@medicare.com', 'password123', 'General Physician', '/assets/HD6.png', '20 years', 'MBBS, MD', 'ER Triage', 'Emergency medicine and general triage care.', 1100, 4.7, '91%', '4.1k+'),
  ('6a3820c82cecc9714b826117', 'Dr. Lisa Wang', 'lisa@medicare.com', 'password123', 'General Surgeon', '/assets/HD7.png', '14 years', 'MBBS, MS (Surgery)', 'Doctors Lounge', 'Emergency laparotomy and trauma surgery.', 800, 4.8, '95%', '2.5k+'),
  ('6a3820c82cecc9714b826118', 'Dr. David Kim', 'david@medicare.com', 'password123', 'Cardiac Anesthetist', '/assets/HD8.png', '11 years', 'MBBS, MD (Anesthesia)', 'OT Complex', 'Cardiac anesthesia and airway management.', 950, 4.8, '96%', '1.9k+');

-- Insert Services
INSERT INTO `services` (`mongo_id`, `name`, `about`, `short_description`, `price`, `available`, `image_url`, `instructions`) VALUES
  ('6a3820c92cecc9714b826125', 'Complete Blood Count (CBC)', 'Evaluates your overall health and detects a wide range of disorders, including anemia, infection, and leukemia.', 'Complete blood count diagnostic test.', 300, TRUE, '/assets/S1.png', '["Fasting is not required","Avoid heavy meals before the test","Inform doctor of medications"]'),
  ('6a3820c92cecc9714b826126', 'Lipid Profile', 'Measures the amount of cholesterol and other fats in your blood to assess cardiovascular risk.', 'Cholesterol and cardiovascular risk assessment.', 500, TRUE, '/assets/S2.png', '["10-12 hours fasting required","Only water is allowed during fasting","Avoid alcohol 24h prior"]'),
  ('6a3820c92cecc9714b826127', 'Thyroid Profile (T3, T4, TSH)', 'Assesses thyroid gland function and helps diagnose thyroid disorders like hypo/hyperthyroidism.', 'Thyroid gland function evaluation.', 600, TRUE, '/assets/S3.png', '["Morning sample preferred","Fasting is not mandatory"]'),
  ('6a3820c92cecc9714b826128', 'Liver Function Test (LFT)', 'Measures levels of proteins, liver enzymes, and bilirubin in your blood to evaluate liver health.', 'Liver health and enzyme levels evaluation.', 700, TRUE, '/assets/S4.png', '["Fasting preferred but not mandatory","Avoid alcohol 24 hours prior"]'),
  ('6a3820c92cecc9714b826129', 'Kidney Function Test (KFT)', 'Evaluates how well your kidneys are working by measuring urea, creatinine, and electrolytes.', 'Kidney performance and creatinine evaluation.', 800, TRUE, '/assets/S5.png', '["Drink plenty of water before the test","Fasting not required"]'),
  ('6a3820c92cecc9714b82612a', 'X-Ray Chest', 'Produces images of the heart, lungs, airways, blood vessels, and the bones of the spine and chest.', 'Chest and lungs imaging diagnostic.', 400, TRUE, '/assets/S6.png', '["Remove metal objects, jewelry before the test","Inform technician if pregnant"]'),
  ('6a3820c92cecc9714b82612b', 'Ultrasound Whole Abdomen', 'Uses sound waves to produce pictures of the organs within the abdomen, including liver, gallbladder, kidneys, spleen.', 'Abdominal organs ultrasound scan.', 1200, TRUE, '/assets/S7.png', '["Fasting of 6 hours required","Full bladder required for pelvic scan"]'),
  ('6a3820c92cecc9714b82612c', 'HbA1c (Glycated Haemoglobin)', 'Measures your average blood sugar levels over the past 3 months to monitor diabetes control.', 'Average blood sugar levels monitoring.', 450, TRUE, '/assets/S8.png', '["Fasting not required","Can be done at any time of day"]');

-- Insert Appointments
INSERT INTO `appointments` (`mongo_id`, `owner`, `created_by`, `patient_name`, `mobile`, `age`, `gender`, `doctor_mongo_id`, `doctor_name`, `speciality`, `date`, `time`, `fees`, `status`, `payment_method`, `payment_status`, `payment_amount`, `notes`) VALUES
  ('appt_sarah_01', 'major_admin_id', 'user_patient_p1001', 'Rahul Kumar', '9876543210', 38, 'Male', '6a3820c82cecc9714b826111', 'Dr. Sarah Johnson', 'Cardiologist', '2026-09-30', '09:30 AM', 700, 'Completed', 'Online', 'Paid', 700, 'Routine ECG & post-stress test consultation. Stable.'),
  ('appt_sarah_02', 'major_admin_id', 'user_patient_p1002', 'Priya Sharma', '9876543211', 29, 'Female', '6a3820c82cecc9714b826111', 'Dr. Sarah Johnson', 'Cardiologist', '2026-09-30', '10:30 AM', 700, 'Completed', 'Online', 'Paid', 700, 'Mild sinus tachycardia. Echo ordered, prescribed beta-blockers.'),
  ('appt_sarah_03', 'major_admin_id', 'user_patient_p1003', 'Arun Raj', '9876543212', 45, 'Male', '6a3820c82cecc9714b826111', 'Dr. Sarah Johnson', 'Cardiologist', '2026-09-30', '11:30 AM', 700, 'Confirmed', 'Online', 'Paid', 700, 'Post-angioplasty 3-month follow-up. Check stent patency.'),
  ('appt_sarah_04', 'major_admin_id', 'user_patient_p1004', 'Meena Devi', '9876543213', 52, 'Female', '6a3820c82cecc9714b826111', 'Dr. Sarah Johnson', 'Cardiologist', '2026-09-30', '02:00 PM', 700, 'Confirmed', 'Online', 'Paid', 700, 'Hypertension Stage 2 and exertional dyspnea. Lipid profile review.'),
  ('appt_sarah_05', 'major_admin_id', 'user_patient_p1006', 'Sunita Rao', '9876543215', 34, 'Female', '6a3820c82cecc9714b826111', 'Dr. Sarah Johnson', 'Cardiologist', '2026-09-30', '03:00 PM', 700, 'Pending', 'Cash', 'Pending', 700, 'Intermittent palpitations and dizziness.'),
  ('appt_sarah_06', 'major_admin_id', 'user_patient_p1007', 'David Miller', '9876543216', 62, 'Male', '6a3820c82cecc9714b826111', 'Dr. Sarah Johnson', 'Cardiologist', '2026-10-01', '10:00 AM', 700, 'Confirmed', 'Online', 'Paid', 700, 'Heart failure NYHA Class II management.'),
  ('appt_sarah_07', 'major_admin_id', 'user_patient_p1008', 'Ananya Patel', '9876543217', 26, 'Female', '6a3820c82cecc9714b826111', 'Dr. Sarah Johnson', 'Cardiologist', '2026-10-01', '11:30 AM', 700, 'Confirmed', 'Cash', 'Pending', 700, 'Holter monitor test interpretation.'),
  ('appt_chen_01', 'major_admin_id', 'user_patient_p1010', 'Rohan Gupta', '9876543220', 42, 'Male', '6a3820c82cecc9714b826112', 'Dr. Michael Chen', 'Neurologist', '2026-09-30', '10:00 AM', 900, 'Confirmed', 'Online', 'Paid', 900, 'Refractory migraine evaluation.'),
  ('appt_wang_01', 'major_admin_id', 'user_patient_p1012', 'Emma Wilson', '9876543230', 28, 'Female', '6a3820c82cecc9714b826117', 'Dr. Lisa Wang', 'Gynecologist', '2026-09-30', '09:00 AM', 800, 'Confirmed', 'Online', 'Paid', 800, 'Routine antenatal checkup - 24 weeks.');

-- Insert Emergency Events
INSERT INTO `emergency_events` (`emergency_id`, `patient_id`, `patient_name`, `severity`, `heart_rate`, `sp_o2`, `bp`, `temperature`, `respiratory_rate`, `required_resources`, `status`, `assigned_bed_id`, `assigned_doctor_id`, `assigned_doctor_name`, `assigned_nurse_id`, `assigned_nurse_name`, `assigned_equipment_ids`, `escalation_level`, `response_time_seconds`) VALUES
  ('EMG-2026-901', 'P-1005', 'Rahul Verma (Demo Urgent)', 'CRITICAL', 124, 86, '85/55', 99.2, 26, '["ICU Bed","Ventilator","Critical Care Specialist","Cardiac Nurse"]', 'ACTIVE', 'ICU-05', 'DOC-05', 'Dr. Priya Sharma', 'N-07', 'Nurse Sarah Jenkins (N-07)', '["V-04","ECG-02"]', 3, 42);

-- Insert Emergency Audit Logs
INSERT INTO `emergency_audit_logs` (`emergency_id`, `action`, `details`, `actor`) VALUES
  ('EMG-2026-901', 'CODE_RED_TRIGGERED', 'Critical triage score: SpO2 86%, BP 85/55', 'Nexus Voice Agent'),
  ('EMG-2026-901', 'BED_ALLOCATED', 'Reserved ICU Isolation Bed ICU-05', 'Nexus Bed Orchestrator'),
  ('EMG-2026-901', 'STAFF_DISPATCHED', 'Dispatched Dr. Priya Sharma and Nurse Sarah Jenkins', 'Nexus Staff Agent'),
  ('EMG-2026-901', 'EQUIPMENT_RESERVED', 'Puritan Bennett 980 (V-04) locked and en-route', 'Nexus Equipment Agent');

-- Insert Forecasts
INSERT INTO `forecasts` (`department`, `time_window`, `current_load`, `predicted_load`, `confidence`, `risk_level`, `recommended_actions`) VALUES
  ('Emergency', 'Current', 24, 24, 96, 'MEDIUM', '["Maintain 3 ER triage bays open","Keep fast-track ECG available"]'),
  ('Emergency', '1 Hour', 24, 30, 93, 'HIGH', '["Pre-alert on-call emergency physician","Stage 2 transport stretchers at triage"]'),
  ('Emergency', '2 Hours', 24, 38, 89, 'CRITICAL', '["Activate overflow protocol","Redirect non-urgent OPD cases to Clinic B","Deploy 2 additional nurses from General Ward"]'),
  ('Emergency', '4 Hours', 24, 51, 84, 'CRITICAL', '["Enact surge staffing plan","Expedite bed turnaround in General Ward A","Coordinate standby ventilators with ICU"]'),
  ('ICU', 'Current', 8, 8, 95, 'HIGH', '["ICU occupancy at 80% (8/10 beds). Monitor step-down discharges."]'),
  ('ICU', '2 Hours', 8, 10, 91, 'CRITICAL', '["Projected 100% ICU capacity. Expedite step-down transfer for P-ICU-02 to Surgical Recovery.","Reserve ICU-05 for emergent cardiac admission."]'),
  ('Diagnostics', 'Current', 18, 18, 94, 'MEDIUM', '["Route outpatient X-rays to Suite 2 to reduce Suite 1 queue."]'),
  ('Diagnostics', '2 Hours', 18, 28, 88, 'HIGH', '["Activate secondary CT scanner technician","Prioritize in-patient emergency ultrasound"]');

-- Insert Alerts
INSERT INTO `alerts` (`alert_id`, `type`, `severity`, `recipient_role`, `message`, `status`) VALUES
  ('ALT-101', 'BOTTLENECK', 'HIGH', 'OPERATIONS', 'Diagnostics: Digital X-Ray Suite 1 queue length exceeded 7 patients (38 min wait). Automated load-balancing recommended.', 'UNREAD'),
  ('ALT-102', 'BED_SHORTAGE', 'CRITICAL', 'ADMIN', 'ICU Capacity Alert: Only 2 ICU beds remaining. Predictive model forecasts +2 admissions within 120 minutes.', 'UNREAD'),
  ('ALT-103', 'STAFF_OVERLOAD', 'MEDIUM', 'DOCTOR', 'Staff Workload Warning: Dr. Priya Sharma workload score is at 78% (HIGH). Next shift rotation in 90 min.', 'UNREAD');

-- Insert RTLS Locations
INSERT INTO `rtls_locations` (`resource_id`, `resource_type`, `resource_name`, `location`, `x`, `y`, `floor`, `battery_level`, `status`) VALUES
  ('DOC-01', 'Doctor', 'Dr. Sarah Johnson (Cardiology)', 'Emergency', 28, 35, 1, 98, 'ACTIVE'),
  ('DOC-02', 'Doctor', 'Dr. Michael Chen (Neurology)', 'OPD', 75, 25, 1, 92, 'ACTIVE'),
  ('DOC-05', 'Doctor', 'Dr. Priya Sharma (ICU Specialist)', 'ICU', 42, 70, 2, 88, 'ACTIVE'),
  ('N-07', 'Nurse', 'Nurse Sarah Jenkins (N-07)', 'ICU', 50, 75, 2, 95, 'ACTIVE'),
  ('N-12', 'Nurse', 'Nurse Kevin Lee (N-12)', 'Emergency', 20, 40, 1, 84, 'ACTIVE'),
  ('V-04', 'Ventilator', 'Puritan Bennett 980 (V-04)', 'Emergency', 25, 48, 1, 100, 'READY'),
  ('V-05', 'Ventilator', 'Maquet SERVO-u (V-05)', 'ICU', 58, 68, 2, 90, 'READY'),
  ('ECG-02', 'ECG', 'Philips PageWriter (ECG-02)', 'Emergency', 32, 42, 1, 94, 'READY'),
  ('WHEEL-01', 'Wheelchair', 'Smart Transporter W-01', 'Emergency', 15, 30, 1, 85, 'ACTIVE'),
  ('P-104', 'Patient', 'Emergency Patient P-104', 'Emergency', 22, 38, 1, 100, 'CRITICAL');

-- =====================================================================
-- VERIFICATION QUERIES (Run these in Workbench to confirm setup)
-- =====================================================================
SELECT 'Wards' AS `Table`, COUNT(*) AS `Rows` FROM `wards`
UNION ALL
SELECT 'Beds', COUNT(*) FROM `beds`
UNION ALL
SELECT 'Equipment', COUNT(*) FROM `equipment`
UNION ALL
SELECT 'Staff', COUNT(*) FROM `staff`
UNION ALL
SELECT 'Operating Theatres', COUNT(*) FROM `operating_theatres`
UNION ALL
SELECT 'Diagnostic Resources', COUNT(*) FROM `diagnostic_resources`
UNION ALL
SELECT 'Patients', COUNT(*) FROM `patients`
UNION ALL
SELECT 'Doctors', COUNT(*) FROM `doctors`
UNION ALL
SELECT 'Appointments', COUNT(*) FROM `appointments`
UNION ALL
SELECT 'Services', COUNT(*) FROM `services`
UNION ALL
SELECT 'Emergency Events', COUNT(*) FROM `emergency_events`
UNION ALL
SELECT 'Forecasts', COUNT(*) FROM `forecasts`
UNION ALL
SELECT 'Alerts', COUNT(*) FROM `alerts`
UNION ALL
SELECT 'RTLS Locations', COUNT(*) FROM `rtls_locations`;
