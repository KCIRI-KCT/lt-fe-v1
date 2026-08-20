-- ============================================================================
-- L&T Construction Monitoring Platform - PPE Database Seed & Stored Procedures
-- Exact Database Structure: PostgreSQL (Targeting 'ai_alert', 'ppe_acknowledgement', 'ppe_notification')
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. STORED PROCEDURES
-- ----------------------------------------------------------------------------

-- Procedure 1: Insert AI Alert into 'ai_alert' table
CREATE OR REPLACE PROCEDURE sp_insert_ai_alert(
    p_site_id BIGINT,
    p_camera_id BIGINT,
    p_alert_type VARCHAR,
    p_severity VARCHAR,
    p_snapshot_url TEXT,
    p_status VARCHAR DEFAULT 'OPEN'
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO ai_alert (
        site_id,
        camera_id,
        type,
        severity,
        timestamp,
        snapshot,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_site_id,
        p_camera_id,
        COALESCE(p_alert_type, 'no_ppe'),
        COALESCE(p_severity, 'CRITICAL'),
        NOW(),
        p_snapshot_url,
        COALESCE(p_status, 'OPEN'),
        NOW(),
        NOW()
    );
END;
$$;


-- Procedure 2: Insert PPE Acknowledgement into 'ppe_acknowledgement' table
CREATE OR REPLACE PROCEDURE sp_insert_ppe_acknowledgement(
    p_alert_id BIGINT,
    p_acknowledged_by_username VARCHAR,
    p_acknowledged_by_role VARCHAR,
    p_notes TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id BIGINT;
BEGIN
    SELECT user_id INTO v_user_id 
    FROM application_user 
    WHERE username = p_acknowledged_by_username 
    LIMIT 1;

    IF v_user_id IS NULL THEN
        SELECT user_id INTO v_user_id FROM application_user LIMIT 1;
    END IF;

    INSERT INTO ppe_acknowledgement (
        alert_id,
        acknowledged_by,
        acknowledged_by_role,
        notes,
        timestamp,
        created_at,
        updated_at
    ) VALUES (
        p_alert_id,
        v_user_id,
        p_acknowledged_by_role,
        p_notes,
        NOW(),
        NOW(),
        NOW()
    );
    
    -- Update corresponding alert status to 'ACKNOWLEDGED'
    UPDATE ai_alert 
    SET status = 'ACKNOWLEDGED', acknowledged_by = v_user_id, updated_at = NOW() 
    WHERE alert_id = p_alert_id;
END;
$$;


-- Procedure 3: Insert PPE HITL Notification into 'ppe_notification' table
CREATE OR REPLACE PROCEDURE sp_insert_ppe_notification(
    p_alert_id BIGINT,
    p_safety_officer_code VARCHAR,
    p_status VARCHAR DEFAULT 'pending_review',
    p_hitl_data JSONB DEFAULT '{}'::jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_officer_id BIGINT;
BEGIN
    SELECT employee_id INTO v_officer_id 
    FROM employee 
    WHERE employee_code = p_safety_officer_code 
    LIMIT 1;

    IF v_officer_id IS NULL THEN
        SELECT employee_id INTO v_officer_id FROM employee LIMIT 1;
    END IF;

    INSERT INTO ppe_notification (
        alert_id,
        safety_officer_id,
        status,
        hitl_data,
        created_at,
        updated_at
    ) VALUES (
        p_alert_id,
        v_officer_id,
        COALESCE(p_status, 'pending_review'),
        p_hitl_data,
        NOW(),
        NOW()
    );
END;
$$;


-- ----------------------------------------------------------------------------
-- 2. EXECUTABLE SEED DATA INSERTS
-- ----------------------------------------------------------------------------

-- A. Insert AI PPE Alerts (into 'ai_alert')
INSERT INTO ai_alert (site_id, camera_id, type, severity, timestamp, snapshot, status, created_at, updated_at)
SELECT 
    s.site_id,
    c.camera_id,
    'no_ppe',
    'CRITICAL',
    NOW(),
    'http://10.1.150.142:8000/media/snapshots/ppe_helmet_missing.jpg',
    'OPEN',
    NOW(),
    NOW()
FROM site s
LEFT JOIN camera c ON c.site_id = s.site_id
LIMIT 1;

INSERT INTO ai_alert (site_id, camera_id, type, severity, timestamp, snapshot, status, created_at, updated_at)
SELECT 
    s.site_id,
    c.camera_id,
    'vest_violation',
    'MAJOR',
    NOW() - INTERVAL '15 minutes',
    'http://10.1.150.142:8000/media/snapshots/ppe_vest_missing.jpg',
    'OPEN',
    NOW(),
    NOW()
FROM site s
LEFT JOIN camera c ON c.site_id = s.site_id
LIMIT 1;

INSERT INTO ai_alert (site_id, camera_id, type, severity, timestamp, snapshot, status, created_at, updated_at)
SELECT 
    s.site_id,
    c.camera_id,
    'helmet_violation',
    'CRITICAL',
    NOW() - INTERVAL '30 minutes',
    'http://10.1.150.142:8000/media/snapshots/ppe_boots_missing.jpg',
    'OPEN',
    NOW(),
    NOW()
FROM site s
LEFT JOIN camera c ON c.site_id = s.site_id
LIMIT 1;


-- B. Insert PPE Acknowledgements (into 'ppe_acknowledgement')
INSERT INTO ppe_acknowledgement (alert_id, acknowledged_by, acknowledged_by_role, notes, timestamp, created_at, updated_at)
SELECT 
    a.alert_id,
    u.user_id,
    'Project Manager',
    'Acknowledged violation. Site engineer instructed to provide PPE hard hat immediately.',
    NOW() - INTERVAL '10 minutes',
    NOW(),
    NOW()
FROM ai_alert a
CROSS JOIN application_user u
WHERE u.username = 'projectmanager'
ORDER BY a.alert_id DESC
LIMIT 1;

INSERT INTO ppe_acknowledgement (alert_id, acknowledged_by, acknowledged_by_role, notes, timestamp, created_at, updated_at)
SELECT 
    a.alert_id,
    u.user_id,
    'Site Supervisor',
    'High-visibility vest issued to worker on excavating bay.',
    NOW() - INTERVAL '5 minutes',
    NOW(),
    NOW()
FROM ai_alert a
CROSS JOIN application_user u
WHERE u.username = 'sitesupervisor'
ORDER BY a.alert_id DESC
OFFSET 1
LIMIT 1;


-- C. Insert PPE HITL Notifications (into 'ppe_notification')
INSERT INTO ppe_notification (alert_id, safety_officer_id, status, hitl_data, created_at, updated_at)
SELECT 
    a.alert_id,
    e.employee_id,
    'pending_review',
    jsonb_build_object(
        'confidence', 98.50,
        'violation_type', 'No Hard Hat / Protective Helmet',
        'location', 'North Gate Overhead Crane Area',
        'acknowledged_by', 'Project Manager',
        'acknowledged_by_role', 'Project Manager',
        'site_name', 'OMR Corridor Station 12',
        'chainage', 'KM 45 (Highway Expansion)',
        'snapshot', 'http://10.1.150.142:8000/media/snapshots/ppe_helmet_missing.jpg'
    ),
    NOW(),
    NOW()
FROM ai_alert a
CROSS JOIN employee e
WHERE e.employee_code = 'LT_EMP_SO01'
ORDER BY a.alert_id DESC
LIMIT 1;

INSERT INTO ppe_notification (alert_id, safety_officer_id, status, hitl_data, created_at, updated_at)
SELECT 
    a.alert_id,
    e.employee_id,
    'pending_review',
    jsonb_build_object(
        'confidence', 95.20,
        'violation_type', 'Missing Reflective Safety Vest',
        'location', 'Excavation Sector B',
        'acknowledged_by', 'Site Supervisor',
        'acknowledged_by_role', 'Site Supervisor',
        'site_name', 'OMR Corridor Station 12',
        'chainage', 'KM 12 (Flyover Pillar B)',
        'snapshot', 'http://10.1.150.142:8000/media/snapshots/ppe_vest_missing.jpg'
    ),
    NOW(),
    NOW()
FROM ai_alert a
CROSS JOIN employee e
WHERE e.employee_code = 'LT_EMP_SO01'
ORDER BY a.alert_id DESC
OFFSET 1
LIMIT 1;


-- ----------------------------------------------------------------------------
-- 3. VERIFICATION QUERIES
-- ----------------------------------------------------------------------------
SELECT alert_id, site_id, camera_id, type, severity, status, snapshot, created_at FROM ai_alert ORDER BY alert_id DESC LIMIT 5;
SELECT acknowledgement_id, alert_id, acknowledged_by, acknowledged_by_role, notes, timestamp FROM ppe_acknowledgement ORDER BY acknowledgement_id DESC LIMIT 5;
SELECT notification_id, alert_id, safety_officer_id, status, hitl_data, created_at FROM ppe_notification ORDER BY notification_id DESC LIMIT 5;
