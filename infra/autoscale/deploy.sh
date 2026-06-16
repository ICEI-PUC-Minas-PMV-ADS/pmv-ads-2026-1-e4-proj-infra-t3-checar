#!/bin/bash
# Deploy da infra de auto-scaling no Azure
# Uso: ./infra/autoscale/deploy.sh <resource-group> [location]

RESOURCE_GROUP=${1:-"checar-rg"}
LOCATION=${2:-"brazilsouth"}

echo "==> Fazendo deploy do auto-scaling em $RESOURCE_GROUP..."

az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file infra/autoscale/main.bicep \
  --parameters appServicePlanName=checar-plan appServiceName=checarapp location="$LOCATION" \
  --output table

echo "==> Deploy do monitoramento..."
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file infra/monitoring/applicationinsights.bicep \
  --parameters appServiceName=checarapp \
  --output table

echo "==> Concluído."
