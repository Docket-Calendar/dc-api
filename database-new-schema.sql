-- DocketCalendar API - Simplified Database Schema
-- Focused on Cases, Triggers, and Events with exact fields specified

CREATE DATABASE IF NOT EXISTS docket_calendar;
USE docket_calendar;

-- ===== CORE ENTITIES =====

-- Users table (for assignees)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'viewer') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cases table (with exact fields as specified)
CREATE TABLE IF NOT EXISTS cases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_name VARCHAR(255) NOT NULL, -- Case Name
  jurisdiction VARCHAR(100), -- Jurisdiction
  timezone VARCHAR(50) DEFAULT 'America/New_York', -- Timezone
  case_note TEXT, -- Case Note
  initiation_date DATE, -- Initiation Date
  case_number VARCHAR(100), -- Case Number
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Created On
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Triggers table (with exact fields as specified)
CREATE TABLE IF NOT EXISTS triggers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL, -- Name
  trigger_date DATE NOT NULL, -- Date
  trigger_time TIME NOT NULL, -- Time
  service_type ENUM('email', 'sms', 'push', 'personal') DEFAULT 'email', -- Service Type
  jurisdiction VARCHAR(100), -- Jurisdiction
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Created On
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table (with exact fields as specified)
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT NOT NULL,
  trigger_id INT, -- Optional trigger reference
  event_name VARCHAR(255) NOT NULL, -- Event Name/Subject field
  event_date DATE NOT NULL, -- Date
  event_time TIME, -- Time
  appointment_length INT, -- Appt. Length (in minutes)
  service_type ENUM('email', 'sms', 'push', 'personal') DEFAULT 'email', -- Service Type
  jurisdiction VARCHAR(100), -- Jurisdiction
  court_rule VARCHAR(255), -- Court Rule
  date_rule VARCHAR(255), -- Date Rule
  event_type VARCHAR(100), -- Event type
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Created On
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (trigger_id) REFERENCES triggers(id) ON DELETE SET NULL
);

-- Calendars table (for relationships)
CREATE TABLE IF NOT EXISTS calendars (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3498db', -- hex color
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Dashboards table (for relationships)
CREATE TABLE IF NOT EXISTS dashboards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout_config JSON, -- Store dashboard layout configuration
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ===== CUSTOM DETAILS SYSTEM =====

-- Custom details fields (for title, location, description)
CREATE TABLE IF NOT EXISTS custom_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity_type ENUM('case', 'trigger', 'event') NOT NULL,
  entity_id INT NOT NULL,
  field_name VARCHAR(100) NOT NULL, -- 'title', 'location', 'description'
  field_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_entity_field (entity_type, entity_id, field_name)
);

-- ===== RELATIONSHIP TABLES =====

-- Case assignees (many-to-many)
CREATE TABLE IF NOT EXISTS case_assignees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(50) DEFAULT 'assignee',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_case_user (case_id, user_id)
);

-- Trigger assignees (many-to-many)
CREATE TABLE IF NOT EXISTS trigger_assignees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trigger_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(50) DEFAULT 'assignee',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trigger_id) REFERENCES triggers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_trigger_user (trigger_id, user_id)
);

-- Event assignees (many-to-many)
CREATE TABLE IF NOT EXISTS event_assignees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(50) DEFAULT 'assignee',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_user (event_id, user_id)
);

-- Case calendars (many-to-many)
CREATE TABLE IF NOT EXISTS case_calendars (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT NOT NULL,
  calendar_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
  UNIQUE KEY unique_case_calendar (case_id, calendar_id)
);

-- Trigger calendars (many-to-many)
CREATE TABLE IF NOT EXISTS trigger_calendars (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trigger_id INT NOT NULL,
  calendar_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trigger_id) REFERENCES triggers(id) ON DELETE CASCADE,
  FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
  UNIQUE KEY unique_trigger_calendar (trigger_id, calendar_id)
);

-- Event calendars (many-to-many)
CREATE TABLE IF NOT EXISTS event_calendars (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  calendar_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_calendar (event_id, calendar_id)
);

-- Case dashboards (many-to-many)
CREATE TABLE IF NOT EXISTS case_dashboards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT NOT NULL,
  dashboard_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
  UNIQUE KEY unique_case_dashboard (case_id, dashboard_id)
);

-- Trigger dashboards (many-to-many)
CREATE TABLE IF NOT EXISTS trigger_dashboards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trigger_id INT NOT NULL,
  dashboard_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trigger_id) REFERENCES triggers(id) ON DELETE CASCADE,
  FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
  UNIQUE KEY unique_trigger_dashboard (trigger_id, dashboard_id)
);

-- Event dashboards (many-to-many)
CREATE TABLE IF NOT EXISTS event_dashboards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  dashboard_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_dashboard (event_id, dashboard_id)
);

-- ===== INDEXES FOR PERFORMANCE =====

-- Cases indexes
CREATE INDEX idx_cases_jurisdiction ON cases(jurisdiction);
CREATE INDEX idx_cases_initiation_date ON cases(initiation_date);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_case_number ON cases(case_number);

-- Triggers indexes
CREATE INDEX idx_triggers_date ON triggers(trigger_date);
CREATE INDEX idx_triggers_service_type ON triggers(service_type);
CREATE INDEX idx_triggers_jurisdiction ON triggers(jurisdiction);
CREATE INDEX idx_triggers_created_at ON triggers(created_at);

-- Events indexes
CREATE INDEX idx_events_case_id ON events(case_id);
CREATE INDEX idx_events_trigger_id ON events(trigger_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at);

-- Custom details indexes
CREATE INDEX idx_custom_details_entity ON custom_details(entity_type, entity_id);
CREATE INDEX idx_custom_details_field ON custom_details(field_name);

-- ===== SAMPLE DATA =====

-- Insert sample users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@docketcalendar.com', '$2b$10$9Hk1G7fVCE2b/MrJyMh/puVVF5xLV4tBYlNfMK9I6sCXLEVn1P4/O', 'admin'),
('John Doe', 'john@lawfirm.com', '$2b$10$example', 'user'),
('Jane Smith', 'jane@lawfirm.com', '$2b$10$example', 'user');

-- Insert sample calendars
INSERT INTO calendars (name, description, color, created_by) VALUES
('Court Calendar', 'Main court proceedings calendar', '#e74c3c', 1),
('Deadlines', 'Important deadlines and filing dates', '#f39c12', 1),
('Client Meetings', 'Client consultation calendar', '#3498db', 1);

-- Insert sample dashboards
INSERT INTO dashboards (name, description, is_default, created_by) VALUES
('Main Dashboard', 'Primary case management dashboard', TRUE, 1),
('Deadlines Dashboard', 'Focus on upcoming deadlines', FALSE, 1);

-- Insert sample cases
INSERT INTO cases (case_name, jurisdiction, timezone, case_note, initiation_date, case_number) VALUES
('Smith v. Jones', 'New York', 'America/New_York', 'Personal injury case - car accident', '2023-01-15', 'NY-2023-001'),
('Johnson v. Acme Corp', 'California', 'America/Los_Angeles', 'Employment discrimination case', '2023-02-20', 'CA-2023-002'),
('Williams v. Brown', 'Texas', 'America/Chicago', 'Contract dispute case', '2023-03-10', 'TX-2023-003');

-- Insert sample triggers
INSERT INTO triggers (name, trigger_date, trigger_time, service_type, jurisdiction) VALUES
('30-Day Filing Deadline', '2023-07-15', '09:00:00', 'email', 'New York'),
('Discovery Deadline Reminder', '2023-08-01', '10:00:00', 'email', 'California'),
('Settlement Conference Notice', '2023-09-15', '14:00:00', 'personal', 'Texas');

-- Insert sample events
INSERT INTO events (case_id, trigger_id, event_name, event_date, event_time, appointment_length, service_type, jurisdiction, court_rule, date_rule, event_type) VALUES
(1, 1, 'Response Filing Due', '2023-08-15', '17:00:00', 30, 'email', 'New York', 'CPLR 3012', '30 days from service', 'Deadline'),
(1, NULL, 'Initial Case Conference', '2023-09-01', '10:00:00', 60, 'personal', 'New York', 'CPLR 3401', 'Within 45 days', 'Hearing'),
(2, 2, 'Discovery Deadline', '2023-09-01', '23:59:00', 0, 'email', 'California', 'CCP 2024', '120 days from answer', 'Deadline'),
(3, 3, 'Settlement Conference', '2023-10-15', '14:00:00', 120, 'personal', 'Texas', 'TRCP 166', 'Court discretion', 'Conference');

-- Insert sample custom details
INSERT INTO custom_details (entity_type, entity_id, field_name, field_value) VALUES
-- Case custom details
('case', 1, 'title', 'Motor Vehicle Accident Case'),
('case', 1, 'location', '123 Main St, New York, NY'),
('case', 1, 'description', 'Rear-end collision with significant injuries'),
-- Trigger custom details
('trigger', 1, 'title', 'Critical Filing Deadline'),
('trigger', 1, 'location', 'New York Supreme Court'),
('trigger', 1, 'description', 'Must file response within 30 days or face default'),
-- Event custom details
('event', 1, 'title', 'Answer Filing Deadline'),
('event', 1, 'location', 'Court Clerk Office'),
('event', 1, 'description', 'Final deadline to file answer to complaint');

-- Insert sample assignees
INSERT INTO case_assignees (case_id, user_id, role) VALUES
(1, 2, 'primary'),
(1, 3, 'secondary'),
(2, 2, 'primary'),
(3, 3, 'primary');

INSERT INTO trigger_assignees (trigger_id, user_id, role) VALUES
(1, 2, 'primary'),
(2, 2, 'primary'),
(3, 3, 'primary');

INSERT INTO event_assignees (event_id, user_id, role) VALUES
(1, 2, 'primary'),
(2, 2, 'primary'),
(3, 2, 'primary'),
(4, 3, 'primary');

-- Insert sample calendar relationships
INSERT INTO case_calendars (case_id, calendar_id) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(3, 1);

INSERT INTO trigger_calendars (trigger_id, calendar_id) VALUES
(1, 2), (2, 2), (3, 1);

INSERT INTO event_calendars (event_id, calendar_id) VALUES
(1, 2), (2, 1), (3, 2), (4, 1);

-- Insert sample dashboard relationships
INSERT INTO case_dashboards (case_id, dashboard_id) VALUES
(1, 1), (2, 1), (3, 1);

INSERT INTO trigger_dashboards (trigger_id, dashboard_id) VALUES
(1, 2), (2, 2), (3, 1);

INSERT INTO event_dashboards (event_id, dashboard_id) VALUES
(1, 2), (2, 1), (3, 2), (4, 1); 