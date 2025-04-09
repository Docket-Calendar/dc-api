-- Add api_access_token column to users table
ALTER TABLE dcmain_dev.users
ADD COLUMN api_access_token VARCHAR(255) NULL COMMENT 'Stores API access token for authentication';

-- Create index for faster token lookups
CREATE INDEX idx_api_access_token ON dcmain_dev.users(api_access_token);

-- Sample query to update a user's API token
-- UPDATE dcmain_dev.users SET api_access_token = 'generated_token_value' WHERE id = user_id; 