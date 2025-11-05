
SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

DROP DATABASE IF EXISTS medical_db;
CREATE DATABASE medical_db;
USE medical_db;

DROP VIEW IF EXISTS `View_Complete_Medical_Record`;
DROP VIEW IF EXISTS `View_Prescriptions`;
DROP VIEW IF EXISTS `View_Medical_Reports`;
DROP VIEW IF EXISTS `View_Current_Medications`;
DROP VIEW IF EXISTS `View_Conditions`;
DROP VIEW IF EXISTS `View_Medicines`;
DROP VIEW IF EXISTS `View_Bookings`;
DROP VIEW IF EXISTS `View_Doctors`;
DROP VIEW IF EXISTS `View_Allergies`;
DROP VIEW IF EXISTS `View_Admins`;
DROP VIEW IF EXISTS `View_Existing_Conditions`;
DROP VIEW IF EXISTS `View_Patients`;
DROP VIEW IF EXISTS `View_Booking_Details`;
DROP VIEW IF EXISTS `View_Patient_Summary`;

DROP TABLE IF EXISTS `Invoice`;
DROP TABLE IF EXISTS `Prescription`;
DROP TABLE IF EXISTS `Doctor_Availability`;
DROP TABLE IF EXISTS `Medical_Report`;
DROP TABLE IF EXISTS `Patient_Medicine`;
DROP TABLE IF EXISTS `Patient_Condition`;
DROP TABLE IF EXISTS `Patient_Allergy`;
DROP TABLE IF EXISTS `Booking`;
DROP TABLE IF EXISTS `Doctor`;
DROP TABLE IF EXISTS `Admin`;
DROP TABLE IF EXISTS `Patient`;



CREATE TABLE `Patient` (
  `patient_id` INT AUTO_INCREMENT,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `date_of_birth` DATE,
  `gender` VARCHAR(20),
  `identification_number` VARCHAR(50) UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `phone_number` VARCHAR(20),
  `address` TEXT,
  `emergency_contact_name` VARCHAR(255),
  `emergency_contact_number` VARCHAR(20),
  `blood_type` VARCHAR(10) COMMENT 'Moved from Medical_Record - core patient info',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`)
);

CREATE TABLE `Admin` (
  `admin_id` INT AUTO_INCREMENT,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`admin_id`)
);

CREATE TABLE `Doctor` (
  `doctor_id` INT AUTO_INCREMENT,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `date_of_birth` DATE,
  `identification_number` VARCHAR(50) UNIQUE,
  `gender` VARCHAR(20),
  `specialization` VARCHAR(100),
  `status` VARCHAR(50),
  PRIMARY KEY (`doctor_id`)
);

CREATE TABLE `Patient_Allergy` (
  `allergy_id` INT AUTO_INCREMENT,
  `patient_id` INT NOT NULL,
  `allergen` VARCHAR(255) NOT NULL COMMENT 'Name of the allergen (e.g., Penicillin, Peanuts)',
  `reaction` TEXT COMMENT 'Description of the allergic reaction',
  `severity` ENUM('Mild', 'Moderate', 'Severe') DEFAULT 'Moderate',
  `diagnosed_date` DATE COMMENT 'When the allergy was diagnosed',
  `notes` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Allergy may become inactive over time',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`allergy_id`),
  FOREIGN KEY (`patient_id`) REFERENCES `Patient`(`patient_id`) ON DELETE CASCADE,
  INDEX `idx_patient_allergies` (`patient_id`)
);

CREATE TABLE `Patient_Condition` (
  `condition_id` INT AUTO_INCREMENT,
  `patient_id` INT NOT NULL,
  `condition_name` VARCHAR(255) NOT NULL COMMENT 'e.g., Hypertension, Type 2 Diabetes',
  `diagnosed_date` DATE COMMENT 'When the condition was diagnosed',
  `status` ENUM('Active', 'Managed', 'Resolved', 'In Remission') DEFAULT 'Active',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`condition_id`),
  FOREIGN KEY (`patient_id`) REFERENCES `Patient`(`patient_id`) ON DELETE CASCADE,
  INDEX `idx_patient_conditions` (`patient_id`)
);

CREATE TABLE `Patient_Medicine` (
  `patient_medicine_id` INT AUTO_INCREMENT,
  `patient_id` INT NOT NULL,
  `condition_id` INT COMMENT 'Optional: Link to the condition being treated',
  `medication_name` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(100),
  `frequency` VARCHAR(100),
  `start_date` DATE,
  `end_date` DATE COMMENT 'NULL if ongoing',
  `status` ENUM('Active', 'Discontinued', 'Completed') DEFAULT 'Active',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_medicine_id`),
  FOREIGN KEY (`patient_id`) REFERENCES `Patient`(`patient_id`) ON DELETE CASCADE,
  FOREIGN KEY (`condition_id`) REFERENCES `Patient_Condition`(`condition_id`) ON DELETE SET NULL,
  INDEX `idx_patient_medicines` (`patient_id`),
  INDEX `idx_condition_medicines` (`condition_id`)
);


CREATE TABLE `Booking` (
  `booking_id` INT AUTO_INCREMENT,
  `patient_id` INT,
  `doctor_id` INT,
  `admin_id` INT,
  `booking_date` DATE,
  `booking_time` TIME,
  `end_time` TIME,
  `payment_method` VARCHAR(50),
  `reason_for_visit` TEXT,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  FOREIGN KEY (`patient_id`) REFERENCES `Patient`(`patient_id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `Doctor`(`doctor_id`) ON DELETE SET NULL,
  FOREIGN KEY (`admin_id`) REFERENCES `Admin`(`admin_id`) ON DELETE SET NULL,
  INDEX `idx_booking_date` (`booking_date`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_doctor_datetime` (`doctor_id`, `booking_date`, `booking_time`)
);


CREATE TABLE `Medical_Report` (
  `report_id` INT AUTO_INCREMENT,
  `patient_id` INT NOT NULL,
  `booking_id` INT COMMENT 'Link to the appointment that generated this report',
  `doctor_id` INT COMMENT 'Doctor who created the report (nullable if doctor is deleted)',
  `admin_id` INT COMMENT 'Admin who may have filed/processed the report',
  `report_type` VARCHAR(100) NOT NULL COMMENT 'e.g., Lab Results, X-Ray, Physical Exam, Consultation Note',
  `report_date` DATE NOT NULL,
  `diagnosis` TEXT,
  `treatment_plan` TEXT,
  `tests_recommended` TEXT,
  `followup_date` DATE,
  `notes` TEXT,
  `file_path` VARCHAR(255) COMMENT 'Path to PDF or scanned document',
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  FOREIGN KEY (`patient_id`) REFERENCES `Patient`(`patient_id`) ON DELETE CASCADE,
  FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`booking_id`) ON DELETE SET NULL,
  FOREIGN KEY (`doctor_id`) REFERENCES `Doctor`(`doctor_id`) ON DELETE SET NULL,
  FOREIGN KEY (`admin_id`) REFERENCES `Admin`(`admin_id`) ON DELETE SET NULL,
  INDEX `idx_patient_reports` (`patient_id`),
  INDEX `idx_report_date` (`report_date`),
  INDEX `idx_report_type` (`report_type`)
);


CREATE TABLE `Prescription` (
  `prescription_id` INT AUTO_INCREMENT,
  `patient_id` INT NOT NULL,
  `doctor_id` INT,
  `booking_id` INT COMMENT 'The appointment when prescribed',
  `medication_name` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL,
  `frequency` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(100),
  `quantity` INT,
  `refills` INT DEFAULT 0,
  `instructions` TEXT,
  `prescribed_date` DATE NOT NULL,
  `start_date` DATE,
  `end_date` DATE,
  `status` VARCHAR(50) DEFAULT 'Active' COMMENT 'Active, Completed, Cancelled',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prescription_id`),
  FOREIGN KEY (`patient_id`) REFERENCES `Patient`(`patient_id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `Doctor`(`doctor_id`) ON DELETE SET NULL,
  FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`booking_id`) ON DELETE SET NULL,
  INDEX `idx_patient_prescriptions` (`patient_id`),
  INDEX `idx_doctor_prescriptions` (`doctor_id`),
  INDEX `idx_prescription_date` (`prescribed_date`)
);


CREATE TABLE `Doctor_Availability` (
  `availability_id` INT AUTO_INCREMENT,
  `doctor_id` INT NOT NULL,
  `day_of_week` INT NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_available` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`availability_id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `Doctor`(`doctor_id`) ON DELETE CASCADE,
  INDEX `idx_doctor_availability` (`doctor_id`, `day_of_week`)
);


CREATE TABLE `Invoice` (
  `invoice_id` INT AUTO_INCREMENT,
  `patient_id` INT NOT NULL,
  `doctor_id` INT,
  `booking_id` INT COMMENT 'Optional: Link to appointment',
  `invoice_number` VARCHAR(50) UNIQUE NOT NULL COMMENT 'Auto-generated invoice number',
  `invoice_date` DATE NOT NULL,
  `due_date` DATE,
  `payment_method` ENUM('Cash', 'Card', 'Insurance', 'Other') DEFAULT 'Cash',
  `payment_status` ENUM('Pending', 'Paid', 'Partially Paid', 'Cancelled') DEFAULT 'Pending',
  `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(10, 2) DEFAULT 0.00,
  `discount` DECIMAL(10, 2) DEFAULT 0.00,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `amount_paid` DECIMAL(10, 2) DEFAULT 0.00,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_id`),
  FOREIGN KEY (`patient_id`) REFERENCES `Patient`(`patient_id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `Doctor`(`doctor_id`) ON DELETE SET NULL,
  FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`booking_id`) ON DELETE SET NULL,
  INDEX `idx_patient_invoices` (`patient_id`),
  INDEX `idx_doctor_invoices` (`doctor_id`),
  INDEX `idx_invoice_date` (`invoice_date`),
  INDEX `idx_payment_status` (`payment_status`)
);

CREATE TABLE `Invoice_Item` (
  `item_id` INT AUTO_INCREMENT,
  `invoice_id` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL COMMENT 'Service/item description',
  `quantity` INT DEFAULT 1,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL COMMENT 'quantity * unit_price',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`invoice_id`) ON DELETE CASCADE,
  INDEX `idx_invoice_items` (`invoice_id`)
);

CREATE TABLE IF NOT EXISTS sick_note (
  sick_note_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  issue_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  diagnosis TEXT NOT NULL,
  recommendations TEXT,
  restrictions TEXT,
  can_return_work BOOLEAN DEFAULT FALSE,
  additional_notes TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- Support Ticket Table
CREATE TABLE IF NOT EXISTS Support_Ticket (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    admin_response TEXT NULL,
    admin_id INT NULL,
    responded_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);


CREATE VIEW `View_Patients` AS
SELECT
    `patient_id`,
    `username`,
    `first_name`,
    `last_name`,
    `date_of_birth`,
    `gender`,
    `identification_number`,
    `email`,
    `phone_number`,
    `address`,
    `emergency_contact_name`,
    `emergency_contact_number`,
    `blood_type`
FROM `Patient`;

CREATE VIEW `View_Patient_Summary` AS
SELECT
    p.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.date_of_birth,
    p.gender,
    p.blood_type,
    p.email,
    p.phone_number,
    COUNT(DISTINCT pa.allergy_id) AS allergy_count,
    COUNT(DISTINCT pc.condition_id) AS condition_count,
    COUNT(DISTINCT pm.patient_medicine_id) AS current_medication_count
FROM Patient p
LEFT JOIN Patient_Allergy pa ON p.patient_id = pa.patient_id AND pa.is_active = TRUE
LEFT JOIN Patient_Condition pc ON p.patient_id = pc.patient_id AND pc.status = 'Active'
LEFT JOIN Patient_Medicine pm ON p.patient_id = pm.patient_id AND pm.status = 'Active'
GROUP BY p.patient_id;

CREATE VIEW `View_Allergies` AS
SELECT
    pa.allergy_id,
    pa.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    pa.allergen,
    pa.reaction,
    pa.severity,
    pa.diagnosed_date,
    pa.is_active,
    pa.notes
FROM Patient_Allergy pa
JOIN Patient p ON pa.patient_id = p.patient_id;

CREATE VIEW `View_Conditions` AS
SELECT
    pc.condition_id,
    pc.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    pc.condition_name,
    pc.diagnosed_date,
    pc.status,
    pc.notes
FROM Patient_Condition pc
JOIN Patient p ON pc.patient_id = p.patient_id;

CREATE VIEW `View_Current_Medications` AS
SELECT
    pm.patient_medicine_id,
    pm.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    pm.medication_name,
    pm.dosage,
    pm.frequency,
    pc.condition_name,
    pm.start_date,
    pm.status
FROM Patient_Medicine pm
JOIN Patient p ON pm.patient_id = p.patient_id
LEFT JOIN Patient_Condition pc ON pm.condition_id = pc.condition_id
WHERE pm.status = 'Active';

CREATE VIEW `View_Doctors` AS
SELECT
    `doctor_id`,
    `username`,
    `first_name`,
    `last_name`,
    `date_of_birth`,
    `identification_number`,
    `gender`,
    `specialization`,
    `status`
FROM `Doctor`;

CREATE VIEW `View_Admins` AS
SELECT
    `admin_id`,
    `username`
FROM `Admin`;

CREATE VIEW `View_Bookings` AS
SELECT
    `booking_id`,
    `patient_id`,
    `doctor_id`,
    `admin_id`,
    `booking_date`,
    `booking_time`,
    `end_time`,
    `payment_method`,
    `reason_for_visit`,
    `status`
FROM `Booking`;

CREATE VIEW `View_Booking_Details` AS
SELECT
    b.booking_id,
    b.booking_date,
    b.booking_time,
    b.end_time,
    b.reason_for_visit,
    b.status,
    b.payment_method,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.email AS patient_email,
    p.phone_number AS patient_phone,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialization AS doctor_specialization,
    d.status AS doctor_status,
    a.username AS admin_username
FROM Booking b
LEFT JOIN Patient p ON b.patient_id = p.patient_id
LEFT JOIN Doctor d ON b.doctor_id = d.doctor_id
LEFT JOIN Admin a ON b.admin_id = a.admin_id
ORDER BY b.booking_date DESC, b.booking_time DESC;

CREATE VIEW `View_Medical_Reports` AS
SELECT
    mr.report_id,
    mr.report_type,
    mr.report_date,
    mr.diagnosis,
    mr.treatment_plan,
    mr.tests_recommended,
    mr.followup_date,
    mr.notes,
    mr.file_path,
    mr.status,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.patient_id,
    p.email AS patient_email,
    p.date_of_birth AS patient_dob,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialization AS doctor_specialization,
    b.booking_date AS related_appointment_date,
    mr.created_at,
    mr.updated_at
FROM Medical_Report mr
JOIN Patient p ON mr.patient_id = p.patient_id
LEFT JOIN Doctor d ON mr.doctor_id = d.doctor_id
LEFT JOIN Booking b ON mr.booking_id = b.booking_id
ORDER BY mr.report_date DESC, mr.created_at DESC;

CREATE VIEW `View_Prescriptions` AS
SELECT
    pr.prescription_id,
    pr.medication_name,
    pr.dosage,
    pr.frequency,
    pr.duration,
    pr.quantity,
    pr.refills,
    pr.instructions,
    pr.prescribed_date,
    pr.start_date,
    pr.end_date,
    pr.status,
    pr.notes,
    CONCAT(pt.first_name, ' ', pt.last_name) AS patient_name,
    pt.patient_id,
    pt.email AS patient_email,
    pt.phone_number AS patient_phone,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialization AS doctor_specialization,
    b.booking_date AS appointment_date,
    pr.created_at,
    pr.updated_at
FROM Prescription pr
JOIN Patient pt ON pr.patient_id = pt.patient_id
LEFT JOIN Doctor d ON pr.doctor_id = d.doctor_id
LEFT JOIN Booking b ON pr.booking_id = b.booking_id
ORDER BY pr.prescribed_date DESC, pr.created_at DESC;

CREATE VIEW `View_Complete_Medical_Record` AS
SELECT
    p.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.date_of_birth,
    p.gender,
    p.blood_type,
    p.email,
    p.phone_number,
    p.address,
    p.emergency_contact_name,
    p.emergency_contact_number,

    COUNT(DISTINCT pa.allergy_id) AS total_allergies,
    COUNT(DISTINCT pc.condition_id) AS total_conditions,
    COUNT(DISTINCT pm.patient_medicine_id) AS current_medications,
    COUNT(DISTINCT mr.report_id) AS total_reports,
    COUNT(DISTINCT pr.prescription_id) AS total_prescriptions,
    COUNT(DISTINCT b.booking_id) AS total_appointments,

    MAX(mr.report_date) AS last_report_date,
    MAX(b.booking_date) AS last_appointment_date,
    MAX(pr.prescribed_date) AS last_prescription_date,

    p.created_at AS record_created_date,
    p.updated_at AS record_last_updated
FROM Patient p
LEFT JOIN Patient_Allergy pa ON p.patient_id = pa.patient_id
LEFT JOIN Patient_Condition pc ON p.patient_id = pc.patient_id
LEFT JOIN Patient_Medicine pm ON p.patient_id = pm.patient_id
LEFT JOIN Medical_Report mr ON p.patient_id = mr.patient_id
LEFT JOIN Prescription pr ON p.patient_id = pr.patient_id
LEFT JOIN Booking b ON p.patient_id = b.patient_id
GROUP BY p.patient_id;

-- ============================================
-- INSERT DATA
-- ============================================

-- Patient passwords are bcrypt hashed for security
-- All test passwords are: hashedpass1, hashedpass2, ... hashedpass10
INSERT INTO `Patient` (`username`, `password`, `first_name`, `last_name`, `date_of_birth`, `gender`, `identification_number`, `email`, `phone_number`, `address`, `emergency_contact_name`, `emergency_contact_number`, `blood_type`) VALUES
('johndoe', '$2b$10$M2hhT1wSczrzH7FKOAqQDOjN0CkKxKUdDESySCL6h1invqXt8UbwW', 'John', 'Doe', '1985-05-15', 'Male', 'P123456789', 'johndoe@example.com', '555-1001', '123 Main St, Anytown', 'Jane Doe', '555-1002', 'A+'),
('janesmith', '$2b$10$I3DdNaLAPp/UDSbJesKp7.gfBD6CS.AJsqISFD8.K5.MfGhvRuM5O', 'Jane', 'Smith', '1990-11-22', 'Female', 'P987654321', 'janesmith@example.com', '555-1003', '456 Oak Ave, Otherville', 'John Smith', '555-1004', 'B-'),
('peterjones', '$2b$10$xgt4kcmDqZZo0vlZzyye7.NtowsojDdD61yS5OWzLULetXAJar3uC', 'Peter', 'Jones', '1978-03-01', 'Male', 'P112233445', 'peterjones@example.com', '555-1001', '789 Pine Rd, Smallville', 'Sarah Jones', '555-1006', 'O+'),
('marybrown', '$2b$10$SZQRMNoqSyxJ54EPfeYd0e08nVyVDCIK5ui1AeEEJpacPcXIDAJce', 'Mary', 'Brown', '1995-07-10', 'Female', 'P556677889', 'marybrown@example.com', '555-1007', '101 Elm St, Big City', 'David Brown', '555-1008', 'AB+'),
('davidwilson', '$2b$10$knGbUOPmJwAT8kfLo3U0rOhuYBkqrOic.EZhQ6A0TfCcRfzXJYq/K', 'David', 'Wilson', '1982-01-25', 'Male', 'P998877665', 'davidwilson@example.com', '555-1009', '202 Birch Ln, Metroburg', 'Laura Wilson', '555-1010', 'A-'),
('laurataylor', '$2b$10$2iA0kk8G8zjZuXF2wH9.W.7VpC.idb20OrE8WhymDaZz2rRMzPcP6', 'Laura', 'Taylor', '1998-09-03', 'Female', 'P443322110', 'laurataylor@example.com', '555-1011', '303 Cedar Dr, Villagetown', 'Chris Taylor', '555-1012', 'O-'),
('chrismoore', '$2b$10$4yJXJoNMv6viZob9/TPv7ePQ99OUKfvJx.if2fYPpAUdKjyfhlnLy', 'Chris', 'Moore', '1970-12-18', 'Male', 'P776655443', 'chrismoore@example.com', '555-1013', '404 Willow Ct, Hamlet', 'Megan Moore', '555-1014', 'B+'),
('susanhall', '$2b$10$FL81ith7aA0FwIpRhw5oreG3nqMX2C80ALjvC4YcioeH2twCpb9vC', 'Susan', 'Hall', '1988-04-07', 'Female', 'P221100998', 'susanhall@example.com', '555-1015', '505 Poplar Blvd, Townsville', 'Robert Hall', '555-1016', 'AB-'),
('robertking', '$2b$10$bd0ptlph.iz/HLxIDVQd1ekJ2zdfjH6EEqAopdyU0Qt86BIjkoNx.', 'Robert', 'King', '1975-06-30', 'Male', 'P667788990', 'robertking@example.com', '555-1017', '606 Spruce Way, Cityville', 'Emily King', '555-1018', 'A+'),
('emilywright', '$2b$10$lxecxSSTHPAtAHE6Z3hm6..iYIGDLmV7k8/rV2aCcYYixz6abIRaS', 'Emily', 'Wright', '1992-02-14', 'Female', 'P334455667', 'emilywright@example.com', '555-1019', '707 Fir St, Suburbia', 'Daniel Wright', '555-1020', 'O+');

-- Admin passwords are bcrypt hashed for security
-- Test passwords are: adminpass1, adminpass2, adminpass3
INSERT INTO `Admin` (`username`, `password`) VALUES
('admin_user1', '$2b$10$T1u/g7fl58t.PTh5i.ep9O.5wiahPmH3b942F17v/OYiLDnXNbGtq'),
('admin_user2', '$2b$10$NjNQK3dlOWvbeDFKZQT1wuGGlgQNbBD8WB0oa53Ky2FFsrc5J287y'),
('admin_user3', '$2b$10$WetlazmJeozEuxu..mdT.etrXYs9cmm9nIQlCrOai5lfe0i7UeYDG');

-- Doctor passwords are bcrypt hashed for security
-- Test passwords are: docpass1, docpass2, ... docpass8
INSERT INTO `Doctor` (`username`, `password`, `first_name`, `last_name`, `date_of_birth`, `identification_number`, `gender`, `specialization`, `status`) VALUES
('dr.anderson', '$2b$10$xei/I/uqKVaR.pD.oaDvPuHzi9KTY9kOPDkZ8ofMTYeVFrn0NPibC', 'Sarah', 'Anderson', '1972-08-20', 'D111222333', 'Female', 'Cardiologist', 'Active'),
('dr.williams', '$2b$10$X3IQ.6zKnFAp/N.HIleMGOca/qc5onp6lSke6T/SFLOResZiu2GC.', 'Michael', 'Williams', '1965-03-10', 'D444555666', 'Male', 'General Practitioner', 'Active'),
('dr.davis', '$2b$10$GpM3vn3srGTpkHhFVehg5.w6GZplSaHiDQjTANi.dDvAiEDuH4Bpm', 'Emily', 'Davis', '1980-11-05', 'D777888999', 'Female', 'Pediatrician', 'Active'),
('dr.thompson', '$2b$10$3ERrPYz9Sd.NeeYB1vngC.1lV8eYYRCkNRmnbOrLbTHZBtMw4ibbS', 'Robert', 'Thompson', '1978-06-15', 'D222333444', 'Male', 'Orthopedic Surgeon', 'Active'),
('dr.nguyen', '$2b$10$M4tFJmi3EcXFXZszkKpOLOH8xMMQXN1rRjE5zI2TK9wo6au4uEe3e', 'Lisa', 'Nguyen', '1985-12-03', 'D555666777', 'Female', 'Dermatologist', 'Active'),
('dr.patel', '$2b$10$OQ8w/v0Jmc1bcGMdwrU4KODGfLORpAE.y8.NNN5eKjOICvVZG8Hhu', 'Raj', 'Patel', '1975-09-22', 'D888999000', 'Male', 'Neurologist', 'Active'),
('dr.johnson', '$2b$10$gne4Ndf3YSRkVQHI3gEQUOdKvAOcz39r5cEl2dhDtis7byvqMVznW', 'Karen', 'Johnson', '1982-04-18', 'D333444555', 'Female', 'Psychiatrist', 'Active'),
('dr.garcia', '$2b$10$SrRFf9uFZKhWshuvxaoafOdhYYP0nNex6SgreG301u.MupYmsKQAO', 'Carlos', 'Garcia', '1970-11-30', 'D666777888', 'Male', 'Oncologist', 'Active');

INSERT INTO `Patient_Allergy` (`patient_id`, `allergen`, `reaction`, `severity`, `diagnosed_date`, `notes`) VALUES
(1, 'Penicillin', 'Severe rash and difficulty breathing', 'Severe', '2010-05-12', 'Avoid all penicillin-based antibiotics'),
(2, 'Pollen', 'Sneezing, runny nose, itchy eyes', 'Mild', '2015-03-20', 'Seasonal allergies, spring and fall'),
(3, 'Peanuts', 'Anaphylaxis', 'Severe', '1985-06-10', 'Carries EpiPen at all times'),
(4, 'Shellfish', 'Hives and swelling', 'Moderate', '2018-08-15', 'Avoid all shellfish'),
(5, 'Latex', 'Skin irritation', 'Mild', '2005-02-28', 'Use non-latex gloves'),
(6, 'Bee Stings', 'Severe swelling and anaphylaxis', 'Severe', '2000-07-04', 'Carries EpiPen'),
(7, 'Dust Mites', 'Respiratory issues', 'Moderate', '2012-11-10', 'Uses air purifier at home'),
(8, 'Cats', 'Sneezing, watery eyes', 'Mild', '2008-01-15', 'Avoids cat exposure'),
(9, 'Ibuprofen', 'Stomach upset and rash', 'Moderate', '2019-05-20', 'Use acetaminophen instead'),
(10, 'Eggs', 'Digestive issues', 'Mild', '2016-09-12', 'Avoids raw eggs');

INSERT INTO `Patient_Condition` (`patient_id`, `condition_name`, `diagnosed_date`, `status`, `notes`) VALUES
(1, 'Hypertension', '2015-03-10', 'Managed', 'Controlled with medication'),
(2, 'Type 2 Diabetes', '2018-07-22', 'Active', 'Monitoring blood sugar levels'),
(3, 'Asthma', '1985-09-15', 'Active', 'Uses rescue inhaler as needed'),
(4, 'Migraines', '2012-05-20', 'Active', 'Triggered by stress and certain foods'),
(5, 'Hypothyroidism', '2010-11-08', 'Managed', 'Daily thyroid medication'),
(6, 'Arthritis', '2020-02-14', 'Active', 'Osteoarthritis in knees'),
(7, 'Chronic Back Pain', '2016-06-30', 'Active', 'L4-L5 disc issues'),
(8, 'GERD', '2019-01-18', 'Managed', 'Controlled with lifestyle and medication'),
(9, 'Anxiety Disorder', '2017-08-25', 'Active', 'In therapy, taking medication'),
(10, 'High Cholesterol', '2020-10-05', 'Active', 'Dietary changes and medication');

INSERT INTO `Patient_Medicine` (`patient_id`, `condition_id`, `medication_name`, `dosage`, `frequency`, `start_date`, `status`, `notes`) VALUES
(1, 1, 'Lisinopril', '10mg', 'Once daily', '2015-03-15', 'Active', 'Take in the morning'),
(2, 2, 'Metformin', '1000mg', 'Twice daily', '2018-07-25', 'Active', 'Take with meals'),
(3, 3, 'Albuterol Inhaler', '90mcg', 'As needed', '1985-09-20', 'Active', 'Rescue inhaler for asthma attacks'),
(4, 4, 'Sumatriptan', '50mg', 'As needed', '2012-06-01', 'Active', 'For migraine relief'),
(5, 5, 'Levothyroxine', '75mcg', 'Once daily', '2010-11-15', 'Active', 'Take on empty stomach'),
(6, 6, 'Ibuprofen', '800mg', 'Three times daily', '2020-03-01', 'Active', 'Take with food'),
(7, 7, 'Naproxen', '500mg', 'Twice daily', '2016-07-10', 'Active', 'For back pain'),
(8, 8, 'Omeprazole', '20mg', 'Once daily', '2019-01-25', 'Active', 'Before breakfast'),
(9, 9, 'Sertraline', '50mg', 'Once daily', '2017-09-01', 'Active', 'For anxiety'),
(10, 10, 'Atorvastatin', '20mg', 'Once daily', '2020-10-12', 'Active', 'Take at bedtime');

INSERT INTO `Booking` (`patient_id`, `doctor_id`, `admin_id`, `booking_date`, `booking_time`, `end_time`, `payment_method`, `reason_for_visit`, `status`) VALUES
-- Past appointments (Completed)
(1, 1, 1, '2025-10-01', '09:00:00', '09:30:00', 'Credit Card', 'Hypertension Follow-up', 'Completed'),
(2, 2, 1, '2025-10-03', '10:30:00', '11:00:00', 'Cash', 'Diabetes Check', 'Completed'),
(3, 3, 2, '2025-10-05', '11:00:00', '11:30:00', 'Insurance', 'Asthma Review', 'Completed'),

-- Recent past (Yesterday - Completed)
(4, 1, 2, '2025-10-11', '14:00:00', '14:30:00', 'Credit Card', 'Cardiac Screening', 'Completed'),
(5, 2, 1, '2025-10-11', '09:30:00', '10:00:00', 'Cash', 'General Checkup', 'Completed'),

-- Today's appointments (mix of statuses)
(6, 4, 1, '2025-10-12', '09:00:00', '09:30:00', 'Insurance', 'Knee Pain Evaluation', 'Confirmed'),
(7, 3, 2, '2025-10-12', '10:00:00', '10:30:00', 'Credit Card', 'Child Wellness Visit', 'In Progress'),
(8, 5, 2, '2025-10-12', '14:00:00', '14:30:00', 'Cash', 'Skin Rash Consultation', 'Confirmed'),
(9, 7, 1, '2025-10-12', '15:30:00', '16:00:00', 'Insurance', 'Anxiety Follow-up', 'Confirmed'),

-- Tomorrow's appointments
(10, 2, 1, '2025-10-13', '09:00:00', '09:30:00', 'Credit Card', 'Blood Work Review', 'Confirmed'),
(1, 6, 1, '2025-10-13', '11:00:00', '11:30:00', 'Insurance', 'Headache Assessment', 'Confirmed'),
(4, 1, 2, '2025-10-13', '14:00:00', '14:30:00', 'Cash', 'Routine Cardio Checkup', 'Pending'),

-- Next week appointments
(6, 4, 1, '2025-10-14', '08:00:00', '08:30:00', 'Insurance', 'Physical Therapy Follow-up', 'Confirmed'),
(8, 5, 2, '2025-10-14', '13:00:00', '13:30:00', 'Card', 'Dermatology Follow-up', 'Confirmed'),
(9, 7, 1, '2025-10-15', '10:00:00', '10:30:00', 'Insurance', 'Therapy Session', 'Confirmed'),
(10, 2, 1, '2025-10-15', '15:00:00', '15:30:00', 'Cash', 'Cholesterol Check', 'Pending'),

-- Future appointments
(3, 3, 2, '2025-10-18', '10:00:00', '10:30:00', 'Insurance', 'Pediatric Checkup', 'Confirmed'),
(7, 3, 2, '2025-10-20', '11:00:00', '11:30:00', 'Credit Card', 'Vaccination', 'Pending'),
(2, 2, 1, '2025-10-22', '09:30:00', '10:00:00', 'Cash', 'Diabetes Management', 'Pending'),
(5, 2, 1, '2025-10-25', '14:00:00', '14:30:00', 'Insurance', 'Thyroid Levels Review', 'Pending');

INSERT INTO `Medical_Report` (`patient_id`, `booking_id`, `doctor_id`, `admin_id`, `report_type`, `report_date`, `diagnosis`, `treatment_plan`, `tests_recommended`, `followup_date`, `notes`) VALUES
(1, 1, 1, 1, 'Blood Test Results', '2025-10-01', 'Blood pressure stable', 'Continue current medication', 'Annual physical next year', '2026-10-01', 'Patient shows healthy indicators'),
(2, 2, 2, 1, 'Diabetes Review', '2025-10-03', 'Blood sugar levels improving', 'Continue current treatment plan', 'HbA1c in 3 months', '2026-01-03', 'Diet compliance good'),
(3, 3, 3, 2, 'Respiratory Checkup', '2025-10-05', 'Asthma well controlled', 'Continue current inhaler regimen', 'None', '2026-04-05', 'No recent attacks'),
(4, 4, 1, 2, 'Cardiac Screening', '2025-10-11', 'Normal cardiac rhythm', 'No intervention needed', 'Stress test if symptoms worsen', NULL, 'Heart health excellent'),
(5, 5, 2, 1, 'General Physical', '2025-10-11', 'Overall health good', 'Continue healthy lifestyle', 'Annual checkup next year', '2026-10-11', 'All vitals normal');

INSERT INTO `Prescription` (`patient_id`, `doctor_id`, `booking_id`, `medication_name`, `dosage`, `frequency`, `duration`, `quantity`, `refills`, `instructions`, `prescribed_date`, `start_date`, `status`) VALUES
(1, 1, 1, 'Lisinopril', '10mg', 'Once daily', '90 days', 90, 3, 'Take in the morning with water', '2025-10-01', '2025-10-01', 'Active'),
(2, 2, 2, 'Metformin', '500mg', 'Twice daily', '90 days', 180, 3, 'Take with meals', '2025-10-03', '2025-10-03', 'Active'),
(3, 3, 3, 'Albuterol Inhaler', '90mcg', 'As needed', '90 days', 1, 2, 'Use as needed for breathing', '2025-10-05', '2025-10-05', 'Active'),
(4, 1, 4, 'Aspirin', '81mg', 'Once daily', '90 days', 90, 3, 'Take with food', '2025-10-11', '2025-10-11', 'Active'),
(5, 2, 5, 'Vitamin D3', '1000IU', 'Once daily', '90 days', 90, 3, 'Take with food', '2025-10-11', '2025-10-11', 'Active');

INSERT INTO `Doctor_Availability` (`doctor_id`, `day_of_week`, `start_time`, `end_time`) VALUES
-- Dr. Anderson (Cardiologist)
(1, 1, '09:00:00', '17:00:00'), (1, 2, '09:00:00', '17:00:00'), (1, 3, '09:00:00', '17:00:00'),
(1, 4, '09:00:00', '17:00:00'), (1, 5, '09:00:00', '17:00:00'),
-- Dr. Williams (GP)
(2, 1, '08:00:00', '16:00:00'), (2, 2, '08:00:00', '16:00:00'), (2, 3, '08:00:00', '16:00:00'),
(2, 4, '08:00:00', '16:00:00'), (2, 5, '08:00:00', '16:00:00'),
-- Dr. Davis (Pediatrician)
(3, 1, '10:00:00', '18:00:00'), (3, 2, '10:00:00', '18:00:00'), (3, 3, '10:00:00', '18:00:00'),
(3, 4, '10:00:00', '18:00:00'), (3, 5, '10:00:00', '18:00:00'), (3, 6, '10:00:00', '14:00:00'),
-- Dr. Thompson (Orthopedic Surgeon)
(4, 1, '07:00:00', '15:00:00'), (4, 2, '07:00:00', '15:00:00'), (4, 3, '07:00:00', '15:00:00'),
(4, 4, '07:00:00', '15:00:00'), (4, 5, '07:00:00', '15:00:00'),
-- Dr. Nguyen (Dermatologist)
(5, 1, '09:00:00', '17:00:00'), (5, 2, '09:00:00', '17:00:00'), (5, 3, '09:00:00', '17:00:00'),
(5, 4, '09:00:00', '17:00:00'), (5, 5, '09:00:00', '17:00:00'),
-- Dr. Patel (Neurologist)
(6, 1, '08:00:00', '18:00:00'), (6, 2, '08:00:00', '18:00:00'),
(6, 3, '08:00:00', '18:00:00'), (6, 4, '08:00:00', '18:00:00'),
-- Dr. Johnson (Psychiatrist)
(7, 1, '10:00:00', '18:00:00'), (7, 2, '10:00:00', '18:00:00'), (7, 3, '10:00:00', '18:00:00'),
(7, 4, '10:00:00', '18:00:00'), (7, 5, '10:00:00', '18:00:00'),
-- Dr. Garcia (Oncologist)
(8, 2, '09:00:00', '17:00:00'), (8, 3, '09:00:00', '17:00:00'), (8, 4, '09:00:00', '17:00:00'),
(8, 5, '09:00:00', '17:00:00'), (8, 6, '09:00:00', '17:00:00');

INSERT INTO `Invoice` (`patient_id`, `doctor_id`, `booking_id`, `invoice_number`, `invoice_date`, `due_date`, `payment_method`, `payment_status`, `subtotal`, `tax`, `discount`, `total_amount`, `amount_paid`, `notes`) VALUES
(1, 1, 1, 'INV-20251001-0001', '2025-10-01', '2025-11-01', 'Card', 'Paid', 150.00, 15.00, 0.00, 165.00, 165.00, 'Hypertension follow-up consultation'),
(2, 2, 2, 'INV-20251003-0002', '2025-10-03', '2025-11-03', 'Cash', 'Paid', 120.00, 12.00, 0.00, 132.00, 132.00, 'Diabetes review and consultation'),
(3, 3, 3, 'INV-20251005-0003', '2025-10-05', '2025-11-05', 'Insurance', 'Paid', 100.00, 10.00, 0.00, 110.00, 110.00, 'Asthma checkup'),
(4, 1, 4, 'INV-20251011-0004', '2025-10-11', '2025-11-11', 'Card', 'Paid', 200.00, 20.00, 10.00, 210.00, 210.00, 'Cardiac screening and ECG'),
(5, 2, 5, 'INV-20251011-0005', '2025-10-11', '2025-11-11', 'Cash', 'Paid', 100.00, 10.00, 0.00, 110.00, 110.00, 'General physical examination'),
(6, 4, 6, 'INV-20251012-0006', '2025-10-12', '2025-11-12', 'Insurance', 'Pending', 180.00, 18.00, 0.00, 198.00, 0.00, 'Knee pain evaluation'),
(8, 5, 8, 'INV-20251012-0007', '2025-10-12', '2025-11-12', 'Cash', 'Pending', 130.00, 13.00, 0.00, 143.00, 0.00, 'Skin rash consultation');

INSERT INTO `Invoice_Item` (`invoice_id`, `description`, `quantity`, `unit_price`, `amount`) VALUES
-- Invoice 1 items
(1, 'Cardiology Consultation', 1, 100.00, 100.00),
(1, 'Blood Pressure Check', 1, 25.00, 25.00),
(1, 'General Physical Exam', 1, 25.00, 25.00),
-- Invoice 2 items
(2, 'Medical Consultation', 1, 100.00, 100.00),
(2, 'Blood Glucose Test', 1, 20.00, 20.00),
-- Invoice 3 items
(3, 'Pediatric Consultation', 1, 100.00, 100.00),
-- Invoice 4 items
(4, 'Cardiac Consultation', 1, 150.00, 150.00),
(4, 'ECG Test', 1, 50.00, 50.00),
-- Invoice 5 items
(5, 'General Consultation', 1, 100.00, 100.00),
-- Invoice 6 items
(6, 'Orthopedic Consultation', 1, 150.00, 150.00),
(6, 'Physical Examination', 1, 30.00, 30.00),
-- Invoice 7 items
(7, 'Dermatology Consultation', 1, 100.00, 100.00),
(7, 'Skin Examination', 1, 30.00, 30.00);

-- ====================================
-- SICK NOTES DATA
-- ====================================
INSERT INTO `sick_note` (`patient_id`, `doctor_id`, `issue_date`, `start_date`, `end_date`, `diagnosis`, `recommendations`, `restrictions`, `can_return_work`, `additional_notes`, `status`) VALUES
(1, 1, '2024-01-15', '2024-01-15', '2024-01-22', 'Acute Upper Respiratory Infection', 'Rest, plenty of fluids, and take prescribed antibiotics as directed.', 'No strenuous physical activity. Avoid cold environments.', FALSE, 'Patient should follow up if symptoms worsen or persist beyond 7 days.', 'Active'),
(2, 2, '2024-02-10', '2024-02-10', '2024-02-17', 'Influenza Type A', 'Complete bed rest for 5 days. Take antiviral medication as prescribed.', 'Stay home and avoid contact with others to prevent spread. No work or school.', FALSE, 'Patient is contagious. Isolation recommended for at least 5 days.', 'Active'),
(3, 3, '2024-03-05', '2024-03-05', '2024-03-12', 'Gastroenteritis', 'Oral rehydration therapy. Bland diet (BRAT - Bananas, Rice, Applesauce, Toast).', 'Avoid dairy products, fatty foods, and caffeinated beverages.', FALSE, 'Monitor for signs of dehydration. Return to clinic if vomiting persists.', 'Active'),
(4, 1, '2024-01-20', '2024-01-20', '2024-02-20', 'Post-Surgical Recovery - Appendectomy', 'Gradual return to normal activities over 4-6 weeks. Wound care as instructed.', 'No heavy lifting over 10 lbs for 4 weeks. Avoid driving while on pain medication.', TRUE, 'May return to light desk work after 2 weeks with medical clearance.', 'Active'),
(5, 4, '2023-12-01', '2023-12-01', '2023-12-15', 'Severe Migraine with Aura', 'Rest in dark, quiet room. Take prescribed migraine medication at onset of symptoms.', 'Avoid bright lights, loud noises, and screen time.', FALSE, 'Patient has been experiencing chronic migraines. Neurology referral provided.', 'Expired'),
(6, 5, '2024-02-28', '2024-02-28', '2024-03-07', 'Lower Back Strain', 'Physical therapy exercises as demonstrated. Apply ice for first 48 hours, then heat.', 'No bending, twisting, or lifting. Avoid prolonged sitting or standing.', FALSE, 'Patient should attend physical therapy sessions twice weekly.', 'Active'),
(7, 6, '2024-03-10', '2024-03-10', '2024-03-24', 'Severe Anxiety Episode', 'Medication adjustment. Daily mindfulness exercises and therapy sessions.', 'Reduced work hours recommended. Avoid high-stress situations.', TRUE, 'Patient may return to work part-time after one week with modified duties.', 'Active'),
(8, 2, '2024-01-25', '2024-01-25', '2024-02-01', 'Conjunctivitis (Pink Eye)', 'Use antibiotic eye drops as prescribed. Maintain good hand hygiene.', 'No swimming or contact lens use until fully healed.', TRUE, 'Condition is contagious. May return to work after 48 hours of treatment.', 'Expired'),
(9, 7, '2024-03-01', '2024-03-01', '2024-03-15', 'Chemotherapy Side Effects - Fatigue', 'Rest as needed. Maintain nutrition with small, frequent meals.', 'Avoid crowds and sick individuals due to compromised immune system.', FALSE, 'Ongoing cancer treatment. Patient requires flexible work arrangements.', 'Active'),
(10, 3, '2024-02-15', '2024-02-15', '2024-02-22', 'Food Poisoning (Salmonella)', 'Clear liquids for 24 hours, then gradual reintroduction of bland foods.', 'Strict hand washing. Avoid preparing food for others.', FALSE, 'Symptoms should improve within 5-7 days. Monitor for fever or blood in stool.', 'Active');

-- ====================================
-- SUPPORT TICKETS DATA
-- ====================================
INSERT INTO `Support_Ticket` (`patient_id`, `subject`, `description`, `priority`, `status`, `admin_response`, `admin_id`, `responded_at`, `created_at`, `updated_at`) VALUES
(1, 'Unable to book appointment online', 'I am trying to book an appointment with Dr. Smith but the system keeps showing an error message saying "No available slots". I need to see a cardiologist urgently.', 'High', 'Resolved', 'Hello John, we apologize for the inconvenience. The issue was due to Dr. Smith being fully booked for the next two weeks. We have added you to the waiting list and Dr. Williams (also a cardiologist) has availability this Thursday at 2 PM. Please confirm if this works for you.', 1, '2024-03-11 10:30:00', '2024-03-10 15:45:00', '2024-03-11 10:30:00'),
(2, 'Question about my prescription refill', 'My prescription for diabetes medication is about to run out. Can I get a refill without visiting the clinic? I have been on the same medication for 2 years.', 'Medium', 'Resolved', 'Hi Jane, we can arrange a prescription refill for your diabetes medication. However, since it has been over 6 months since your last check-up, we recommend scheduling a quick consultation to review your treatment plan. This can be done via telemedicine. Please call our pharmacy desk at ext. 123.', 1, '2024-03-09 14:20:00', '2024-03-08 09:15:00', '2024-03-09 14:20:00'),
(3, 'Medical records request', 'I need a copy of my medical records from the past 5 years for a second opinion consultation. How can I obtain these documents?', 'Low', 'Resolved', 'Dear Michael, you can request your medical records by filling out the Medical Records Release Form available in our patient portal. Processing typically takes 5-7 business days. There is a $25 processing fee for records older than 2 years. If you need them urgently, please visit our records office.', 1, '2024-03-07 11:00:00', '2024-03-06 16:30:00', '2024-03-07 11:00:00'),
(4, 'Billing inquiry - duplicate charge', 'I was charged twice for my appointment on February 15th. My credit card shows two charges of $150 each. Please investigate and refund the duplicate charge.', 'Urgent', 'Resolved', 'Hello Emily, we sincerely apologize for this billing error. We have identified the duplicate charge in our system. A full refund of $150 has been processed to your credit card ending in 4532. Please allow 3-5 business days for the refund to appear. We have also added a $20 credit to your account for the inconvenience.', 2, '2024-03-05 09:45:00', '2024-03-04 13:20:00', '2024-03-05 09:45:00'),
(5, 'Lab results not available in portal', 'I had blood work done on March 1st and was told results would be available in 48 hours. It has been 5 days and I still cannot see them in my patient portal.', 'High', 'Resolved', 'Hi David, we apologize for the delay. There was a technical issue with uploading lab results to the portal. Your results are now available and show all values within normal range. Dr. Johnson has also added a note to your chart. If you have questions, please schedule a follow-up call.', 1, '2024-03-08 15:30:00', '2024-03-07 08:45:00', '2024-03-08 15:30:00'),
(6, 'Need to reschedule appointment', 'I have an appointment scheduled for March 20th at 10 AM but I have a work conflict. Can I reschedule to the following week?', 'Low', 'In Progress', NULL, NULL, NULL, '2024-03-12 11:15:00', '2024-03-12 11:15:00'),
(7, 'Insurance coverage question', 'My insurance company is requesting additional documentation for my recent surgery. What documents do I need to provide to the billing department?', 'Medium', 'Open', NULL, NULL, NULL, '2024-03-13 10:00:00', '2024-03-13 10:00:00'),
(8, 'Medication side effects concern', 'I started the new blood pressure medication prescribed by Dr. Williams and have been experiencing dizziness and fatigue. Should I continue taking it?', 'Urgent', 'Open', NULL, NULL, NULL, '2024-03-13 14:30:00', '2024-03-13 14:30:00'),
(9, 'Referral to specialist needed', 'My doctor mentioned I should see a neurologist for my recurring headaches but I have not received the referral paperwork yet. Can you help expedite this?', 'High', 'Open', NULL, NULL, NULL, '2024-03-13 09:20:00', '2024-03-13 09:20:00'),
(10, 'Portal login issues', 'I forgot my password and the reset email is not arriving. I have checked spam folder. Can you reset my account?', 'Medium', 'Open', NULL, NULL, NULL, '2024-03-13 16:45:00', '2024-03-13 16:45:00');

-- ====================================
-- ADDITIONAL PRESCRIPTIONS DATA
-- ====================================
INSERT INTO `Prescription` (`patient_id`, `doctor_id`, `booking_id`, `medication_name`, `dosage`, `frequency`, `duration`, `quantity`, `refills`, `instructions`, `prescribed_date`, `start_date`, `end_date`, `status`, `notes`) VALUES
(6, 5, 6, 'Ibuprofen', '400mg', 'Three times daily', '14 days', 42, 0, 'Take with food to avoid stomach upset. For back pain relief.', '2024-02-28', '2024-02-28', '2024-03-13', 'Active', 'Patient has mild back strain from exercise'),
(7, 6, 7, 'Sertraline', '50mg', 'Once daily', 'Ongoing', 30, 3, 'Take in the morning with or without food. Do not stop abruptly.', '2024-03-10', '2024-03-10', NULL, 'Active', 'For anxiety management. Follow-up in 6 weeks'),
(8, 2, NULL, 'Erythromycin Eye Ointment', '0.5%', 'Apply to affected eye 4 times daily', '7 days', 1, 0, 'Wash hands before and after application. Do not wear contact lenses during treatment.', '2024-01-25', '2024-01-25', '2024-02-01', 'Completed', 'For bacterial conjunctivitis'),
(9, 7, NULL, 'Ondansetron', '8mg', 'As needed for nausea', '30 days', 30, 2, 'Dissolve on tongue 30 minutes before chemotherapy. Maximum 3 tablets per day.', '2024-03-01', '2024-03-01', '2024-03-31', 'Active', 'Anti-nausea medication for chemo side effects'),
(10, 3, NULL, 'Loperamide', '2mg', 'After each loose stool, max 8mg/day', '5 days', 12, 0, 'Take with water. Stop when diarrhea resolves or after 2 days of no symptoms.', '2024-02-15', '2024-02-15', '2024-02-20', 'Completed', 'For acute diarrhea from food poisoning'),
(1, 1, 1, 'Azithromycin', '500mg', 'Once daily', '5 days', 5, 0, 'Take on empty stomach, 1 hour before or 2 hours after meals.', '2024-01-15', '2024-01-15', '2024-01-20', 'Completed', 'Antibiotic for respiratory infection'),
(2, 2, 2, 'Oseltamivir (Tamiflu)', '75mg', 'Twice daily', '5 days', 10, 0, 'Start within 48 hours of symptom onset for maximum effectiveness.', '2024-02-10', '2024-02-10', '2024-02-15', 'Completed', 'Antiviral for influenza'),
(3, 3, 3, 'Promethazine', '25mg', 'Every 4-6 hours as needed', '3 days', 12, 0, 'May cause drowsiness. Do not drive or operate machinery.', '2024-03-05', '2024-03-05', '2024-03-08', 'Completed', 'Anti-nausea for gastroenteritis'),
(4, 1, 4, 'Hydrocodone-Acetaminophen', '5-325mg', 'Every 6 hours as needed', '7 days', 28, 0, 'For pain management post-surgery. Do not exceed 4000mg acetaminophen per day.', '2024-01-20', '2024-01-20', '2024-01-27', 'Completed', 'Post-operative pain control'),
(5, 4, 5, 'Sumatriptan', '100mg', 'At onset of migraine', '30 days', 9, 2, 'Take at first sign of migraine. May repeat once after 2 hours if needed.', '2023-12-01', '2023-12-01', '2023-12-31', 'Discontinued', 'Migraine abortive medication');


SELECT 'Improved Database Schema Created Successfully!' AS Message;
SELECT '
KEY IMPROVEMENTS:
1. NO Medical_Record table - the medical record is a VIRTUAL CONCEPT
2. Renamed tables for clarity:
   - Allergy → Patient_Allergy
   - Existing_Conditions → Patient_Condition
   - Medicine → Patient_Medicine
3. Fixed many-to-one medicine/condition issue
4. Clear distinction:
   - Medical_Report = individual document (lab, X-ray, etc.)
   - Medical Record = ALL health data combined (virtual, queried via views)
5. Added comprehensive views including View_Complete_Medical_Record
6. Fixed column naming (allergen vs allergy_name)
7. Added proper indexes and status tracking
8. Included sample data for all tables

ACCESSING THE MEDICAL RECORD:
- Use View_Complete_Medical_Record for summary
- Join Patient with Patient_Allergy, Patient_Condition, etc. for details
- Medical_Report table contains individual encounter documents
' AS Summary;

SELECT COUNT(*) AS 'Total Patients' FROM Patient;
SELECT COUNT(*) AS 'Total Doctors' FROM Doctor;
SELECT COUNT(*) AS 'Total Admins' FROM Admin;
SELECT COUNT(*) AS 'Total Bookings' FROM Booking;
SELECT COUNT(*) AS 'Total Allergies' FROM Patient_Allergy;
SELECT COUNT(*) AS 'Total Conditions' FROM Patient_Condition;
SELECT COUNT(*) AS 'Total Current Medications' FROM Patient_Medicine WHERE status = 'Active';
SELECT COUNT(*) AS 'Total Medical Reports' FROM Medical_Report;
SELECT COUNT(*) AS 'Total Prescriptions' FROM Prescription;
SELECT COUNT(*) AS 'Active Prescriptions' FROM Prescription WHERE status = 'Active';
SELECT COUNT(*) AS 'Total Invoices' FROM Invoice;
SELECT COUNT(*) AS 'Total Invoice Items' FROM Invoice_Item;
SELECT COUNT(*) AS 'Paid Invoices' FROM Invoice WHERE payment_status = 'Paid';
SELECT COUNT(*) AS 'Pending Invoices' FROM Invoice WHERE payment_status = 'Pending';
SELECT COUNT(*) AS 'Total Sick Notes' FROM sick_note;
SELECT COUNT(*) AS 'Active Sick Notes' FROM sick_note WHERE status = 'Active';
SELECT COUNT(*) AS 'Total Support Tickets' FROM Support_Ticket;
SELECT COUNT(*) AS 'Open Support Tickets' FROM Support_Ticket WHERE status IN ('Open', 'In Progress');
SELECT COUNT(*) AS 'Resolved Support Tickets' FROM Support_Ticket WHERE status = 'Resolved';

SET FOREIGN_KEY_CHECKS=1;