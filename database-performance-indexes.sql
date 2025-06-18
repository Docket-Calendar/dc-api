-- Performance Optimization Indexes for DocketCalendar API
-- These indexes will significantly improve query performance for the existing tables

-- Indexes for import_docket_calculator (main triggers table)
CREATE INDEX IF NOT EXISTS idx_import_docket_user_id ON import_docket_calculator(user_id);
CREATE INDEX IF NOT EXISTS idx_import_docket_jurisdiction ON import_docket_calculator(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_import_docket_trigger_date ON import_docket_calculator(trigger_date);
CREATE INDEX IF NOT EXISTS idx_import_docket_service_type ON import_docket_calculator(service_type);
CREATE INDEX IF NOT EXISTS idx_import_docket_created_on ON import_docket_calculator(created_on);

-- Composite index for the most common query pattern (user_id + jurisdiction + trigger_date)
CREATE INDEX IF NOT EXISTS idx_import_docket_user_jurisdiction_date ON import_docket_calculator(user_id, jurisdiction, trigger_date);

-- Indexes for import_events table
CREATE INDEX IF NOT EXISTS idx_import_events_docket_id ON import_events(import_docket_id);
CREATE INDEX IF NOT EXISTS idx_import_events_user_id ON import_events(user_id);
CREATE INDEX IF NOT EXISTS idx_import_events_date ON import_events(date);
CREATE INDEX IF NOT EXISTS idx_import_events_created_on ON import_events(created_on);

-- Indexes for docket_cases_attendees (assignees table)
CREATE INDEX IF NOT EXISTS idx_docket_cases_attendees_docket_id ON docket_cases_attendees(import_docket_id);
CREATE INDEX IF NOT EXISTS idx_docket_cases_attendees_attendee ON docket_cases_attendees(attendee);
CREATE INDEX IF NOT EXISTS idx_docket_cases_attendees_triggerlevel ON docket_cases_attendees(triggerlevel);
CREATE INDEX IF NOT EXISTS idx_docket_cases_attendees_eventlevel ON docket_cases_attendees(eventlevel);

-- Composite index for assignee queries
CREATE INDEX IF NOT EXISTS idx_docket_cases_attendees_composite ON docket_cases_attendees(import_docket_id, triggerlevel, eventlevel);

-- Indexes for docket_customtext table
CREATE INDEX IF NOT EXISTS idx_docket_customtext_docket_id ON docket_customtext(import_docket_id);

-- Indexes for owners table (dashboards)
CREATE INDEX IF NOT EXISTS idx_owners_docket_id ON owners(importdocketid);
CREATE INDEX IF NOT EXISTS idx_owners_user_id ON owners(user_id);
CREATE INDEX IF NOT EXISTS idx_owners_triggerlevel ON owners(triggerlevel);

-- Composite index for owners queries
CREATE INDEX IF NOT EXISTS idx_owners_composite ON owners(importdocketid, triggerlevel, user_id);

-- Indexes for usercontactupdate table (user details)
CREATE INDEX IF NOT EXISTS idx_usercontactupdate_email ON usercontactupdate(userContactEmail);
CREATE INDEX IF NOT EXISTS idx_usercontactupdate_name ON usercontactupdate(userContactName);

-- Indexes for cases-related queries (if using actual case tables)
-- Note: Adjust table names based on your actual case table structure
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_jurisdiction ON cases(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);

-- Add foreign key constraints if they don't exist (helps with performance)
-- Note: Only add these if the tables don't already have these constraints
-- ALTER TABLE import_events ADD CONSTRAINT fk_import_events_docket 
--   FOREIGN KEY (import_docket_id) REFERENCES import_docket_calculator(import_docket_id);

-- ALTER TABLE docket_cases_attendees ADD CONSTRAINT fk_docket_attendees_docket
--   FOREIGN KEY (import_docket_id) REFERENCES import_docket_calculator(import_docket_id);

-- Show current table status and indexes
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    (DATA_LENGTH + INDEX_LENGTH) AS total_size
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'import_docket_calculator',
    'import_events', 
    'docket_cases_attendees',
    'docket_customtext',
    'owners',
    'usercontactupdate'
  )
ORDER BY total_size DESC; 