-- ============================================================================
-- LT AMS Backend Services — PostgreSQL / SQLite Seed Data Script
-- Purpose: Populates initial master tables, users, sites, cameras, workers,
--          alerts, incidents, and metrics for LT AMS Django Backend.
-- ============================================================================

BEGIN;

-- 1. Master Geography Location Data (Countries, States, Cities)
INSERT INTO master_countries (id, name, code) VALUES
(1, 'India', 'IN'),
(2, 'United Arab Emirates', 'AE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_states (id, country_id, name, code) VALUES
(1, 1, 'Tamil Nadu', 'TN'),
(2, 1, 'Maharashtra', 'MH'),
(3, 1, 'Kerala', 'KL'),
(4, 1, 'Telangana', 'TS'),
(5, 1, 'Karnataka', 'KA')
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_cities (id, state_id, name) VALUES
(1, 1, 'Chennai'),
(2, 1, 'Coimbatore'),
(3, 2, 'Mumbai'),
(4, 3, 'Kochi'),
(5, 4, 'Hyderabad'),
(6, 5, 'Bangalore')
ON CONFLICT (id) DO NOTHING;

-- 2. Employees & Users Directory
INSERT INTO employees (employee_id, employee_code, employee_name, designation, department, email, mobile_number, status, created_at) VALUES
(101, 'EMP1001', 'Kartheeswaran', 'Admin Manager', 'Management', 'karthee@lt.com', '+919876543210', 'ACTIVE', CURRENT_TIMESTAMP),
(102, 'EMP1002', 'Rajesh Kumar', 'Project Manager', 'Projects', 'rajesh@lt.com', '+919876543211', 'ACTIVE', CURRENT_TIMESTAMP),
(103, 'EMP1003', 'Priya Sharma', 'Site Engineer', 'Civil Operations', 'priya@lt.com', '+919876543212', 'ACTIVE', CURRENT_TIMESTAMP),
(104, 'EMP1004', 'Amit Singh', 'Safety Manager', 'HSE Safety', 'amit@lt.com', '+919876543213', 'ACTIVE', CURRENT_TIMESTAMP),
(105, 'EMP1005', 'Suresh Reddy', 'Site Supervisor', 'Operations', 'suresh@lt.com', '+919876543214', 'ACTIVE', CURRENT_TIMESTAMP),
(106, 'EMP1006', 'Deepa Nair', 'Safety Officer', 'HSE Safety', 'deepa@lt.com', '+919876543215', 'ACTIVE', CURRENT_TIMESTAMP)
ON CONFLICT (employee_id) DO NOTHING;

-- 3. Construction Projects
INSERT INTO projects (id, name, code, description, city_id, manager_id, engineer_id, status, budget, start_date, end_date, created_at) VALUES
(1, 'Chennai-Bangalore Expressway', 'CBE-EXP-01', 'Four-lane greenfield expressway corridor.', 1, 102, 103, 'active', 1250000000.00, '2024-01-15', '2026-12-31', CURRENT_TIMESTAMP),
(2, 'Kochi Port Connectivity Corridor', 'KPC-HIGH-02', 'Elevated highway connector to maritime port terminal.', 4, 102, 103, 'active', 850000000.00, '2024-03-01', '2026-09-30', CURRENT_TIMESTAMP),
(3, 'Coimbatore Ring Road Bypass', 'CRB-CIRC-03', 'Bypass highway segment relieving city traffic congestion.', 2, 102, 103, 'active', 650000000.00, '2024-05-10', '2026-08-31', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 4. Construction Sites
INSERT INTO sites (id, project_id, name, location, latitude, longitude, status, created_at) VALUES
(1, 1, 'Site A - KM 45 (Sriperumbudur)', 'KM 45 Marker, Sriperumbudur', 12.9667, 79.9500, 'active', CURRENT_TIMESTAMP),
(2, 1, 'Site B - KM 78 (Kanchipuram)', 'KM 78 Marker, Kanchipuram North', 12.8333, 79.7000, 'active', CURRENT_TIMESTAMP),
(3, 2, 'Kochi Port Site 01 (Willingdon)', 'Willingdon Island Reach', 9.9400, 76.2600, 'active', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 5. Chainage KM Markers
INSERT INTO chainages (id, site_id, name, start_km, end_km, progress, safety_score, highway_progress, structural_progress, status) VALUES
('ch-101', 1, 'KM 45+000 to KM 45+500', 45.00, 45.50, 78.5, 96.0, 82.0, 75.0, 'green'),
('ch-102', 1, 'KM 45+500 to KM 46+000', 45.50, 46.00, 65.0, 91.0, 70.0, 60.0, 'green'),
('ch-201', 2, 'KM 78+000 to KM 78+500', 78.00, 78.50, 42.0, 84.0, 45.0, 40.0, 'yellow')
ON CONFLICT (id) DO NOTHING;

-- 6. Monitoring IP/RTSP Cameras
INSERT INTO cameras (id, site_id, name, location, rtsp_url, type, status, health_score, last_online) VALUES
(1, 1, 'CAM-SITE-01 (South Gate)', 'Zone A - South Gate', 'http://10.1.82.235:8080/feed/0', 'ptz', 'online', 98, CURRENT_TIMESTAMP),
(2, 1, 'CAM-SITE-02 (Pier Structure)', 'Zone B - Pier Structure 14', 'http://10.1.82.235:8080/feed/1', 'fixed', 'online', 94, CURRENT_TIMESTAMP),
(3, 2, 'CAM-SITE-03 (North Perimeter)', 'Zone C - North Excavation', 'http://10.1.82.235:8080/feed/2', 'ptz', 'online', 90, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 7. Labor Workforce & Attendance Logs
INSERT INTO workers (id, site_id, name, worker_code, trade, contact, status) VALUES
(1, 1, 'Ramesh Kumar', 'WRK-1001', 'Mason', '+919876543001', 'active'),
(2, 1, 'Suresh Babu', 'WRK-1002', 'Welder', '+919876543002', 'active'),
(3, 2, 'Mani Kandan', 'WRK-1003', 'Rigger', '+919876543003', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO attendances (id, worker_id, site_id, date, status, check_in, check_out) VALUES
(1, 1, 1, CURRENT_DATE, 'PRESENT', '08:00:00', '17:00:00'),
(2, 2, 1, CURRENT_DATE, 'PRESENT', '08:15:00', '17:00:00'),
(3, 3, 2, CURRENT_DATE, 'PRESENT', '08:05:00', '17:00:00')
ON CONFLICT (id) DO NOTHING;

-- 8. AI Computer Vision Safety Alerts
INSERT INTO ai_alerts (id, site_id, camera_id, chainage_id, title, description, severity, status, created_at) VALUES
('ALT-1001', 1, 1, 'ch-101', 'No Safety Helmet Detected', 'Worker identified without protective helmet in zone A.', 'HIGH', 'open', CURRENT_TIMESTAMP),
('ALT-1002', 1, 2, 'ch-101', 'High-Visibility Vest Missing', 'Rigging team member operating without safety vest.', 'MEDIUM', 'open', CURRENT_TIMESTAMP),
('ALT-1003', 2, 3, 'ch-201', 'Excavation Barricade Breach', 'Unsafe proximity to deep trench excavation edge.', 'CRITICAL', 'open', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 9. Incidents Log
INSERT INTO incidents (id, project_id, site_id, title, description, severity, status, reported_by, reported_at) VALUES
(1, 1, 1, 'Hydraulic Hose Leak', 'Minor hydraulic fluid spill near crane deployment area.', 'minor', 'investigating', 103, CURRENT_TIMESTAMP),
(2, 2, 2, 'Formwork Alignment Shift', 'Pier cap formwork required re-calibration during casting.', 'observation', 'closed', 105, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 10. Messages & Communications
INSERT INTO messages (id, sender_id, recipient_id, subject, body, created_at) VALUES
(1, 104, 103, 'Safety Briefing Reminder', 'Mandatory morning safety briefing scheduled for KM 45 team at 07:45 AM.', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 11. Generated Reports
INSERT INTO reports (id, project_id, site_id, name, report_type, format, generated_by, file_url, created_at) VALUES
(1, 1, 1, 'Weekly_Safety_Audit_KM45.pdf', 'safety', 'pdf', 104, '/media/reports/Weekly_Safety_Audit_KM45.pdf', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

COMMIT;
