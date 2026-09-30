// database/generate_sql.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mockAppointments } from "../backend/utils/mockDb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSql(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return val.toString();
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

let sql = `-- =====================================================================
-- MEDICARE NEXUS — RELATIONAL DATABASE SCHEMA & COMPLETE SEED DATA
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench / MariaDB 10.3+
-- Generated for MediCare Nexus: Autonomous Hospital Resource Orchestration
-- =====================================================================

-- Step 1: Database Setup
CREATE DATABASE IF NOT EXISTS \`medicare_nexus\`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE \`medicare_nexus\`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- TABLE 1: wards
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`wards\`;
CREATE TABLE \`wards\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`ward_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`type\` ENUM('ICU', 'Emergency', 'General', 'Surgical', 'Pediatric', 'Cardiology') NOT NULL,
  \`floor\` INT DEFAULT 1,
  \`total_beds\` INT DEFAULT 10,
  \`available_beds\` INT DEFAULT 5,
  \`occupied_beds\` INT DEFAULT 5,
  \`location\` VARCHAR(150) DEFAULT 'Wing A',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_ward_type\` (\`type\`),
  INDEX \`idx_ward_floor\` (\`floor\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 2: beds
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`beds\`;
CREATE TABLE \`beds\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`bed_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`ward_id\` VARCHAR(50) NOT NULL,
  \`room_number\` VARCHAR(50) NOT NULL,
  \`bed_type\` ENUM('ICU', 'Standard', 'Isolation', 'Emergency', 'Pediatric', 'Recovery') DEFAULT 'Standard',
  \`status\` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE') DEFAULT 'AVAILABLE',
  \`patient_id\` VARCHAR(50) DEFAULT NULL,
  \`location\` VARCHAR(150) DEFAULT 'Floor 1, Room 101',
  \`isolation_capable\` BOOLEAN DEFAULT FALSE,
  \`equipment\` JSON DEFAULT NULL,
  \`last_updated\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_bed_ward\` (\`ward_id\`),
  INDEX \`idx_bed_status\` (\`status\`),
  INDEX \`idx_bed_type\` (\`bed_type\`),
  INDEX \`idx_bed_patient\` (\`patient_id\`),
  CONSTRAINT \`fk_bed_ward\` FOREIGN KEY (\`ward_id\`) REFERENCES \`wards\` (\`ward_id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 3: equipment
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`equipment\`;
CREATE TABLE \`equipment\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`equipment_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`type\` ENUM('Ventilator', 'ECG', 'Patient Monitor', 'X-Ray', 'Ultrasound', 'CT', 'MRI', 'Infusion Pump', 'Defibrillator') NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`status\` ENUM('AVAILABLE', 'IN_USE', 'RESERVED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
  \`current_location\` VARCHAR(150) DEFAULT 'Equipment Storage A',
  \`assigned_patient\` VARCHAR(50) DEFAULT NULL,
  \`department\` VARCHAR(100) DEFAULT 'Emergency',
  \`maintenance_status\` ENUM('GOOD', 'SERVICE_DUE', 'UNDER_REPAIR') DEFAULT 'GOOD',
  \`last_updated\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_equipment_type\` (\`type\`),
  INDEX \`idx_equipment_status\` (\`status\`),
  INDEX \`idx_equipment_department\` (\`department\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 4: staff
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`staff\`;
CREATE TABLE \`staff\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`staff_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`role\` ENUM('Doctor', 'Nurse', 'Technician', 'Surgeon', 'Anesthetist', 'Support Staff') NOT NULL,
  \`specialization\` VARCHAR(150) DEFAULT 'General',
  \`department\` VARCHAR(100) DEFAULT 'Emergency',
  \`shift_start\` VARCHAR(20) DEFAULT '08:00',
  \`shift_end\` VARCHAR(20) DEFAULT '20:00',
  \`status\` ENUM('ON_DUTY', 'OFF_DUTY', 'ON_CALL', 'IN_SURGERY', 'BREAK') DEFAULT 'ON_DUTY',
  \`workload\` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
  \`workload_score\` INT DEFAULT 20,
  \`current_location\` VARCHAR(150) DEFAULT 'Emergency Desk',
  \`assigned_patients\` JSON DEFAULT NULL,
  \`skills\` JSON DEFAULT NULL,
  \`emergency_eligible\` BOOLEAN DEFAULT TRUE,
  \`contact\` VARCHAR(50) DEFAULT '',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_staff_role\` (\`role\`),
  INDEX \`idx_staff_dept\` (\`department\`),
  INDEX \`idx_staff_status\` (\`status\`),
  INDEX \`idx_staff_workload\` (\`workload\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 5: operating_theatres
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`operating_theatres\`;
CREATE TABLE \`operating_theatres\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`ot_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`type\` ENUM('General', 'Cardiac', 'Orthopedic', 'Neuro', 'Emergency', 'Maternity') DEFAULT 'General',
  \`status\` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
  \`current_procedure\` VARCHAR(150) DEFAULT NULL,
  \`assigned_surgeon\` VARCHAR(150) DEFAULT NULL,
  \`anesthetist\` VARCHAR(150) DEFAULT NULL,
  \`assigned_nurses\` JSON DEFAULT NULL,
  \`available_from\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`equipment\` JSON DEFAULT NULL,
  \`location\` VARCHAR(150) DEFAULT 'Surgical Wing, 3rd Floor',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_ot_type\` (\`type\`),
  INDEX \`idx_ot_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 6: diagnostic_resources
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`diagnostic_resources\`;
CREATE TABLE \`diagnostic_resources\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`resource_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`type\` ENUM('X-Ray', 'MRI', 'CT', 'Ultrasound', 'Blood Lab', 'ECG', 'Pathology') NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`department\` VARCHAR(100) DEFAULT 'Radiology',
  \`status\` ENUM('AVAILABLE', 'BUSY', 'MAINTENANCE') DEFAULT 'AVAILABLE',
  \`queue_length\` INT DEFAULT 0,
  \`average_wait_time\` INT DEFAULT 10,
  \`current_patient\` VARCHAR(50) DEFAULT NULL,
  \`capacity\` INT DEFAULT 20,
  \`location\` VARCHAR(150) DEFAULT 'Diagnostic Block Ground Floor',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_diag_type\` (\`type\`),
  INDEX \`idx_diag_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 7: patients
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`patients\`;
CREATE TABLE \`patients\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`patient_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`age\` INT NOT NULL,
  \`gender\` ENUM('Male', 'Female', 'Other') NOT NULL,
  \`contact\` VARCHAR(50) DEFAULT '',
  \`blood_group\` VARCHAR(10) DEFAULT 'O+',
  \`department\` VARCHAR(100) DEFAULT 'Emergency',
  \`acuity\` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
  \`current_status\` ENUM('Waiting', 'Triage', 'Doctor', 'Diagnostic', 'In-Surgery', 'Admitted', 'Discharged') DEFAULT 'Waiting',
  \`current_ward\` VARCHAR(50) DEFAULT NULL,
  \`current_bed\` VARCHAR(50) DEFAULT NULL,
  \`admission_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`discharge_estimate\` TIMESTAMP NULL DEFAULT NULL,
  \`heart_rate\` INT DEFAULT 75,
  \`sp_o2\` INT DEFAULT 98,
  \`bp\` VARCHAR(20) DEFAULT '120/80',
  \`temperature\` DECIMAL(4,1) DEFAULT 98.6,
  \`respiratory_rate\` INT DEFAULT 16,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_patient_acuity\` (\`acuity\`),
  INDEX \`idx_patient_status\` (\`current_status\`),
  INDEX \`idx_patient_dept\` (\`department\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 8: doctors
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`doctors\`;
CREATE TABLE \`doctors\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`mongo_id\` VARCHAR(50) UNIQUE DEFAULT NULL,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`specialization\` VARCHAR(150) DEFAULT '',
  \`image_url\` VARCHAR(255) DEFAULT NULL,
  \`experience\` VARCHAR(50) DEFAULT '',
  \`qualifications\` VARCHAR(150) DEFAULT '',
  \`location\` VARCHAR(150) DEFAULT '',
  \`about\` TEXT DEFAULT NULL,
  \`fee\` DECIMAL(10,2) DEFAULT 0.00,
  \`availability\` ENUM('Available', 'Unavailable') DEFAULT 'Available',
  \`rating\` DECIMAL(3,2) DEFAULT 0.00,
  \`success_rate\` VARCHAR(20) DEFAULT '',
  \`patients_count\` VARCHAR(20) DEFAULT '',
  \`schedule\` JSON DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_doctor_specialization\` (\`specialization\`),
  INDEX \`idx_doctor_availability\` (\`availability\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 9: appointments
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`appointments\`;
CREATE TABLE \`appointments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`mongo_id\` VARCHAR(50) UNIQUE DEFAULT NULL,
  \`owner\` VARCHAR(100) NOT NULL DEFAULT 'major_admin_id',
  \`created_by\` VARCHAR(100) DEFAULT NULL,
  \`patient_name\` VARCHAR(150) NOT NULL,
  \`mobile\` VARCHAR(50) NOT NULL,
  \`age\` INT DEFAULT NULL,
  \`gender\` VARCHAR(20) DEFAULT '',
  \`doctor_mongo_id\` VARCHAR(50) NOT NULL,
  \`doctor_name\` VARCHAR(150) DEFAULT '',
  \`speciality\` VARCHAR(150) DEFAULT '',
  \`date\` VARCHAR(20) NOT NULL,
  \`time\` VARCHAR(20) NOT NULL,
  \`fees\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('Pending', 'Confirmed', 'Completed', 'Canceled', 'Rescheduled') DEFAULT 'Pending',
  \`rescheduled_date\` VARCHAR(20) DEFAULT NULL,
  \`rescheduled_time\` VARCHAR(20) DEFAULT NULL,
  \`payment_method\` ENUM('Cash', 'Online') DEFAULT 'Cash',
  \`payment_status\` ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
  \`payment_amount\` DECIMAL(10,2) DEFAULT 0.00,
  \`payment_provider_id\` VARCHAR(100) DEFAULT '',
  \`paid_at\` TIMESTAMP NULL DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_appt_date\` (\`date\`),
  INDEX \`idx_appt_status\` (\`status\`),
  INDEX \`idx_appt_doctor\` (\`doctor_mongo_id\`),
  INDEX \`idx_appt_created_by\` (\`created_by\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 10: services
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`services\`;
CREATE TABLE \`services\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`mongo_id\` VARCHAR(50) UNIQUE DEFAULT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`about\` TEXT DEFAULT NULL,
  \`short_description\` VARCHAR(255) DEFAULT '',
  \`price\` DECIMAL(10,2) DEFAULT 0.00,
  \`available\` BOOLEAN DEFAULT TRUE,
  \`image_url\` VARCHAR(255) DEFAULT NULL,
  \`instructions\` JSON DEFAULT NULL,
  \`dates\` JSON DEFAULT NULL,
  \`slots\` JSON DEFAULT NULL,
  \`total_appointments\` INT DEFAULT 0,
  \`completed\` INT DEFAULT 0,
  \`canceled\` INT DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_service_available\` (\`available\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 11: service_appointments
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`service_appointments\`;
CREATE TABLE \`service_appointments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`mongo_id\` VARCHAR(50) UNIQUE DEFAULT NULL,
  \`created_by\` VARCHAR(100) DEFAULT NULL,
  \`patient_name\` VARCHAR(150) NOT NULL,
  \`mobile\` VARCHAR(50) NOT NULL,
  \`age\` INT DEFAULT NULL,
  \`gender\` VARCHAR(20) DEFAULT '',
  \`service_mongo_id\` VARCHAR(50) NOT NULL,
  \`service_name\` VARCHAR(150) NOT NULL,
  \`fees\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`date\` VARCHAR(20) NOT NULL,
  \`hour\` INT NOT NULL,
  \`minute\` INT NOT NULL,
  \`ampm\` ENUM('AM', 'PM') NOT NULL,
  \`status\` ENUM('Pending', 'Confirmed', 'Rescheduled', 'Completed', 'Canceled') DEFAULT 'Pending',
  \`payment_method\` ENUM('Cash', 'Online') DEFAULT 'Cash',
  \`payment_status\` ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
  \`payment_amount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`paid_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_serv_appt_date\` (\`date\`),
  INDEX \`idx_serv_appt_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 12: patient_queues
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`patient_queues\`;
CREATE TABLE \`patient_queues\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`queue_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`patient_id\` VARCHAR(50) NOT NULL,
  \`department\` VARCHAR(100) NOT NULL,
  \`priority\` ENUM('P1-Emergency', 'P2-Urgent', 'P3-Standard', 'P4-Routine') DEFAULT 'P3-Standard',
  \`waiting_since\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`estimated_service_time\` TIMESTAMP NULL DEFAULT NULL,
  \`status\` ENUM('WAITING', 'IN_SERVICE', 'COMPLETED', 'CANCELLED') DEFAULT 'WAITING',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_queue_dept\` (\`department\`),
  INDEX \`idx_queue_status\` (\`status\`),
  INDEX \`idx_queue_priority\` (\`priority\`),
  CONSTRAINT \`fk_queue_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`patient_id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 13: emergency_events
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`emergency_events\`;
CREATE TABLE \`emergency_events\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`emergency_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`patient_id\` VARCHAR(50) NOT NULL,
  \`patient_name\` VARCHAR(150) DEFAULT 'Emergency Patient',
  \`severity\` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
  \`heart_rate\` INT DEFAULT 120,
  \`sp_o2\` INT DEFAULT 88,
  \`bp\` VARCHAR(20) DEFAULT '90/60',
  \`temperature\` DECIMAL(4,1) DEFAULT 99.1,
  \`respiratory_rate\` INT DEFAULT 24,
  \`required_resources\` JSON DEFAULT NULL,
  \`status\` ENUM('ACTIVE', 'CONTAINED', 'ESCALATED', 'RESOLVED') DEFAULT 'ACTIVE',
  \`assigned_bed_id\` VARCHAR(50) DEFAULT NULL,
  \`assigned_doctor_id\` VARCHAR(50) DEFAULT NULL,
  \`assigned_doctor_name\` VARCHAR(150) DEFAULT NULL,
  \`assigned_nurse_id\` VARCHAR(50) DEFAULT NULL,
  \`assigned_nurse_name\` VARCHAR(150) DEFAULT NULL,
  \`assigned_equipment_ids\` JSON DEFAULT NULL,
  \`assigned_ot_id\` VARCHAR(50) DEFAULT NULL,
  \`assigned_diagnostic_id\` VARCHAR(50) DEFAULT NULL,
  \`escalation_level\` INT DEFAULT 1,
  \`response_time_seconds\` INT DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_emg_severity\` (\`severity\`),
  INDEX \`idx_emg_status\` (\`status\`),
  INDEX \`idx_emg_patient\` (\`patient_id\`),
  CONSTRAINT \`fk_emg_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`patient_id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 14: emergency_audit_logs
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`emergency_audit_logs\`;
CREATE TABLE \`emergency_audit_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`emergency_id\` VARCHAR(50) NOT NULL,
  \`timestamp\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`action\` VARCHAR(150) NOT NULL,
  \`details\` TEXT DEFAULT NULL,
  \`actor\` VARCHAR(100) DEFAULT 'Nexus Orchestrator',
  INDEX \`idx_audit_emg\` (\`emergency_id\`),
  CONSTRAINT \`fk_audit_emg\` FOREIGN KEY (\`emergency_id\`) REFERENCES \`emergency_events\` (\`emergency_id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 15: resource_assignments
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`resource_assignments\`;
CREATE TABLE \`resource_assignments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`assignment_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`patient_id\` VARCHAR(50) NOT NULL,
  \`emergency_id\` VARCHAR(50) DEFAULT NULL,
  \`bed_id\` VARCHAR(50) DEFAULT NULL,
  \`doctor_id\` VARCHAR(50) DEFAULT NULL,
  \`nurse_id\` VARCHAR(50) DEFAULT NULL,
  \`equipment_ids\` JSON DEFAULT NULL,
  \`diagnostic_resource_id\` VARCHAR(50) DEFAULT NULL,
  \`ot_id\` VARCHAR(50) DEFAULT NULL,
  \`allocation_score\` INT DEFAULT 85,
  \`allocation_reason\` JSON DEFAULT NULL,
  \`status\` ENUM('ACTIVE', 'REALLOCATED', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  \`conflict_detected\` BOOLEAN DEFAULT FALSE,
  \`reallocation_reason\` VARCHAR(255) DEFAULT NULL,
  \`assigned_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_assign_patient\` (\`patient_id\`),
  INDEX \`idx_assign_status\` (\`status\`),
  CONSTRAINT \`fk_assign_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`patient_id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 16: forecasts
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`forecasts\`;
CREATE TABLE \`forecasts\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`department\` ENUM('Emergency', 'ICU', 'General Ward', 'Diagnostics', 'Operating Theatre') NOT NULL,
  \`time_window\` ENUM('Current', '1 Hour', '2 Hours', '4 Hours') NOT NULL,
  \`current_load\` INT NOT NULL,
  \`predicted_load\` INT NOT NULL,
  \`confidence\` INT DEFAULT 92,
  \`risk_level\` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  \`recommended_actions\` JSON DEFAULT NULL,
  \`generated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_forecast_dept\` (\`department\`),
  INDEX \`idx_forecast_risk\` (\`risk_level\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 17: alerts
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`alerts\`;
CREATE TABLE \`alerts\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`alert_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`type\` ENUM('EMERGENCY', 'BOTTLENECK', 'STAFF_OVERLOAD', 'BED_SHORTAGE', 'REALLOCATION', 'MAINTENANCE', 'SYSTEM') NOT NULL,
  \`severity\` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'INFO') DEFAULT 'MEDIUM',
  \`recipient_role\` ENUM('ADMIN', 'DOCTOR', 'NURSE', 'OPERATIONS', 'TECHNICIAN', 'ALL') DEFAULT 'ALL',
  \`recipient_id\` VARCHAR(50) DEFAULT NULL,
  \`message\` TEXT NOT NULL,
  \`status\` ENUM('UNREAD', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'UNREAD',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_alert_type\` (\`type\`),
  INDEX \`idx_alert_severity\` (\`severity\`),
  INDEX \`idx_alert_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE 18: rtls_locations
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`rtls_locations\`;
CREATE TABLE \`rtls_locations\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`resource_id\` VARCHAR(50) NOT NULL UNIQUE,
  \`resource_type\` ENUM('Doctor', 'Nurse', 'Ventilator', 'ECG', 'Wheelchair', 'Patient', 'Monitor') NOT NULL,
  \`resource_name\` VARCHAR(150) NOT NULL,
  \`location\` ENUM('Emergency', 'ICU', 'General Ward A', 'General Ward B', 'Operating Theatre', 'Diagnostics', 'OPD', 'Pharmacy') NOT NULL,
  \`x\` DECIMAL(5,2) DEFAULT 50.00,
  \`y\` DECIMAL(5,2) DEFAULT 50.00,
  \`floor\` INT DEFAULT 1,
  \`battery_level\` INT DEFAULT 95,
  \`status\` VARCHAR(50) DEFAULT 'ACTIVE',
  \`last_timestamp\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_rtls_res_type\` (\`resource_type\`),
  INDEX \`idx_rtls_location\` (\`location\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- STEP 2: COMPLETE DEMO SEED DATA INSERTION
-- =====================================================================

`;

// 1. Wards
const wards = [
  { wardId: "WARD-ICU", name: "Intensive Care Unit (ICU)", type: "ICU", floor: 2, totalBeds: 10, availableBeds: 2, occupiedBeds: 8, location: "Floor 2, Wing A" },
  { wardId: "WARD-EMG", name: "Emergency Department", type: "Emergency", floor: 1, totalBeds: 10, availableBeds: 3, occupiedBeds: 7, location: "Floor 1, West Entrance" },
  { wardId: "WARD-GEN-A", name: "General Ward A", type: "General", floor: 3, totalBeds: 10, availableBeds: 4, occupiedBeds: 6, location: "Floor 3, East Wing" },
  { wardId: "WARD-GEN-B", name: "General Ward B", type: "General", floor: 3, totalBeds: 10, availableBeds: 5, occupiedBeds: 5, location: "Floor 3, West Wing" },
  { wardId: "WARD-SURG", name: "Surgical Recovery Ward", type: "Surgical", floor: 4, totalBeds: 8, availableBeds: 3, occupiedBeds: 5, location: "Floor 4, North Wing" }
];

sql += `-- Insert Wards\nINSERT INTO \`wards\` (\`ward_id\`, \`name\`, \`type\`, \`floor\`, \`total_beds\`, \`available_beds\`, \`occupied_beds\`, \`location\`) VALUES\n`;
sql += wards.map(w => `  (${escapeSql(w.wardId)}, ${escapeSql(w.name)}, ${escapeSql(w.type)}, ${w.floor}, ${w.totalBeds}, ${w.availableBeds}, ${w.occupiedBeds}, ${escapeSql(w.location)})`).join(",\n") + ";\n\n";

// 2. Patients (100 patients)
const firstNames = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "Benjamin", "Isabella", "Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Kabir", "Meera", "Arjun", "Pooja"];
const lastNames = ["Smith", "Patel", "Johnson", "Sharma", "Williams", "Verma", "Brown", "Rao", "Jones", "Gupta", "Miller", "Mehta", "Davis", "Kumar", "Wilson", "Chopra"];
const bloods = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-"];
const departments = ["Emergency", "ICU", "Cardiology", "Neurology", "Pediatrics", "General Medicine", "Orthopedics"];

const patients = [];
for (let i = 1; i <= 100; i++) {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const acuity = i <= 6 ? "CRITICAL" : i <= 25 ? "HIGH" : i <= 65 ? "MEDIUM" : "LOW";
  const status = i <= 15 ? "Admitted" : i <= 30 ? "Doctor" : i <= 55 ? "Diagnostic" : i <= 75 ? "Triage" : "Waiting";
  const pId = `P-${String(100 + i)}`;
  patients.push({
    patientId: pId,
    name: `${fn} ${ln}`,
    age: 18 + (i * 7) % 65,
    gender: i % 2 === 0 ? "Female" : "Male",
    contact: `+91 98${String(10000000 + i * 832).slice(0, 8)}`,
    bloodGroup: bloods[i % bloods.length],
    department: departments[i % departments.length],
    acuity,
    currentStatus: status,
    currentWard: status === "Admitted" ? (acuity === "CRITICAL" ? "WARD-ICU" : "WARD-GEN-A") : null,
    currentBed: status === "Admitted" ? (acuity === "CRITICAL" ? `ICU-${String((i % 8) + 1).padStart(2, "0")}` : `GEN-${String((i % 10) + 1).padStart(2, "0")}`) : null,
    admissionTime: new Date(Date.now() - (i * 45) * 60000),
    dischargeEstimate: new Date(Date.now() + ((i % 4) + 1) * 86400000),
    heartRate: 65 + (i * 3) % 55,
    spO2: acuity === "CRITICAL" ? 82 + (i % 6) : 95 + (i % 5),
    bp: acuity === "CRITICAL" ? "85/55" : "120/80",
    temperature: 98.4 + (i % 3) * 0.5,
    respiratoryRate: acuity === "CRITICAL" ? 26 : 16 + (i % 6),
    notes: `Patient assessed in ${departments[i % departments.length]} triage.`
  });
}

// Special emergency patient P-104 & P-1005 for workflows
patients.push({
  patientId: "P-1005",
  name: "Rahul Verma (Demo Urgent)",
  age: 42,
  gender: "Male",
  contact: "+91 9876543299",
  bloodGroup: "O+",
  department: "Emergency",
  acuity: "CRITICAL",
  currentStatus: "Triage",
  currentWard: null,
  currentBed: null,
  admissionTime: new Date(),
  dischargeEstimate: null,
  heartRate: 124,
  spO2: 86,
  bp: "85/55",
  temperature: 99.2,
  respiratoryRate: 26,
  notes: "Severe dyspnea, acute hypoxemia, cardiac distress. Code Red standby."
});

sql += `-- Insert Patients\nINSERT INTO \`patients\` (\`patient_id\`, \`name\`, \`age\`, \`gender\`, \`contact\`, \`blood_group\`, \`department\`, \`acuity\`, \`current_status\`, \`current_ward\`, \`current_bed\`, \`admission_time\`, \`discharge_estimate\`, \`heart_rate\`, \`sp_o2\`, \`bp\`, \`temperature\`, \`respiratory_rate\`, \`notes\`) VALUES\n`;
sql += patients.map(p => `  (${escapeSql(p.patientId)}, ${escapeSql(p.name)}, ${p.age}, ${escapeSql(p.gender)}, ${escapeSql(p.contact)}, ${escapeSql(p.bloodGroup)}, ${escapeSql(p.department)}, ${escapeSql(p.acuity)}, ${escapeSql(p.currentStatus)}, ${escapeSql(p.currentWard)}, ${escapeSql(p.currentBed)}, ${escapeSql(p.admissionTime)}, ${escapeSql(p.dischargeEstimate)}, ${p.heartRate}, ${p.spO2}, ${escapeSql(p.bp)}, ${p.temperature}, ${p.respiratoryRate}, ${escapeSql(p.notes)})`).join(",\n") + ";\n\n";

// 3. Beds (48 beds)
const beds = [];
// ICU Beds
for (let i = 1; i <= 10; i++) {
  const bedId = `ICU-${String(i).padStart(2, "0")}`;
  const isAvail = i === 5 || i === 8;
  beds.push({
    bedId,
    wardId: "WARD-ICU",
    roomNumber: `20${i}`,
    bedType: "ICU",
    status: isAvail ? "AVAILABLE" : "OCCUPIED",
    patientId: isAvail ? null : `P-${100 + i}`,
    location: `Floor 2, ICU Pod ${Math.ceil(i / 2)}`,
    isolationCapable: i === 1 || i === 5,
    equipment: ["Ventilator", "Patient Monitor", "Infusion Pump", "ECG"],
    lastUpdated: new Date()
  });
}
// ER Beds
for (let i = 1; i <= 10; i++) {
  const bedId = `ER-${String(i).padStart(2, "0")}`;
  const isAvail = i === 2 || i === 7 || i === 9;
  beds.push({
    bedId,
    wardId: "WARD-EMG",
    roomNumber: `10${i}`,
    bedType: "Emergency",
    status: isAvail ? "AVAILABLE" : "OCCUPIED",
    patientId: isAvail ? null : `P-${110 + i}`,
    location: `Floor 1, ER Bay ${i}`,
    isolationCapable: i === 1,
    equipment: ["Patient Monitor", "Defibrillator"],
    lastUpdated: new Date()
  });
}
// General Beds
for (let i = 1; i <= 20; i++) {
  const wardId = i <= 10 ? "WARD-GEN-A" : "WARD-GEN-B";
  const bedId = `GEN-${String(i).padStart(2, "0")}`;
  const isAvail = i % 2 === 0;
  beds.push({
    bedId,
    wardId,
    roomNumber: `30${i}`,
    bedType: "Standard",
    status: isAvail ? "AVAILABLE" : "OCCUPIED",
    patientId: isAvail ? null : `P-${120 + i}`,
    location: `Floor 3, Room ${i}`,
    isolationCapable: false,
    equipment: ["Patient Monitor"],
    lastUpdated: new Date()
  });
}
// Surgical Beds
for (let i = 1; i <= 8; i++) {
  const bedId = `SURG-${String(i).padStart(2, "0")}`;
  const isAvail = i > 5;
  beds.push({
    bedId,
    wardId: "WARD-SURG",
    roomNumber: `40${i}`,
    bedType: "Recovery",
    status: isAvail ? "AVAILABLE" : "OCCUPIED",
    patientId: isAvail ? null : `P-${140 + i}`,
    location: `Floor 4, Recovery ${i}`,
    isolationCapable: true,
    equipment: ["Patient Monitor", "Infusion Pump"],
    lastUpdated: new Date()
  });
}

sql += `-- Insert Beds\nINSERT INTO \`beds\` (\`bed_id\`, \`ward_id\`, \`room_number\`, \`bed_type\`, \`status\`, \`patient_id\`, \`location\`, \`isolation_capable\`, \`equipment\`, \`last_updated\`) VALUES\n`;
sql += beds.map(b => `  (${escapeSql(b.bedId)}, ${escapeSql(b.wardId)}, ${escapeSql(b.roomNumber)}, ${escapeSql(b.bedType)}, ${escapeSql(b.status)}, ${escapeSql(b.patientId)}, ${escapeSql(b.location)}, ${b.isolationCapable ? "TRUE" : "FALSE"}, ${escapeSql(b.equipment)}, ${escapeSql(b.lastUpdated)})`).join(",\n") + ";\n\n";

// 4. Equipment (20 items)
const equipment = [
  { equipmentId: "V-01", type: "Ventilator", name: "Hamilton-G5 High-End Ventilator", status: "IN_USE", currentLocation: "ICU Floor 2", department: "ICU" },
  { equipmentId: "V-02", type: "Ventilator", name: "Hamilton-G5 High-End Ventilator", status: "IN_USE", currentLocation: "ICU Floor 2", department: "ICU" },
  { equipmentId: "V-03", type: "Ventilator", name: "Puritan Bennett 980", status: "IN_USE", currentLocation: "Emergency Ward", department: "Emergency" },
  { equipmentId: "V-04", type: "Ventilator", name: "Puritan Bennett 980 (Demo Ready)", status: "AVAILABLE", currentLocation: "Emergency Ward", department: "Emergency" },
  { equipmentId: "V-05", type: "Ventilator", name: "Maquet SERVO-u", status: "AVAILABLE", currentLocation: "Equipment Storage A", department: "ICU" },
  { equipmentId: "ECG-01", type: "ECG", name: "GE MAC 2000 12-Lead ECG", status: "IN_USE", currentLocation: "Cardiology OPD", department: "Cardiology" },
  { equipmentId: "ECG-02", type: "ECG", name: "Philips PageWriter TC70", status: "AVAILABLE", currentLocation: "Emergency Ward", department: "Emergency" },
  { equipmentId: "ECG-03", type: "ECG", name: "GE MAC 2000 12-Lead ECG", status: "AVAILABLE", currentLocation: "ICU Floor 2", department: "ICU" },
  { equipmentId: "MON-01", type: "Patient Monitor", name: "Philips IntelliVue MX750", status: "IN_USE", currentLocation: "ICU Floor 2", department: "ICU" },
  { equipmentId: "MON-02", type: "Patient Monitor", name: "Mindray BeneVision N17", status: "AVAILABLE", currentLocation: "Emergency Ward", department: "Emergency" },
  { equipmentId: "MON-03", type: "Patient Monitor", name: "Mindray BeneVision N17", status: "AVAILABLE", currentLocation: "Equipment Storage B", department: "General" },
  { equipmentId: "XRAY-M01", type: "X-Ray", name: "Carestream Mobile X-Ray unit", status: "AVAILABLE", currentLocation: "Diagnostics Block", department: "Radiology" },
  { equipmentId: "US-01", type: "Ultrasound", name: "GE Voluson E10 Ultrasound", status: "IN_USE", currentLocation: "Diagnostics Room 3", department: "Radiology" },
  { equipmentId: "US-02", type: "Ultrasound", name: "Philips Affiniti 70 Mobile", status: "AVAILABLE", currentLocation: "Emergency Bay", department: "Emergency" },
  { equipmentId: "PUMP-01", type: "Infusion Pump", name: "Alaris Infusion System", status: "AVAILABLE", currentLocation: "ICU Floor 2", department: "ICU" },
  { equipmentId: "PUMP-02", type: "Infusion Pump", name: "Alaris Infusion System", status: "AVAILABLE", currentLocation: "Emergency Ward", department: "Emergency" },
  { equipmentId: "PUMP-03", type: "Infusion Pump", name: "Baxter Sigma Spectrum", status: "IN_USE", currentLocation: "Surgical Recovery", department: "Surgical" },
  { equipmentId: "DEF-01", type: "Defibrillator", name: "ZOLL R Series Plus", status: "AVAILABLE", currentLocation: "Emergency Crash Cart 1", department: "Emergency" },
  { equipmentId: "DEF-02", type: "Defibrillator", name: "ZOLL R Series Plus", status: "AVAILABLE", currentLocation: "ICU Crash Cart", department: "ICU" },
  { equipmentId: "DEF-03", type: "Defibrillator", name: "Philips HeartStart XL+", status: "MAINTENANCE", currentLocation: "Bio-Med Workshop", department: "Emergency", maintenanceStatus: "UNDER_REPAIR" }
];

sql += `-- Insert Equipment\nINSERT INTO \`equipment\` (\`equipment_id\`, \`type\`, \`name\`, \`status\`, \`current_location\`, \`department\`, \`maintenance_status\`) VALUES\n`;
sql += equipment.map(e => `  (${escapeSql(e.equipmentId)}, ${escapeSql(e.type)}, ${escapeSql(e.name)}, ${escapeSql(e.status)}, ${escapeSql(e.currentLocation)}, ${escapeSql(e.department)}, ${escapeSql(e.maintenanceStatus || "GOOD")})`).join(",\n") + ";\n\n";

// 5. Staff
const staff = [
  { staffId: "DOC-01", name: "Dr. Sarah Johnson", role: "Doctor", specialization: "Cardiologist", department: "Cardiology", status: "ON_DUTY", workload: "LOW", workloadScore: 25, currentLocation: "Emergency Desk", emergencyEligible: true, skills: ["Advanced Cardiac Life Support", "Angioplasty", "Echo"] },
  { staffId: "DOC-02", name: "Dr. Michael Chen", role: "Doctor", specialization: "Neurologist", department: "Neurology", status: "ON_DUTY", workload: "MEDIUM", workloadScore: 55, currentLocation: "NeuroCare Room 2", emergencyEligible: true, skills: ["Stroke Intervention", "EEG", "Neuro-Critical Care"] },
  { staffId: "DOC-03", name: "Dr. Emily Rodriguez", role: "Doctor", specialization: "Pediatrician", department: "Pediatrics", status: "ON_DUTY", workload: "LOW", workloadScore: 30, currentLocation: "Pediatric Wing", emergencyEligible: true, skills: ["PALS", "Neonatal Resuscitation"] },
  { staffId: "DOC-04", name: "Dr. James Wilson", role: "Surgeon", specialization: "Orthopedic Surgeon", department: "Surgery", status: "ON_DUTY", workload: "MEDIUM", workloadScore: 60, currentLocation: "OT Floor 3", emergencyEligible: true, skills: ["Trauma Surgery", "Arthroplasty"] },
  { staffId: "DOC-05", name: "Dr. Priya Sharma", role: "Doctor", specialization: "Critical Care Specialist", department: "ICU", status: "ON_DUTY", workload: "HIGH", workloadScore: 78, currentLocation: "ICU Floor 2", emergencyEligible: true, skills: ["Intubation", "Ventilator Management", "Central Line"] },
  { staffId: "DOC-06", name: "Dr. Robert Brown", role: "Doctor", specialization: "General Physician", department: "Emergency", status: "ON_DUTY", workload: "MEDIUM", workloadScore: 50, currentLocation: "ER Triage", emergencyEligible: true, skills: ["Emergency Medicine", "Triage"] },
  { staffId: "DOC-07", name: "Dr. Lisa Wang", role: "Surgeon", specialization: "General Surgeon", department: "Surgery", status: "ON_CALL", workload: "LOW", workloadScore: 10, currentLocation: "Doctors Lounge", emergencyEligible: true, skills: ["Emergency Laparotomy", "Trauma"] },
  { staffId: "DOC-08", name: "Dr. David Kim", role: "Anesthetist", specialization: "Cardiac Anesthetist", department: "Surgery", status: "ON_DUTY", workload: "LOW", workloadScore: 35, currentLocation: "OT Complex", emergencyEligible: true, skills: ["Cardiac Anesthesia", "Airway Management"] },
  { staffId: "N-07", name: "Nurse Sarah Jenkins (N-07)", role: "Nurse", specialization: "ICU Critical Care", department: "ICU", status: "ON_DUTY", workload: "LOW", workloadScore: 20, currentLocation: "ICU Station 1", emergencyEligible: true, skills: ["Vitals Monitoring", "IV Cannulation", "Emergency Drug Admin", "Ventilator Suctioning"] },
  { staffId: "N-12", name: "Nurse Kevin Lee (N-12)", role: "Nurse", specialization: "Emergency Nursing", department: "Emergency", status: "ON_DUTY", workload: "MEDIUM", workloadScore: 45, currentLocation: "Emergency Station", emergencyEligible: true, skills: ["Triage Support", "IV Infusion", "BLS"] },
  { staffId: "TECH-01", name: "Technician Rajesh Sharma", role: "Technician", specialization: "Radiology", department: "Diagnostics", status: "ON_DUTY", workload: "MEDIUM", workloadScore: 45, currentLocation: "Diagnostics Floor G", emergencyEligible: true, skills: ["CT Scan Op", "MRI Op", "X-Ray Acquisition"] },
  { staffId: "TECH-02", name: "Technician Anita Roy", role: "Technician", specialization: "Pathology/Lab", department: "Diagnostics", status: "ON_DUTY", workload: "LOW", workloadScore: 30, currentLocation: "Floor 1 Central Lab", emergencyEligible: true, skills: ["Rapid Blood Testing", "Troponin Analyzer"] }
];

sql += `-- Insert Staff\nINSERT INTO \`staff\` (\`staff_id\`, \`name\`, \`role\`, \`specialization\`, \`department\`, \`status\`, \`workload\`, \`workload_score\`, \`current_location\`, \`emergency_eligible\`, \`skills\`) VALUES\n`;
sql += staff.map(s => `  (${escapeSql(s.staffId)}, ${escapeSql(s.name)}, ${escapeSql(s.role)}, ${escapeSql(s.specialization)}, ${escapeSql(s.department)}, ${escapeSql(s.status)}, ${escapeSql(s.workload)}, ${s.workloadScore}, ${escapeSql(s.currentLocation)}, ${s.emergencyEligible ? "TRUE" : "FALSE"}, ${escapeSql(s.skills)})`).join(",\n") + ";\n\n";

// 6. Operating Theatres (8 OTs)
const ots = [
  { otId: "OT-01", name: "Cardiac Surgical Suite 1", type: "Cardiac", status: "OCCUPIED", currentProcedure: "CABG", assignedSurgeon: "Dr. James Wilson", location: "Floor 4, West Wing", equipment: ["Bypass Machine", "C-Arm", "Anesthesia Workstation"] },
  { otId: "OT-02", name: "Neuro Surgical Suite", type: "Neuro", status: "OCCUPIED", currentProcedure: "Craniotomy", assignedSurgeon: "Dr. Michael Chen", location: "Floor 4, West Wing", equipment: ["Neuro-Navigation", "Microscope"] },
  { otId: "OT-03", name: "Orthopedic Suite 1", type: "Orthopedic", status: "RESERVED", currentProcedure: "Knee Replacement Prep", assignedSurgeon: "Dr. James Wilson", location: "Floor 4, Central", equipment: ["Arthroscope", "Fluoroscopy"] },
  { otId: "OT-04", name: "Emergency Hybrid OT (Demo Ready)", type: "Emergency", status: "AVAILABLE", currentProcedure: null, assignedSurgeon: null, location: "Floor 4, Immediate Elevator Access", equipment: ["C-Arm Fluoroscopy", "Rapid Infuser", "Anesthesia Workstation", "Ventilator V-05"] },
  { otId: "OT-05", name: "General Surgery Suite 1", type: "General", status: "AVAILABLE", currentProcedure: null, assignedSurgeon: null, location: "Floor 4, East Wing", equipment: ["Laparoscopic Tower", "Electrocautery"] },
  { otId: "OT-06", name: "General Surgery Suite 2", type: "General", status: "OCCUPIED", currentProcedure: "Appendectomy", assignedSurgeon: "Dr. Lisa Wang", location: "Floor 4, East Wing", equipment: ["Laparoscopic Tower"] },
  { otId: "OT-07", name: "Maternity / C-Section OT", type: "Maternity", status: "AVAILABLE", currentProcedure: null, assignedSurgeon: null, location: "Floor 3, Maternity", equipment: ["Infant Resuscitation", "Ultrasound"] },
  { otId: "OT-08", name: "Minor Day-Care OT", type: "General", status: "MAINTENANCE", currentProcedure: null, assignedSurgeon: null, location: "Floor 4, Bio-Med Inspection", equipment: [] }
];

sql += `-- Insert Operating Theatres\nINSERT INTO \`operating_theatres\` (\`ot_id\`, \`name\`, \`type\`, \`status\`, \`current_procedure\`, \`assigned_surgeon\`, \`location\`, \`equipment\`) VALUES\n`;
sql += ots.map(o => `  (${escapeSql(o.otId)}, ${escapeSql(o.name)}, ${escapeSql(o.type)}, ${escapeSql(o.status)}, ${escapeSql(o.currentProcedure)}, ${escapeSql(o.assignedSurgeon)}, ${escapeSql(o.location)}, ${escapeSql(o.equipment)})`).join(",\n") + ";\n\n";

// 7. Diagnostic Resources (12 resources)
const diagResources = [
  { resourceId: "DIAG-XR1", type: "X-Ray", name: "Digital X-Ray Suite 1", department: "Radiology", status: "BUSY", queueLength: 7, averageWaitTime: 38, capacity: 40, location: "Ground Floor Room G-12" },
  { resourceId: "DIAG-XR2", type: "X-Ray", name: "Digital X-Ray Suite 2 (Fast-Track)", department: "Radiology", status: "AVAILABLE", queueLength: 1, averageWaitTime: 6, capacity: 40, location: "Ground Floor Room G-14" },
  { resourceId: "DIAG-CT1", type: "CT", name: "128-Slice Trauma CT Scanner", department: "Radiology", status: "BUSY", queueLength: 4, averageWaitTime: 25, capacity: 25, location: "Ground Floor Room G-18" },
  { resourceId: "DIAG-MRI1", type: "MRI", name: "3.0 Tesla High-Res MRI", department: "Radiology", status: "BUSY", queueLength: 6, averageWaitTime: 45, capacity: 16, location: "Basement 1, Room B-04" },
  { resourceId: "DIAG-US1", type: "Ultrasound", name: "Doppler Ultrasound Room 1", department: "Radiology", status: "BUSY", queueLength: 5, averageWaitTime: 20, capacity: 30, location: "Ground Floor Room G-20" },
  { resourceId: "DIAG-US2", type: "Ultrasound", name: "Point-of-Care Ultrasound 2", department: "Radiology", status: "AVAILABLE", queueLength: 0, averageWaitTime: 4, capacity: 30, location: "Emergency Annex G-02" },
  { resourceId: "DIAG-LAB-CBC", type: "Blood Lab", name: "Automated Hematology Lab (CBC)", department: "Pathology", status: "BUSY", queueLength: 12, averageWaitTime: 15, capacity: 150, location: "Floor 1 Central Lab" },
  { resourceId: "DIAG-LAB-BIO", type: "Blood Lab", name: "Biochemistry & Cardiac Markers (Troponin/LFT)", department: "Pathology", status: "AVAILABLE", queueLength: 3, averageWaitTime: 8, capacity: 150, location: "Floor 1 Stat Lab" },
  { resourceId: "DIAG-ECG1", type: "ECG", name: "Emergency ECG Station", department: "Cardiology", status: "AVAILABLE", queueLength: 1, averageWaitTime: 5, capacity: 60, location: "Emergency Bay Room 04" },
  { resourceId: "DIAG-ECHO1", type: "ECG", name: "Echocardiography Unit", department: "Cardiology", status: "BUSY", queueLength: 3, averageWaitTime: 22, capacity: 20, location: "Floor 2 Room 210" },
  { resourceId: "DIAG-PATH1", type: "Pathology", name: "Rapid Histopathology Center", department: "Pathology", status: "AVAILABLE", queueLength: 2, averageWaitTime: 30, capacity: 25, location: "Floor 1 Room 115" },
  { resourceId: "DIAG-PFT1", type: "Pathology", name: "Pulmonary Function Test Room", department: "Pulmonology", status: "MAINTENANCE", queueLength: 0, averageWaitTime: 0, capacity: 15, location: "Floor 2 Room 225" }
];

sql += `-- Insert Diagnostic Resources\nINSERT INTO \`diagnostic_resources\` (\`resource_id\`, \`type\`, \`name\`, \`department\`, \`status\`, \`queue_length\`, \`average_wait_time\`, \`capacity\`, \`location\`) VALUES\n`;
sql += diagResources.map(d => `  (${escapeSql(d.resourceId)}, ${escapeSql(d.type)}, ${escapeSql(d.name)}, ${escapeSql(d.department)}, ${escapeSql(d.status)}, ${d.queueLength}, ${d.averageWaitTime}, ${d.capacity}, ${escapeSql(d.location)})`).join(",\n") + ";\n\n";

// 8. Doctors
const doctors = [
  { mongoId: "6a3820c82cecc9714b826111", name: "Dr. Sarah Johnson", email: "sarah@medicare.com", password: "password123", specialization: "Cardiologist", imageUrl: "/assets/HD1.png", experience: "12 years", qualifications: "MBBS, MD (Cardiology)", location: "City Hospital, Block A", about: "Expert in heart rhythm, cardiac care, and coronary interventions.", fee: 700, rating: 4.9, successRate: "98%", patientsCount: "2k+" },
  { mongoId: "6a3820c82cecc9714b826112", name: "Dr. Michael Chen", email: "michael@medicare.com", password: "password123", specialization: "Neurologist", imageUrl: "/assets/HD2.png", experience: "15 years", qualifications: "MBBS, DM (Neurology)", location: "NeuroCare Center, 2nd Floor", about: "Expert in migraine, stroke, epilepsy and neuro disorders.", fee: 900, rating: 4.5, successRate: "89%", patientsCount: "1.8k+" },
  { mongoId: "6a3820c82cecc9714b826113", name: "Dr. Emily Rodriguez", email: "emily@medicare.com", password: "password123", specialization: "Pediatrician", imageUrl: "/assets/HD3.png", experience: "8 years", qualifications: "MBBS, DCH", location: "Sunrise Pediatrics, Sector 12", about: "Child specialist focusing on growth, nutrition, and immunity.", fee: 500, rating: 4.8, successRate: "97%", patientsCount: "3.2k+" },
  { mongoId: "6a3820c82cecc9714b826114", name: "Dr. James Wilson", email: "james@medicare.com", password: "password123", specialization: "Orthopedic Surgeon", imageUrl: "/assets/HD4.png", experience: "18 years", qualifications: "MBBS, MS (Orthopedics)", location: "OrthoPlus Clinic", about: "Joint replacement & sports injury expert.", fee: 1200, rating: 4.6, successRate: "92%", patientsCount: "1.5k+" },
  { mongoId: "6a3820c82cecc9714b826115", name: "Dr. Priya Sharma", email: "priya@medicare.com", password: "password123", specialization: "Critical Care Specialist", imageUrl: "/assets/HD5.png", experience: "10 years", qualifications: "MBBS, MD", location: "ICU Floor 2", about: "Critical care, intubation, ventilator management.", fee: 600, rating: 4.7, successRate: "94%", patientsCount: "2.7k+" },
  { mongoId: "6a3820c82cecc9714b826116", name: "Dr. Robert Brown", email: "robert@medicare.com", password: "password123", specialization: "General Physician", imageUrl: "/assets/HD6.png", experience: "20 years", qualifications: "MBBS, MD", location: "ER Triage", about: "Emergency medicine and general triage care.", fee: 1100, rating: 4.7, successRate: "91%", patientsCount: "4.1k+" },
  { mongoId: "6a3820c82cecc9714b826117", name: "Dr. Lisa Wang", email: "lisa@medicare.com", password: "password123", specialization: "General Surgeon", imageUrl: "/assets/HD7.png", experience: "14 years", qualifications: "MBBS, MS (Surgery)", location: "Doctors Lounge", about: "Emergency laparotomy and trauma surgery.", fee: 800, rating: 4.8, successRate: "95%", patientsCount: "2.5k+" },
  { mongoId: "6a3820c82cecc9714b826118", name: "Dr. David Kim", email: "david@medicare.com", password: "password123", specialization: "Cardiac Anesthetist", imageUrl: "/assets/HD8.png", experience: "11 years", qualifications: "MBBS, MD (Anesthesia)", location: "OT Complex", about: "Cardiac anesthesia and airway management.", fee: 950, rating: 4.8, successRate: "96%", patientsCount: "1.9k+" }
];

sql += `-- Insert Doctors\nINSERT INTO \`doctors\` (\`mongo_id\`, \`name\`, \`email\`, \`password\`, \`specialization\`, \`image_url\`, \`experience\`, \`qualifications\`, \`location\`, \`about\`, \`fee\`, \`rating\`, \`success_rate\`, \`patients_count\`) VALUES\n`;
sql += doctors.map(d => `  (${escapeSql(d.mongoId)}, ${escapeSql(d.name)}, ${escapeSql(d.email)}, ${escapeSql(d.password)}, ${escapeSql(d.specialization)}, ${escapeSql(d.imageUrl)}, ${escapeSql(d.experience)}, ${escapeSql(d.qualifications)}, ${escapeSql(d.location)}, ${escapeSql(d.about)}, ${d.fee}, ${d.rating}, ${escapeSql(d.successRate)}, ${escapeSql(d.patientsCount)})`).join(",\n") + ";\n\n";

// 9. Services
const services = [
  { mongoId: "6a3820c92cecc9714b826125", name: "Complete Blood Count (CBC)", about: "Evaluates your overall health and detects a wide range of disorders, including anemia, infection, and leukemia.", shortDescription: "Complete blood count diagnostic test.", price: 300, imageUrl: "/assets/S1.png", instructions: ["Fasting is not required", "Avoid heavy meals before the test", "Inform doctor of medications"] },
  { mongoId: "6a3820c92cecc9714b826126", name: "Lipid Profile", about: "Measures the amount of cholesterol and other fats in your blood to assess cardiovascular risk.", shortDescription: "Cholesterol and cardiovascular risk assessment.", price: 500, imageUrl: "/assets/S2.png", instructions: ["10-12 hours fasting required", "Only water is allowed during fasting", "Avoid alcohol 24h prior"] },
  { mongoId: "6a3820c92cecc9714b826127", name: "Thyroid Profile (T3, T4, TSH)", about: "Assesses thyroid gland function and helps diagnose thyroid disorders like hypo/hyperthyroidism.", shortDescription: "Thyroid gland function evaluation.", price: 600, imageUrl: "/assets/S3.png", instructions: ["Morning sample preferred", "Fasting is not mandatory"] },
  { mongoId: "6a3820c92cecc9714b826128", name: "Liver Function Test (LFT)", about: "Measures levels of proteins, liver enzymes, and bilirubin in your blood to evaluate liver health.", shortDescription: "Liver health and enzyme levels evaluation.", price: 700, imageUrl: "/assets/S4.png", instructions: ["Fasting preferred but not mandatory", "Avoid alcohol 24 hours prior"] },
  { mongoId: "6a3820c92cecc9714b826129", name: "Kidney Function Test (KFT)", about: "Evaluates how well your kidneys are working by measuring urea, creatinine, and electrolytes.", shortDescription: "Kidney performance and creatinine evaluation.", price: 800, imageUrl: "/assets/S5.png", instructions: ["Drink plenty of water before the test", "Fasting not required"] },
  { mongoId: "6a3820c92cecc9714b82612a", name: "X-Ray Chest", about: "Produces images of the heart, lungs, airways, blood vessels, and the bones of the spine and chest.", shortDescription: "Chest and lungs imaging diagnostic.", price: 400, imageUrl: "/assets/S6.png", instructions: ["Remove metal objects, jewelry before the test", "Inform technician if pregnant"] },
  { mongoId: "6a3820c92cecc9714b82612b", name: "Ultrasound Whole Abdomen", about: "Uses sound waves to produce pictures of the organs within the abdomen, including liver, gallbladder, kidneys, spleen.", shortDescription: "Abdominal organs ultrasound scan.", price: 1200, imageUrl: "/assets/S7.png", instructions: ["Fasting of 6 hours required", "Full bladder required for pelvic scan"] },
  { mongoId: "6a3820c92cecc9714b82612c", name: "HbA1c (Glycated Haemoglobin)", about: "Measures your average blood sugar levels over the past 3 months to monitor diabetes control.", shortDescription: "Average blood sugar levels monitoring.", price: 450, imageUrl: "/assets/S8.png", instructions: ["Fasting not required", "Can be done at any time of day"] }
];

sql += `-- Insert Services\nINSERT INTO \`services\` (\`mongo_id\`, \`name\`, \`about\`, \`short_description\`, \`price\`, \`available\`, \`image_url\`, \`instructions\`) VALUES\n`;
sql += services.map(s => `  (${escapeSql(s.mongoId)}, ${escapeSql(s.name)}, ${escapeSql(s.about)}, ${escapeSql(s.shortDescription)}, ${s.price}, TRUE, ${escapeSql(s.imageUrl)}, ${escapeSql(s.instructions)})`).join(",\n") + ";\n\n";

// 10. Appointments
sql += `-- Insert Appointments\nINSERT INTO \`appointments\` (\`mongo_id\`, \`owner\`, \`created_by\`, \`patient_name\`, \`mobile\`, \`age\`, \`gender\`, \`doctor_mongo_id\`, \`doctor_name\`, \`speciality\`, \`date\`, \`time\`, \`fees\`, \`status\`, \`payment_method\`, \`payment_status\`, \`payment_amount\`, \`notes\`) VALUES\n`;
sql += mockAppointments.map(a => `  (${escapeSql(a._id || a.id)}, ${escapeSql(a.owner || "major_admin_id")}, ${escapeSql(a.createdBy || "user_patient_demo")}, ${escapeSql(a.patientName)}, ${escapeSql(a.mobile)}, ${a.age || 35}, ${escapeSql(a.gender || "Male")}, ${escapeSql(a.doctorId)}, ${escapeSql(a.doctorName)}, ${escapeSql(a.speciality)}, ${escapeSql(a.date)}, ${escapeSql(a.time)}, ${a.fees || 700}, ${escapeSql(a.status)}, ${escapeSql(a.payment?.method || "Online")}, ${escapeSql(a.payment?.status || "Paid")}, ${a.payment?.amount || a.fees || 700}, ${escapeSql(a.notes || "")})`).join(",\n") + ";\n\n";

// 11. Emergency Events & Audit Logs
const emergencyEvents = [
  {
    emergencyId: "EMG-2026-901",
    patientId: "P-1005",
    patientName: "Rahul Verma (Demo Urgent)",
    severity: "CRITICAL",
    heartRate: 124,
    spO2: 86,
    bp: "85/55",
    temperature: 99.2,
    respiratoryRate: 26,
    requiredResources: ["ICU Bed", "Ventilator", "Critical Care Specialist", "Cardiac Nurse"],
    status: "ACTIVE",
    assignedBedId: "ICU-05",
    assignedDoctorId: "DOC-05",
    assignedDoctorName: "Dr. Priya Sharma",
    assignedNurseId: "N-07",
    assignedNurseName: "Nurse Sarah Jenkins (N-07)",
    assignedEquipmentIds: ["V-04", "ECG-02"],
    assignedOtId: null,
    assignedDiagnosticId: null,
    escalationLevel: 3,
    responseTimeSeconds: 42
  }
];

sql += `-- Insert Emergency Events\nINSERT INTO \`emergency_events\` (\`emergency_id\`, \`patient_id\`, \`patient_name\`, \`severity\`, \`heart_rate\`, \`sp_o2\`, \`bp\`, \`temperature\`, \`respiratory_rate\`, \`required_resources\`, \`status\`, \`assigned_bed_id\`, \`assigned_doctor_id\`, \`assigned_doctor_name\`, \`assigned_nurse_id\`, \`assigned_nurse_name\`, \`assigned_equipment_ids\`, \`escalation_level\`, \`response_time_seconds\`) VALUES\n`;
sql += emergencyEvents.map(e => `  (${escapeSql(e.emergencyId)}, ${escapeSql(e.patientId)}, ${escapeSql(e.patientName)}, ${escapeSql(e.severity)}, ${e.heartRate}, ${e.spO2}, ${escapeSql(e.bp)}, ${e.temperature}, ${e.respiratoryRate}, ${escapeSql(e.requiredResources)}, ${escapeSql(e.status)}, ${escapeSql(e.assignedBedId)}, ${escapeSql(e.assignedDoctorId)}, ${escapeSql(e.assignedDoctorName)}, ${escapeSql(e.assignedNurseId)}, ${escapeSql(e.assignedNurseName)}, ${escapeSql(e.assignedEquipmentIds)}, ${e.escalationLevel}, ${e.responseTimeSeconds})`).join(",\n") + ";\n\n";

const auditLogs = [
  { emergencyId: "EMG-2026-901", action: "CODE_RED_TRIGGERED", details: "Critical triage score: SpO2 86%, BP 85/55", actor: "Nexus Voice Agent" },
  { emergencyId: "EMG-2026-901", action: "BED_ALLOCATED", details: "Reserved ICU Isolation Bed ICU-05", actor: "Nexus Bed Orchestrator" },
  { emergencyId: "EMG-2026-901", action: "STAFF_DISPATCHED", details: "Dispatched Dr. Priya Sharma and Nurse Sarah Jenkins", actor: "Nexus Staff Agent" },
  { emergencyId: "EMG-2026-901", action: "EQUIPMENT_RESERVED", details: "Puritan Bennett 980 (V-04) locked and en-route", actor: "Nexus Equipment Agent" }
];

sql += `-- Insert Emergency Audit Logs\nINSERT INTO \`emergency_audit_logs\` (\`emergency_id\`, \`action\`, \`details\`, \`actor\`) VALUES\n`;
sql += auditLogs.map(a => `  (${escapeSql(a.emergencyId)}, ${escapeSql(a.action)}, ${escapeSql(a.details)}, ${escapeSql(a.actor)})`).join(",\n") + ";\n\n";

// 12. Forecasts
const forecasts = [
  { department: "Emergency", timeWindow: "Current", currentLoad: 24, predictedLoad: 24, confidence: 96, riskLevel: "MEDIUM", recommendedActions: ["Maintain 3 ER triage bays open", "Keep fast-track ECG available"] },
  { department: "Emergency", timeWindow: "1 Hour", currentLoad: 24, predictedLoad: 30, confidence: 93, riskLevel: "HIGH", recommendedActions: ["Pre-alert on-call emergency physician", "Stage 2 transport stretchers at triage"] },
  { department: "Emergency", timeWindow: "2 Hours", currentLoad: 24, predictedLoad: 38, confidence: 89, riskLevel: "CRITICAL", recommendedActions: ["Activate overflow protocol", "Redirect non-urgent OPD cases to Clinic B", "Deploy 2 additional nurses from General Ward"] },
  { department: "Emergency", timeWindow: "4 Hours", currentLoad: 24, predictedLoad: 51, confidence: 84, riskLevel: "CRITICAL", recommendedActions: ["Enact surge staffing plan", "Expedite bed turnaround in General Ward A", "Coordinate standby ventilators with ICU"] },
  { department: "ICU", timeWindow: "Current", currentLoad: 8, predictedLoad: 8, confidence: 95, riskLevel: "HIGH", recommendedActions: ["ICU occupancy at 80% (8/10 beds). Monitor step-down discharges."] },
  { department: "ICU", timeWindow: "2 Hours", currentLoad: 8, predictedLoad: 10, confidence: 91, riskLevel: "CRITICAL", recommendedActions: ["Projected 100% ICU capacity. Expedite step-down transfer for P-ICU-02 to Surgical Recovery.", "Reserve ICU-05 for emergent cardiac admission."] },
  { department: "Diagnostics", timeWindow: "Current", currentLoad: 18, predictedLoad: 18, confidence: 94, riskLevel: "MEDIUM", recommendedActions: ["Route outpatient X-rays to Suite 2 to reduce Suite 1 queue."] },
  { department: "Diagnostics", timeWindow: "2 Hours", currentLoad: 18, predictedLoad: 28, confidence: 88, riskLevel: "HIGH", recommendedActions: ["Activate secondary CT scanner technician", "Prioritize in-patient emergency ultrasound"] }
];

sql += `-- Insert Forecasts\nINSERT INTO \`forecasts\` (\`department\`, \`time_window\`, \`current_load\`, \`predicted_load\`, \`confidence\`, \`risk_level\`, \`recommended_actions\`) VALUES\n`;
sql += forecasts.map(f => `  (${escapeSql(f.department)}, ${escapeSql(f.timeWindow)}, ${f.currentLoad}, ${f.predictedLoad}, ${f.confidence}, ${escapeSql(f.riskLevel)}, ${escapeSql(f.recommendedActions)})`).join(",\n") + ";\n\n";

// 13. Alerts
const alerts = [
  { alertId: "ALT-101", type: "BOTTLENECK", severity: "HIGH", recipientRole: "OPERATIONS", message: "Diagnostics: Digital X-Ray Suite 1 queue length exceeded 7 patients (38 min wait). Automated load-balancing recommended.", status: "UNREAD" },
  { alertId: "ALT-102", type: "BED_SHORTAGE", severity: "CRITICAL", recipientRole: "ADMIN", message: "ICU Capacity Alert: Only 2 ICU beds remaining. Predictive model forecasts +2 admissions within 120 minutes.", status: "UNREAD" },
  { alertId: "ALT-103", type: "STAFF_OVERLOAD", severity: "MEDIUM", recipientRole: "DOCTOR", message: "Staff Workload Warning: Dr. Priya Sharma workload score is at 78% (HIGH). Next shift rotation in 90 min.", status: "UNREAD" }
];

sql += `-- Insert Alerts\nINSERT INTO \`alerts\` (\`alert_id\`, \`type\`, \`severity\`, \`recipient_role\`, \`message\`, \`status\`) VALUES\n`;
sql += alerts.map(a => `  (${escapeSql(a.alertId)}, ${escapeSql(a.type)}, ${escapeSql(a.severity)}, ${escapeSql(a.recipientRole)}, ${escapeSql(a.message)}, ${escapeSql(a.status)})`).join(",\n") + ";\n\n";

// 14. RTLS Locations
const rtls = [
  { resourceId: "DOC-01", resourceType: "Doctor", resourceName: "Dr. Sarah Johnson (Cardiology)", location: "Emergency", x: 28.0, y: 35.0, floor: 1, batteryLevel: 98, status: "ACTIVE" },
  { resourceId: "DOC-02", resourceType: "Doctor", resourceName: "Dr. Michael Chen (Neurology)", location: "OPD", x: 75.0, y: 25.0, floor: 1, batteryLevel: 92, status: "ACTIVE" },
  { resourceId: "DOC-05", resourceType: "Doctor", resourceName: "Dr. Priya Sharma (ICU Specialist)", location: "ICU", x: 42.0, y: 70.0, floor: 2, batteryLevel: 88, status: "ACTIVE" },
  { resourceId: "N-07", resourceType: "Nurse", resourceName: "Nurse Sarah Jenkins (N-07)", location: "ICU", x: 50.0, y: 75.0, floor: 2, batteryLevel: 95, status: "ACTIVE" },
  { resourceId: "N-12", resourceType: "Nurse", resourceName: "Nurse Kevin Lee (N-12)", location: "Emergency", x: 20.0, y: 40.0, floor: 1, batteryLevel: 84, status: "ACTIVE" },
  { resourceId: "V-04", resourceType: "Ventilator", resourceName: "Puritan Bennett 980 (V-04)", location: "Emergency", x: 25.0, y: 48.0, floor: 1, batteryLevel: 100, status: "READY" },
  { resourceId: "V-05", resourceType: "Ventilator", resourceName: "Maquet SERVO-u (V-05)", location: "ICU", x: 58.0, y: 68.0, floor: 2, batteryLevel: 90, status: "READY" },
  { resourceId: "ECG-02", resourceType: "ECG", resourceName: "Philips PageWriter (ECG-02)", location: "Emergency", x: 32.0, y: 42.0, floor: 1, batteryLevel: 94, status: "READY" },
  { resourceId: "WHEEL-01", resourceType: "Wheelchair", resourceName: "Smart Transporter W-01", location: "Emergency", x: 15.0, y: 30.0, floor: 1, batteryLevel: 85, status: "ACTIVE" },
  { resourceId: "P-104", resourceType: "Patient", resourceName: "Emergency Patient P-104", location: "Emergency", x: 22.0, y: 38.0, floor: 1, batteryLevel: 100, status: "CRITICAL" }
];

sql += `-- Insert RTLS Locations\nINSERT INTO \`rtls_locations\` (\`resource_id\`, \`resource_type\`, \`resource_name\`, \`location\`, \`x\`, \`y\`, \`floor\`, \`battery_level\`, \`status\`) VALUES\n`;
sql += rtls.map(r => `  (${escapeSql(r.resourceId)}, ${escapeSql(r.resourceType)}, ${escapeSql(r.resourceName)}, ${escapeSql(r.location)}, ${r.x}, ${r.y}, ${r.floor}, ${r.batteryLevel}, ${escapeSql(r.status)})`).join(",\n") + ";\n\n";

sql += `-- =====================================================================\n-- VERIFICATION QUERIES (Run these in Workbench to confirm setup)\n-- =====================================================================\n`;
sql += `SELECT 'Wards' AS \`Table\`, COUNT(*) AS \`Rows\` FROM \`wards\`\nUNION ALL\nSELECT 'Beds', COUNT(*) FROM \`beds\`\nUNION ALL\nSELECT 'Equipment', COUNT(*) FROM \`equipment\`\nUNION ALL\nSELECT 'Staff', COUNT(*) FROM \`staff\`\nUNION ALL\nSELECT 'Operating Theatres', COUNT(*) FROM \`operating_theatres\`\nUNION ALL\nSELECT 'Diagnostic Resources', COUNT(*) FROM \`diagnostic_resources\`\nUNION ALL\nSELECT 'Patients', COUNT(*) FROM \`patients\`\nUNION ALL\nSELECT 'Doctors', COUNT(*) FROM \`doctors\`\nUNION ALL\nSELECT 'Appointments', COUNT(*) FROM \`appointments\`\nUNION ALL\nSELECT 'Services', COUNT(*) FROM \`services\`\nUNION ALL\nSELECT 'Emergency Events', COUNT(*) FROM \`emergency_events\`\nUNION ALL\nSELECT 'Forecasts', COUNT(*) FROM \`forecasts\`\nUNION ALL\nSELECT 'Alerts', COUNT(*) FROM \`alerts\`\nUNION ALL\nSELECT 'RTLS Locations', COUNT(*) FROM \`rtls_locations\`;\n`;

const outPath = path.join(__dirname, "medicare_nexus_schema_and_seed.sql");
fs.writeFileSync(outPath, sql, "utf-8");
console.log(`✅ Successfully generated MySQL script: ${outPath} (${(sql.length / 1024).toFixed(2)} KB)`);
