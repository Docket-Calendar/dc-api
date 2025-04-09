#!/bin/bash
# DocketCalendar API Deployment Script

echo "Starting deployment process for DocketCalendar API..."

# 1. Login to Azure
echo "Logging in to Azure..."
az login

# 2. Set subscription if needed
# az account set --subscription your-subscription-id

# 3. Create resource group if it doesn't exist
echo "Creating/checking resource group..."
az group create --name DocketCalendarAPI --location eastus

# 4. Create app service plan if it doesn't exist
echo "Creating/checking app service plan..."
az appservice plan create --name DocketCalendarPlan --resource-group DocketCalendarAPI --sku B1 --is-linux

# 5. Create web app if it doesn't exist
echo "Creating/checking web app..."
az webapp create --resource-group DocketCalendarAPI --plan DocketCalendarPlan --name docketcalendar-api --runtime "NODE:18-lts"

# 6. Configure app settings from .env.production
echo "Configuring app settings from .env.production..."
# Load variables from .env.production
if [ -f .env.production ]; then
  while IFS= read -r line; do
    # Skip comments and empty lines
    [[ $line =~ ^\# ]] && continue
    [[ -z $line ]] && continue
    
    # Extract variable name and value
    name=$(echo "$line" | cut -d '=' -f 1)
    value=$(echo "$line" | cut -d '=' -f 2-)
    
    # Set app setting
    echo "Setting $name..."
    az webapp config appsettings set --resource-group DocketCalendarAPI --name docketcalendar-api --settings "$name=$value"
  done < .env.production
else
  echo "Error: .env.production file not found!"
  exit 1
fi

# 7. Configure custom domain
echo "Would you like to configure the custom domain 'api.docketcalendar.com'? (y/n)"
read answer
if [ "$answer" == "y" ]; then
  echo "Adding custom domain..."
  az webapp config hostname add --webapp-name docketcalendar-api --resource-group DocketCalendarAPI --hostname api.docketcalendar.com
  
  echo "Creating and binding SSL certificate..."
  az webapp config ssl create --name docketcalendar-api --resource-group DocketCalendarAPI --hostname api.docketcalendar.com
fi

# 8. Enable HTTPS only
echo "Enabling HTTPS only..."
az webapp update --resource-group DocketCalendarAPI --name docketcalendar-api --https-only true

# 9. Deploy code
echo "Deploying code..."
echo "Choose deployment method:"
echo "1. Local Git"
echo "2. GitHub"
echo "3. ZIP deploy"
read deployment_method

case $deployment_method in
  1)
    echo "Setting up local Git deployment..."
    az webapp deployment source config-local-git --name docketcalendar-api --resource-group DocketCalendarAPI
    git_url=$(az webapp deployment source config-local-git --name docketcalendar-api --resource-group DocketCalendarAPI --query url -o tsv)
    echo "Add the Azure remote with: git remote add azure $git_url"
    echo "Then push with: git push azure main"
    ;;
  2)
    echo "Setting up GitHub deployment..."
    echo "Enter GitHub repository URL (e.g. https://github.com/username/repo):"
    read github_repo
    echo "Enter branch (e.g. main):"
    read github_branch
    az webapp deployment source config --name docketcalendar-api --resource-group DocketCalendarAPI --repo-url $github_repo --branch $github_branch --manual-integration
    ;;
  3)
    echo "Creating deployment ZIP..."
    zip -r deployment.zip . -x "node_modules/*" ".git/*" ".env*" "*.log"
    echo "Deploying ZIP package..."
    az webapp deployment source config-zip --resource-group DocketCalendarAPI --name docketcalendar-api --src deployment.zip
    ;;
  *)
    echo "Invalid option selected"
    exit 1
    ;;
esac

echo "Deployment completed successfully!"
echo "Your API should be available at: https://docketcalendar-api.azurewebsites.net"
echo "Custom domain (if configured): https://api.docketcalendar.com" 