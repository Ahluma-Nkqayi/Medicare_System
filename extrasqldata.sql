
USE medical_db;

-- Add more bookings for Dr. Anderson
INSERT INTO `Booking` (`patient_id`, `doctor_id`, `admin_id`, `booking_date`, `booking_time`, `end_time`, `payment_method`, `reason_for_visit`, `status`) VALUES

(3, 1, 1, '2025-09-15', '09:00:00', '09:30:00', 'Insurance', 'Cardiac Consultation', 'Completed'),
(5, 1, 2, '2025-09-20', '10:00:00', '10:30:00', 'Credit Card', 'Blood Pressure Follow-up', 'Completed'),
(7, 1, 1, '2025-09-25', '14:00:00', '14:30:00', 'Cash', 'Heart Palpitations', 'Completed'),
(9, 1, 2, '2025-09-28', '11:00:00', '11:30:00', 'Insurance', 'Chest Pain Evaluation', 'Completed'),

(2, 1, 1, '2025-10-02', '08:30:00', '09:00:00', 'Credit Card', 'Routine Cardiac Checkup', 'Completed'),
(4, 1, 2, '2025-10-04', '15:00:00', '15:30:00', 'Insurance', 'ECG Follow-up', 'Completed'),
(6, 1, 1, '2025-10-06', '10:30:00', '11:00:00', 'Cash', 'Hypertension Management', 'Completed'),
(8, 1, 2, '2025-10-08', '13:00:00', '13:30:00', 'Credit Card', 'Cardiac Risk Assessment', 'Completed'),
(10, 1, 1, '2025-10-09', '09:30:00', '10:00:00', 'Insurance', 'Stress Test Results', 'Completed'),

(3, 1, 2, '2025-10-11', '08:00:00', '08:30:00', 'Credit Card', 'Arrhythmia Follow-up', 'Completed'),
(5, 1, 1, '2025-10-11', '10:30:00', '11:00:00', 'Insurance', 'Cholesterol Management', 'Completed'),
(7, 1, 2, '2025-10-11', '15:30:00', '16:00:00', 'Cash', 'Post-Surgery Checkup', 'Completed'),

(2, 1, 1, '2025-10-12', '08:00:00', '08:30:00', 'Insurance', 'Morning Cardiac Consultation', 'Completed'),
(4, 1, 2, '2025-10-12', '11:00:00', '11:30:00', 'Credit Card', 'Blood Pressure Check', 'Confirmed'),
(6, 1, 1, '2025-10-12', '13:00:00', '13:30:00', 'Cash', 'Heart Health Review', 'Confirmed'),
(8, 1, 2, '2025-10-12', '16:00:00', '16:30:00', 'Insurance', 'Medication Review', 'Confirmed'),
(10, 1, 1, '2025-10-12', '17:00:00', '17:30:00', 'Credit Card', 'Evening Consultation', 'Pending'),

(1, 1, 2, '2025-10-13', '08:00:00', '08:30:00', 'Insurance', 'Hypertension Follow-up', 'Confirmed'),
(3, 1, 1, '2025-10-13', '09:30:00', '10:00:00', 'Credit Card', 'Cardiac Screening', 'Confirmed'),
(5, 1, 2, '2025-10-13', '12:00:00', '12:30:00', 'Cash', 'Heart Rhythm Check', 'Confirmed'),
(7, 1, 1, '2025-10-13', '15:00:00', '15:30:00', 'Insurance', 'Cardiovascular Assessment', 'Pending'),
(9, 1, 2, '2025-10-13', '16:30:00', '17:00:00', 'Credit Card', 'Routine Checkup', 'Pending'),

(2, 1, 1, '2025-10-14', '09:00:00', '09:30:00', 'Insurance', 'Post-Treatment Follow-up', 'Confirmed'),
(4, 1, 2, '2025-10-14', '14:00:00', '14:30:00', 'Cash', 'Blood Work Review', 'Confirmed'),
(6, 1, 1, '2025-10-15', '10:00:00', '10:30:00', 'Credit Card', 'Cardiac Risk Evaluation', 'Confirmed'),
(8, 1, 2, '2025-10-15', '13:30:00', '14:00:00', 'Insurance', 'Heart Health Monitoring', 'Confirmed'),
(10, 1, 1, '2025-10-16', '11:00:00', '11:30:00', 'Cash', 'Hypertension Review', 'Confirmed'),
(1, 1, 2, '2025-10-16', '15:00:00', '15:30:00', 'Credit Card', 'Annual Physical', 'Confirmed'),
(3, 1, 1, '2025-10-17', '09:00:00', '09:30:00', 'Insurance', 'Chest Pain Follow-up', 'Pending'),
(5, 1, 2, '2025-10-17', '14:30:00', '15:00:00', 'Cash', 'Medication Adjustment', 'Pending'),
(7, 1, 1, '2025-10-18', '10:30:00', '11:00:00', 'Credit Card', 'Cardiovascular Consultation', 'Pending'),

(9, 1, 2, '2025-10-19', '08:30:00', '09:00:00', 'Insurance', 'Quarterly Checkup', 'Pending'),
(2, 1, 1, '2025-10-21', '13:00:00', '13:30:00', 'Cash', 'Blood Pressure Management', 'Pending'),
(4, 1, 2, '2025-10-22', '11:00:00', '11:30:00', 'Credit Card', 'Heart Health Assessment', 'Pending'),
(6, 1, 1, '2025-10-23', '15:00:00', '15:30:00', 'Insurance', 'Follow-up Consultation', 'Pending'),
(8, 1, 2, '2025-10-24', '09:30:00', '10:00:00', 'Cash', 'Cardiac Monitoring', 'Pending'),
(10, 1, 1, '2025-10-25', '14:00:00', '14:30:00', 'Credit Card', 'Routine Heart Checkup', 'Pending'),
(1, 1, 2, '2025-10-28', '10:00:00', '10:30:00', 'Insurance', 'Monthly Review', 'Pending'),
(3, 1, 1, '2025-10-29', '13:30:00', '14:00:00', 'Cash', 'Cardiovascular Screening', 'Pending'),
(5, 1, 2, '2025-10-30', '11:30:00', '12:00:00', 'Credit Card', 'Health Maintenance', 'Pending'),
(7, 1, 1, '2025-10-31', '16:00:00', '16:30:00', 'Insurance', 'End of Month Checkup', 'Pending');

INSERT INTO `Medical_Report` (`patient_id`, `booking_id`, `doctor_id`, `admin_id`, `report_type`, `report_date`, `diagnosis`, `treatment_plan`, `tests_recommended`, `followup_date`, `notes`) VALUES
-- September reports
(3, (SELECT booking_id FROM Booking WHERE patient_id = 3 AND doctor_id = 1 AND booking_date = '2025-09-15' LIMIT 1), 1, 1, 'Cardiac Consultation', '2025-09-15', 'Mild tachycardia observed', 'Prescribed beta-blockers, lifestyle modifications', 'Holter monitor in 2 weeks', '2025-09-29', 'Patient advised to reduce caffeine intake'),
(5, (SELECT booking_id FROM Booking WHERE patient_id = 5 AND doctor_id = 1 AND booking_date = '2025-09-20' LIMIT 1), 1, 2, 'Blood Pressure Check', '2025-09-20', 'Blood pressure elevated at 145/92', 'Increased medication dosage', 'BP monitoring at home', '2025-10-20', 'Patient responsive to treatment'),
(7, (SELECT booking_id FROM Booking WHERE patient_id = 7 AND doctor_id = 1 AND booking_date = '2025-09-25' LIMIT 1), 1, 1, 'Cardiac Evaluation', '2025-09-25', 'Palpitations likely stress-related', 'Stress management techniques, follow-up if symptoms persist', 'None required at this time', '2025-10-25', 'No structural abnormalities detected'),
(9, (SELECT booking_id FROM Booking WHERE patient_id = 9 AND doctor_id = 1 AND booking_date = '2025-09-28' LIMIT 1), 1, 2, 'Chest Pain Assessment', '2025-09-28', 'Non-cardiac chest pain, likely musculoskeletal', 'Anti-inflammatory medication, physical therapy', 'X-ray completed, normal results', NULL, 'Referred to physical therapist'),

(2, (SELECT booking_id FROM Booking WHERE patient_id = 2 AND doctor_id = 1 AND booking_date = '2025-10-02' LIMIT 1), 1, 1, 'Routine Checkup', '2025-10-02', 'Overall cardiac health good', 'Continue current medication regimen', 'Annual stress test scheduled', '2026-04-02', 'Patient maintaining healthy lifestyle'),
(4, (SELECT booking_id FROM Booking WHERE patient_id = 4 AND doctor_id = 1 AND booking_date = '2025-10-04' LIMIT 1), 1, 2, 'ECG Follow-up', '2025-10-04', 'ECG shows normal sinus rhythm', 'No changes to treatment plan', 'Repeat ECG in 6 months', '2026-04-04', 'Marked improvement from previous readings'),
(6, (SELECT booking_id FROM Booking WHERE patient_id = 6 AND doctor_id = 1 AND booking_date = '2025-10-06' LIMIT 1), 1, 1, 'Hypertension Management', '2025-10-06', 'BP controlled at 128/82', 'Continue current medications', 'Quarterly BP check', '2026-01-06', 'Excellent medication compliance'),
(8, (SELECT booking_id FROM Booking WHERE patient_id = 8 AND doctor_id = 1 AND booking_date = '2025-10-08' LIMIT 1), 1, 2, 'Risk Assessment', '2025-10-08', 'Moderate cardiovascular risk', 'Statin therapy initiated, diet counseling', 'Lipid panel in 3 months', '2026-01-08', 'Discussed family history of heart disease'),
(10, (SELECT booking_id FROM Booking WHERE patient_id = 10 AND doctor_id = 1 AND booking_date = '2025-10-09' LIMIT 1), 1, 1, 'Stress Test Results', '2025-10-09', 'Stress test shows good cardiac capacity', 'Cleared for moderate exercise program', 'None required', '2026-04-09', 'Patient achieved 10 METS without symptoms'),

(3, (SELECT booking_id FROM Booking WHERE patient_id = 3 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '08:00:00' LIMIT 1), 1, 2, 'Arrhythmia Follow-up', '2025-10-11', 'Arrhythmia well controlled with medication', 'Continue current treatment', 'Holter monitor results reviewed', '2026-01-11', 'No episodes in past 2 weeks'),
(5, (SELECT booking_id FROM Booking WHERE patient_id = 5 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '10:30:00' LIMIT 1), 1, 1, 'Cholesterol Management', '2025-10-11', 'LDL reduced to 95 mg/dL', 'Continue statin therapy', 'Lipid panel in 6 months', '2026-04-11', 'Excellent response to treatment'),
(7, (SELECT booking_id FROM Booking WHERE patient_id = 7 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '15:30:00' LIMIT 1), 1, 2, 'Post-Surgery Checkup', '2025-10-11', 'Healing well post-angioplasty', 'Dual antiplatelet therapy, cardiac rehab', 'Echocardiogram in 1 month', '2025-11-11', 'Patient recovering ahead of schedule'),

(2, (SELECT booking_id FROM Booking WHERE patient_id = 2 AND doctor_id = 1 AND booking_date = '2025-10-12' AND booking_time = '08:00:00' LIMIT 1), 1, 1, 'Morning Consultation', '2025-10-12', 'Routine cardiac health check completed', 'All parameters within normal range', 'Continue preventive care', '2026-04-12', 'Patient in excellent cardiac health');

INSERT INTO `Prescription` (`patient_id`, `doctor_id`, `booking_id`, `medication_name`, `dosage`, `frequency`, `duration`, `quantity`, `refills`, `instructions`, `prescribed_date`, `start_date`, `status`) VALUES
-- Recent prescriptions
(3, 1, (SELECT booking_id FROM Booking WHERE patient_id = 3 AND doctor_id = 1 AND booking_date = '2025-09-15' LIMIT 1), 'Metoprolol', '50mg', 'Twice daily', '90 days', 180, 3, 'Take with food, do not stop abruptly', '2025-09-15', '2025-09-15', 'Active'),
(5, 1, (SELECT booking_id FROM Booking WHERE patient_id = 5 AND doctor_id = 1 AND booking_date = '2025-09-20' LIMIT 1), 'Amlodipine', '10mg', 'Once daily', '90 days', 90, 3, 'Take in the morning', '2025-09-20', '2025-09-20', 'Active'),
(7, 1, (SELECT booking_id FROM Booking WHERE patient_id = 7 AND doctor_id = 1 AND booking_date = '2025-09-25' LIMIT 1), 'Ibuprofen', '400mg', 'Three times daily', '14 days', 42, 0, 'Take with food', '2025-09-25', '2025-09-25', 'Completed'),
(9, 1, (SELECT booking_id FROM Booking WHERE patient_id = 9 AND doctor_id = 1 AND booking_date = '2025-09-28' LIMIT 1), 'Naproxen', '500mg', 'Twice daily', '30 days', 60, 1, 'Take with meals', '2025-09-28', '2025-09-28', 'Active'),
(2, 1, (SELECT booking_id FROM Booking WHERE patient_id = 2 AND doctor_id = 1 AND booking_date = '2025-10-02' LIMIT 1), 'Aspirin', '81mg', 'Once daily', '90 days', 90, 3, 'Take with morning meal', '2025-10-02', '2025-10-02', 'Active'),
(4, 1, (SELECT booking_id FROM Booking WHERE patient_id = 4 AND doctor_id = 1 AND booking_date = '2025-10-04' LIMIT 1), 'Carvedilol', '6.25mg', 'Twice daily', '90 days', 180, 3, 'Take with food', '2025-10-04', '2025-10-04', 'Active'),
(6, 1, (SELECT booking_id FROM Booking WHERE patient_id = 6 AND doctor_id = 1 AND booking_date = '2025-10-06' LIMIT 1), 'Lisinopril', '20mg', 'Once daily', '90 days', 90, 3, 'Take in the morning', '2025-10-06', '2025-10-06', 'Active'),
(8, 1, (SELECT booking_id FROM Booking WHERE patient_id = 8 AND doctor_id = 1 AND booking_date = '2025-10-08' LIMIT 1), 'Atorvastatin', '40mg', 'Once daily', '90 days', 90, 3, 'Take at bedtime', '2025-10-08', '2025-10-08', 'Active'),
(10, 1, (SELECT booking_id FROM Booking WHERE patient_id = 10 AND doctor_id = 1 AND booking_date = '2025-10-09' LIMIT 1), 'Clopidogrel', '75mg', 'Once daily', '90 days', 90, 3, 'Take with or without food', '2025-10-09', '2025-10-09', 'Active'),
(3, 1, (SELECT booking_id FROM Booking WHERE patient_id = 3 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '08:00:00' LIMIT 1), 'Warfarin', '5mg', 'Once daily', '90 days', 90, 3, 'Take at same time daily, monitor INR', '2025-10-11', '2025-10-11', 'Active'),
(5, 1, (SELECT booking_id FROM Booking WHERE patient_id = 5 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '10:30:00' LIMIT 1), 'Rosuvastatin', '20mg', 'Once daily', '90 days', 90, 3, 'Take in the evening', '2025-10-11', '2025-10-11', 'Active'),
(7, 1, (SELECT booking_id FROM Booking WHERE patient_id = 7 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '15:30:00' LIMIT 1), 'Aspirin', '81mg', 'Once daily', '180 days', 180, 5, 'Long-term antiplatelet therapy', '2025-10-11', '2025-10-11', 'Active'),
(7, 1, (SELECT booking_id FROM Booking WHERE patient_id = 7 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '15:30:00' LIMIT 1), 'Clopidogrel', '75mg', 'Once daily', '365 days', 365, 2, 'Dual antiplatelet therapy post-angioplasty', '2025-10-11', '2025-10-11', 'Active'),
(2, 1, (SELECT booking_id FROM Booking WHERE patient_id = 2 AND doctor_id = 1 AND booking_date = '2025-10-12' AND booking_time = '08:00:00' LIMIT 1), 'Vitamin D3', '2000IU', 'Once daily', '90 days', 90, 3, 'Take with largest meal', '2025-10-12', '2025-10-12', 'Active');

INSERT INTO `Invoice` (`patient_id`, `doctor_id`, `booking_id`, `invoice_number`, `invoice_date`, `due_date`, `payment_method`, `payment_status`, `subtotal`, `tax`, `discount`, `total_amount`, `amount_paid`, `notes`) VALUES
-- September invoices
(3, 1, (SELECT booking_id FROM Booking WHERE patient_id = 3 AND doctor_id = 1 AND booking_date = '2025-09-15' LIMIT 1), 'INV-20250915-0001', '2025-09-15', '2025-10-15', 'Insurance', 'Paid', 250.00, 25.00, 0.00, 275.00, 275.00, 'Cardiac consultation with ECG'),
(5, 1, (SELECT booking_id FROM Booking WHERE patient_id = 5 AND doctor_id = 1 AND booking_date = '2025-09-20' LIMIT 1), 'INV-20250920-0001', '2025-09-20', '2025-10-20', 'Card', 'Paid', 120.00, 12.00, 0.00, 132.00, 132.00, 'Blood pressure follow-up'),
(7, 1, (SELECT booking_id FROM Booking WHERE patient_id = 7 AND doctor_id = 1 AND booking_date = '2025-09-25' LIMIT 1), 'INV-20250925-0001', '2025-09-25', '2025-10-25', 'Cash', 'Paid', 150.00, 15.00, 0.00, 165.00, 165.00, 'Heart palpitations evaluation'),
(9, 1, (SELECT booking_id FROM Booking WHERE patient_id = 9 AND doctor_id = 1 AND booking_date = '2025-09-28' LIMIT 1), 'INV-20250928-0001', '2025-09-28', '2025-10-28', 'Insurance', 'Paid', 200.00, 20.00, 0.00, 220.00, 220.00, 'Chest pain assessment with X-ray'),

(2, 1, (SELECT booking_id FROM Booking WHERE patient_id = 2 AND doctor_id = 1 AND booking_date = '2025-10-02' LIMIT 1), 'INV-20251002-0001', '2025-10-02', '2025-11-02', 'Card', 'Paid', 150.00, 15.00, 10.00, 155.00, 155.00, 'Routine cardiac checkup'),
(4, 1, (SELECT booking_id FROM Booking WHERE patient_id = 4 AND doctor_id = 1 AND booking_date = '2025-10-04' LIMIT 1), 'INV-20251004-0001', '2025-10-04', '2025-11-04', 'Insurance', 'Paid', 180.00, 18.00, 0.00, 198.00, 198.00, 'ECG follow-up consultation'),
(6, 1, (SELECT booking_id FROM Booking WHERE patient_id = 6 AND doctor_id = 1 AND booking_date = '2025-10-06' LIMIT 1), 'INV-20251006-0001', '2025-10-06', '2025-11-06', 'Cash', 'Paid', 130.00, 13.00, 0.00, 143.00, 143.00, 'Hypertension management'),
(8, 1, (SELECT booking_id FROM Booking WHERE patient_id = 8 AND doctor_id = 1 AND booking_date = '2025-10-08' LIMIT 1), 'INV-20251008-0001', '2025-10-08', '2025-11-08', 'Card', 'Paid', 220.00, 22.00, 0.00, 242.00, 242.00, 'Cardiac risk assessment with lipid panel'),
(10, 1, (SELECT booking_id FROM Booking WHERE patient_id = 10 AND doctor_id = 1 AND booking_date = '2025-10-09' LIMIT 1), 'INV-20251009-0001', '2025-10-09', '2025-11-09', 'Insurance', 'Paid', 350.00, 35.00, 20.00, 365.00, 365.00, 'Stress test with interpretation'),
(3, 1, (SELECT booking_id FROM Booking WHERE patient_id = 3 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '08:00:00' LIMIT 1), 'INV-20251011-0001', '2025-10-11', '2025-11-11', 'Card', 'Paid', 170.00, 17.00, 0.00, 187.00, 187.00, 'Arrhythmia follow-up'),
(5, 1, (SELECT booking_id FROM Booking WHERE patient_id = 5 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '10:30:00' LIMIT 1), 'INV-20251011-0002', '2025-10-11', '2025-11-11', 'Insurance', 'Paid', 140.00, 14.00, 0.00, 154.00, 154.00, 'Cholesterol management consultation'),
(7, 1, (SELECT booking_id FROM Booking WHERE patient_id = 7 AND doctor_id = 1 AND booking_date = '2025-10-11' AND booking_time = '15:30:00' LIMIT 1), 'INV-20251011-0003', '2025-10-11', '2025-11-11', 'Cash', 'Paid', 160.00, 16.00, 0.00, 176.00, 176.00, 'Post-surgery checkup'),
(2, 1, (SELECT booking_id FROM Booking WHERE patient_id = 2 AND doctor_id = 1 AND booking_date = '2025-10-12' AND booking_time = '08:00:00' LIMIT 1), 'INV-20251012-0001', '2025-10-12', '2025-11-12', 'Insurance', 'Paid', 150.00, 15.00, 0.00, 165.00, 165.00, 'Morning cardiac consultation');

INSERT INTO `Invoice_Item` (`invoice_id`, `description`, `quantity`, `unit_price`, `amount`) VALUES
-- September invoice items
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20250915-0001'), 'Cardiology Consultation', 1, 150.00, 150.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20250915-0001'), 'ECG Test', 1, 100.00, 100.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20250920-0001'), 'Blood Pressure Consultation', 1, 100.00, 100.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20250920-0001'), 'BP Monitoring Device Setup', 1, 20.00, 20.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20250925-0001'), 'Cardiac Consultation', 1, 150.00, 150.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20250928-0001'), 'Chest Pain Assessment', 1, 150.00, 150.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20250928-0001'), 'Chest X-Ray', 1, 50.00, 50.00),

((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251002-0001'), 'Routine Cardiac Checkup', 1, 150.00, 150.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251004-0001'), 'ECG Follow-up', 1, 100.00, 100.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251004-0001'), 'Consultation', 1, 80.00, 80.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251006-0001'), 'Hypertension Consultation', 1, 100.00, 100.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251006-0001'), 'Blood Pressure Check', 1, 30.00, 30.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251008-0001'), 'Risk Assessment Consultation', 1, 150.00, 150.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251008-0001'), 'Lipid Panel', 1, 70.00, 70.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251009-0001'), 'Stress Test', 1, 300.00, 300.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251009-0001'), 'Test Interpretation', 1, 50.00, 50.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251011-0001'), 'Arrhythmia Consultation', 1, 150.00, 150.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251011-0001'), 'Holter Monitor Review', 1, 20.00, 20.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251011-0002'), 'Cholesterol Management', 1, 100.00, 100.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251011-0002'), 'Lab Review', 1, 40.00, 40.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251011-0003'), 'Post-Surgery Follow-up', 1, 160.00, 160.00),
((SELECT invoice_id FROM Invoice WHERE invoice_number = 'INV-20251012-0001'), 'Cardiac Consultation', 1, 150.00, 150.00);

-- Display summary statistics
SELECT 'Additional data for Dr. Anderson added successfully!' AS Message;

SELECT CONCAT('Total Bookings for Dr. Anderson: ', COUNT(*)) AS Summary
FROM Booking WHERE doctor_id = 1;

SELECT CONCAT('Total Medical Reports: ', COUNT(*)) AS Summary
FROM Medical_Report WHERE doctor_id = 1;

SELECT CONCAT('Total Prescriptions: ', COUNT(*)) AS Summary
FROM Prescription WHERE doctor_id = 1;

SELECT CONCAT('Total Invoices: ', COUNT(*)) AS Summary
FROM Invoice WHERE doctor_id = 1;

-- Show appointment breakdown by status
SELECT
    status,
    COUNT(*) as count,
    CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Booking WHERE doctor_id = 1), 1), '%') as percentage
FROM Booking
WHERE doctor_id = 1
GROUP BY status
ORDER BY count DESC;