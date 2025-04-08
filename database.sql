-- Create database (if not already created)
CREATE DATABASE IF NOT EXISTS docket_calendar;

USE docket_calendar;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_name VARCHAR(255) NOT NULL,
  jurisdiction VARCHAR(100),
  case_assignees TEXT,
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  casename VARCHAR(255) NOT NULL,
  trigger_name VARCHAR(255),
  event_name VARCHAR(255) NOT NULL,
  event_date DATE,
  event_type VARCHAR(100),
  trigger_date DATE,
  trigger_time TIME,
  service_type VARCHAR(100),
  jurisdiction VARCHAR(100),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@example.com', '$2b$10$9Hk1G7fVCE2b/MrJyMh/puVVF5xLV4tBYlNfMK9I6sCXLEVn1P4/O', 'admin');

-- Insert sample cases
INSERT INTO cases (case_name, jurisdiction, case_assignees, timezone)
VALUES 
  ('Smith v. Jones', 'New York', 'John Doe, Jane Smith', 'America/New_York'),
  ('Johnson v. Acme Corp', 'California', 'Robert Johnson', 'America/Los_Angeles'),
  ('Williams v. Brown', 'Texas', 'Mary Williams', 'America/Chicago');

-- Insert sample events
INSERT INTO events (casename, trigger_name, event_name, event_date, event_type, trigger_date, trigger_time, service_type, jurisdiction, created_date)
VALUES 
  ('Smith v. Jones', 'File Complaint', 'Response Due', '2023-08-15', 'Deadline', '2023-07-15', '09:00:00', 'Personal', 'New York', '2023-07-01 10:00:00'),
  ('Smith v. Jones', 'Response Due', 'Discovery Deadline', '2023-10-15', 'Deadline', '2023-08-15', '09:00:00', 'Email', 'New York', '2023-07-02 11:00:00'),
  ('Johnson v. Acme Corp', 'File Complaint', 'Response Due', '2023-09-20', 'Deadline', '2023-08-20', '09:00:00', 'Personal', 'California', '2023-08-01 09:30:00'); 