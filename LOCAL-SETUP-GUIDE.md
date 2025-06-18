# Local Setup Guide - Updated DocketCalendar API

## 🚨 **IMPORTANT: Current Status**
- ✅ **API Code**: Ready to connect to existing database
- ✅ **Database**: Works with your existing database (no migration needed)
- ✅ **Ready to use** with proper configuration

## 📋 **Prerequisites**
- Node.js (v20+)
- MySQL (v8.0+)
- Access to your existing database with legacy tables

## 🗄️ **Step 1: Database Configuration**

### **Use Your Existing Database**
```bash
# No database changes needed! 
# The API works with your existing tables like:
# - import_docket_calculator
# - docket_cases
# - docket_cases_attendees
# - import_events
# etc.
```

### **Optional: Apply Performance Indexes**
```sql
-- OPTIONAL: Backup your existing database first
mysqldump -u your_username -p your_database_name > backup_$(date +%Y%m%d).sql

-- Apply performance indexes to improve query speed
mysql -u your_username -p your_database_name < database-performance-indexes.sql
```

### **Quick Performance Setup Commands**
```bash
# Navigate to your project directory
cd /Users/allanfox/Documents/GitHub/dc-api

# Apply performance indexes (optional but recommended)
mysql -u your_username -p your_database_name < database-performance-indexes.sql
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
USE your_database_name; -- your actual database name

-- Show existing tables
SHOW TABLES;

-- Check if your data is accessible
SELECT COUNT(*) FROM docket_cases;
SELECT COUNT(*) FROM import_docket_calculator;
SELECT COUNT(*) FROM import_events;
SELECT COUNT(*) FROM docket_cases_attendees;
```

### **Expected Legacy Tables**
You should see tables like these (among others):
```
import_docket_calculator
docket_cases
docket_cases_attendees
import_events
docket_customtext
owners
usercontactupdate
case_events
events
```

## 🧪 **Step 6: Test with Real Data**

The API works with your existing data. Test these endpoints:

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

### **Example API Response:**
```json
{
  "status": "success",
  "message": "Cases retrieved successfully",
  "data": [
    {
      "id": 123,
      "case_name": "Your Actual Case Name",
      "jurisdiction": "Your Jurisdiction",
      "assignees": [
        {"assignee": "user@lawfirm.com", "assignee_name": "Actual User"}
      ],
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 5
}
```

## ✅ **Success Checklist**

- [ ] API connects to existing database successfully
- [ ] API starts without errors  
- [ ] Swagger docs accessible at `/api-docs`
- [ ] Real data visible in API responses
- [ ] Endpoints working (`/cases`, `/triggers`, `/events`)
- [ ] Performance indexes applied (optional but recommended)
- [ ] Legacy data properly mapped to clean API responses
- [ ] Authentication working properly

Once all these are checked, your DocketCalendar API is ready to use with your existing data! 🎉 