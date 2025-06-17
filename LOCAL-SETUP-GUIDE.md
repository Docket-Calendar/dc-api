# Local Setup Guide - Updated DocketCalendar API

## 🚨 **IMPORTANT: Current Status**
- ✅ **API Code**: Updated and ready
- ❌ **Database**: NOT updated yet (you need to run the migration)
- ❌ **Will NOT work** until database is updated

## 📋 **Prerequisites**
- Node.js (v20+)
- MySQL (v8.0+)
- Your existing database connection details

## 🗄️ **Step 1: Update Your Database**

### **Option A: Fresh Database (Recommended for Testing)**
```sql
-- Connect to MySQL and create a fresh test database
DROP DATABASE IF EXISTS docket_calendar_test;
CREATE DATABASE docket_calendar_test;
USE docket_calendar_test;

-- Then run the entire database-new-schema.sql file
```

### **Option B: Update Existing Database (Backup First!)**
```sql
-- BACKUP YOUR EXISTING DATABASE FIRST!
mysqldump -u your_username -p docket_calendar > backup_$(date +%Y%m%d).sql

-- Then run database-new-schema.sql
mysql -u your_username -p docket_calendar < database-new-schema.sql
```

### **Quick Database Setup Commands**
```bash
# Navigate to your project directory
cd /Users/allanfox/Documents/GitHub/dc-api

# Run the schema (replace with your MySQL credentials)
mysql -u your_username -p your_database_name < database-new-schema.sql
```

## ⚙️ **Step 2: Environment Setup**

### **Update your .env file**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=docket_calendar  # or docket_calendar_test

# Server Configuration
PORT=3001
NODE_ENV=development
API_PREFIX=/api/v1

# JWT Configuration (add if missing)
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=1d

# Optional: Website hostname for production
WEBSITE_HOSTNAME=localhost:3001
```

## 🚀 **Step 3: Install Dependencies & Run**

```bash
# Navigate to project directory
cd /Users/allanfox/Documents/GitHub/dc-api

# Install dependencies (if any new ones were added)
npm install

# Start the development server
npm run dev

# OR start normally
npm start
```

## 🧪 **Step 4: Test the API**

### **Check if it's running**
```bash
# Basic health check
curl http://localhost:3001/health

# API root
curl http://localhost:3001/
```

### **Access Swagger Documentation**
Open your browser and go to:
```
http://localhost:3001/api-docs
```

### **Test New Endpoints**
```bash
# Test triggers endpoint
curl http://localhost:3001/api/v1/triggers

# Test calendars endpoint  
curl http://localhost:3001/api/v1/calendars

# Test dashboards endpoint
curl http://localhost:3001/api/v1/dashboards
```

## 🔍 **Step 5: Verify Database Connection**

### **Check Database Tables**
```sql
-- Connect to your database and verify tables exist
USE docket_calendar; -- or your database name

-- Should show 16 tables
SHOW TABLES;

-- Check if sample data was inserted
SELECT COUNT(*) FROM cases;
SELECT COUNT(*) FROM triggers;
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM calendars;
SELECT COUNT(*) FROM dashboards;
```

### **Expected Tables**
You should see these 16 tables:
```
calendars
case_assignees
case_calendars
case_dashboards
cases
custom_details
dashboards
event_assignees
event_calendars
event_dashboards
events
trigger_assignees
trigger_calendars
trigger_dashboards
triggers
users
```

## 🧪 **Step 6: Test with Sample Data**

The schema includes sample data. Test these endpoints:

### **Cases (Enhanced)**
```bash
# Get all cases (should show enhanced fields)
curl http://localhost:3001/api/v1/cases

# Get specific case (should include relationships)
curl http://localhost:3001/api/v1/cases/1
```

### **Triggers (NEW)**
```bash
# Get all triggers
curl http://localhost:3001/api/v1/triggers

# Create a new trigger
curl -X POST http://localhost:3001/api/v1/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Trigger",
    "trigger_date": "2024-01-15",
    "trigger_time": "10:00:00",
    "service_type": "email",
    "jurisdiction": "California"
  }'
```

### **Events (Enhanced)**
```bash
# Get events for a trigger
curl http://localhost:3001/api/v1/events/trigger/1

# Search events by court rule
curl "http://localhost:3001/api/v1/events/search?court_rule=CPLR"
```

### **Calendars (NEW)**
```bash
# Create a calendar
curl -X POST http://localhost:3001/api/v1/calendars \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Calendar",
    "description": "Testing the new calendar system",
    "color": "#ff5733"
  }'
```

## 🚨 **Troubleshooting**

### **If API won't start:**
1. **Check database connection**:
   ```bash
   # Test database connection
   node -e "
   require('dotenv').config();
   const { testConnection } = require('./src/config/database');
   testConnection();
   "
   ```

2. **Check for missing tables**:
   - Error like "Table 'triggers' doesn't exist" = Database not updated
   - Run the schema migration again

3. **Check Node.js version**:
   ```bash
   node --version  # Should be v20+
   ```

### **If Swagger docs don't load:**
- Try: `http://localhost:3001/api-docs`
- Check console for JavaScript errors
- Verify the port in your .env file

### **If database connection fails:**
- Verify MySQL is running: `brew services start mysql` (Mac)
- Check database credentials in .env
- Test manual connection: `mysql -u username -p`

## 📊 **What You Should See**

### **Successful API Start:**
```
Server running in development mode on port 3001
API documentation available at http://localhost:3001/api-docs
Database connection established successfully
```

### **Swagger Documentation:**
- **6 main sections**: Auth, Cases, Events, Triggers, Calendars, Dashboards
- **40+ endpoints** total
- **Interactive testing** for all endpoints

### **Sample Data Response:**
```json
{
  "success": true,
  "message": "Cases retrieved successfully",
  "data": [
    {
      "id": 1,
      "case_name": "Smith v. Jones",
      "case_note": "Personal injury case - car accident",
      "initiation_date": "2023-01-15",
      "jurisdiction": "New York",
      "custom_details": {
        "title": "Motor Vehicle Accident Case",
        "location": "123 Main St, New York, NY"
      },
      "assignees": [
        {"id": 2, "name": "John Doe", "role": "primary"}
      ],
      "calendars": [
        {"id": 1, "name": "Court Calendar"}
      ]
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## ✅ **Success Checklist**

- [ ] Database updated with new schema
- [ ] API starts without errors  
- [ ] Swagger docs accessible at `/api-docs`
- [ ] Sample data visible in responses
- [ ] New endpoints working (`/triggers`, `/calendars`, `/dashboards`)
- [ ] Enhanced fields visible in existing endpoints
- [ ] Custom details system working
- [ ] Relationships properly loaded

Once all these are checked, your enhanced DocketCalendar API is ready to use! 🎉 