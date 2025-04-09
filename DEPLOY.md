# DocketCalendar API Deployment Guide

This guide provides step-by-step instructions for deploying the DocketCalendar API to Azure App Service with a custom domain.

## Prerequisites

1. Azure CLI installed (`az` command available)
2. Node.js and npm installed
3. Git installed
4. Access to GoDaddy DNS management for docketcalendar.com

## Deployment Steps

### 1. Prepare Your Environment

1. Create a `.env.production` file (already done):
   - Contains all environment variables for production
   - Includes a secure JWT secret
   - Database connection details for Azure MySQL

2. Test locally in production mode:
   ```bash
   NODE_ENV=production node src/index.js
   ```

### 2. Deploy to Azure

#### Option A: Using the Deployment Script (Recommended)

We've created a `deploy.sh` script that automates most of the deployment process.

1. Make the script executable:
   ```bash
   chmod +x deploy.sh
   ```

2. Run the script:
   ```bash
   ./deploy.sh
   ```

3. Follow the prompts to:
   - Log in to Azure
   - Create resource group, app service plan, and web app
   - Configure app settings from .env.production
   - Set up custom domain (optional)
   - Choose deployment method (Git, GitHub, ZIP)

#### Option B: Manual Deployment

1. Create Azure resources:
   ```bash
   # Create resource group
   az group create --name DocketCalendarAPI --location eastus

   # Create app service plan
   az appservice plan create --name DocketCalendarPlan --resource-group DocketCalendarAPI --sku B1 --is-linux

   # Create web app
   az webapp create --resource-group DocketCalendarAPI --plan DocketCalendarPlan --name docketcalendar-api --runtime "NODE:18-lts"
   ```

2. Configure environment variables:
   ```bash
   # Set each variable from .env.production
   az webapp config appsettings set --resource-group DocketCalendarAPI --name docketcalendar-api --settings "DB_HOST=your-db-host" "DB_USER=your-db-user" "DB_PASSWORD=your-db-password" "DB_NAME=your-db-name" "JWT_SECRET=your-secret-key" "NODE_ENV=production"
   ```

3. Deploy code using one of these methods:
   
   a. Local Git:
   ```bash
   az webapp deployment source config-local-git --name docketcalendar-api --resource-group DocketCalendarAPI
   git remote add azure <git-url-from-previous-command>
   git push azure main
   ```
   
   b. GitHub:
   ```bash
   az webapp deployment source config --name docketcalendar-api --resource-group DocketCalendarAPI --repo-url https://github.com/yourusername/dc-api --branch main
   ```
   
   c. ZIP deploy:
   ```bash
   zip -r deployment.zip . -x "node_modules/*" ".git/*" ".env*"
   az webapp deployment source config-zip --resource-group DocketCalendarAPI --name docketcalendar-api --src deployment.zip
   ```

### 3. Configure Custom Domain

1. Get the IP address of your Azure App Service:
   ```bash
   az webapp show --name docketcalendar-api --resource-group DocketCalendarAPI --query outboundIpAddresses --output tsv
   ```

2. Log into GoDaddy and add DNS records:
   - Type: A Record
   - Host: api
   - Value: [IP from previous step]
   - TTL: 600 seconds

3. Add TXT record (if needed for verification):
   - Type: TXT
   - Host: asuid.api
   - Value: [Value from Azure verification]
   - TTL: 600 seconds

4. Configure the custom domain in Azure:
   ```bash
   az webapp config hostname add --webapp-name docketcalendar-api --resource-group DocketCalendarAPI --hostname api.docketcalendar.com
   ```

5. Add SSL certificate:
   ```bash
   az webapp config ssl create --name docketcalendar-api --resource-group DocketCalendarAPI --hostname api.docketcalendar.com
   ```

6. Enable HTTPS only:
   ```bash
   az webapp update --resource-group DocketCalendarAPI --name docketcalendar-api --https-only true
   ```

## Testing Your Deployment

1. Check if the API is running:
   - Default Azure URL: https://docketcalendar-api.azurewebsites.net
   - Custom domain: https://api.docketcalendar.com

2. Test the documentation: 
   - https://api.docketcalendar.com/api-docs

3. Test the API endpoints:
   - https://api.docketcalendar.com/api/v1/auth/validate-token (requires token)

## Troubleshooting

1. Check application logs:
   ```bash
   az webapp log tail --name docketcalendar-api --resource-group DocketCalendarAPI
   ```

2. Restart the web app if needed:
   ```bash
   az webapp restart --name docketcalendar-api --resource-group DocketCalendarAPI
   ```

3. Verify environment variables:
   ```bash
   az webapp config appsettings list --name docketcalendar-api --resource-group DocketCalendarAPI
   ``` 