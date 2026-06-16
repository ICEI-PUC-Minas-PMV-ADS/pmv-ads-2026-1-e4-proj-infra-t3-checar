@description('Nome do App Service Plan')
param appServicePlanName string = 'checar-plan'

@description('Nome do App Service')
param appServiceName string = 'checarapp'

@description('Localização')
param location string = resourceGroup().location

// App Service Plan com Standard S1 (mínimo para auto-scale)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'S1'
    tier: 'Standard'
    capacity: 2
  }
  properties: {
    reserved: false
  }
}

resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appServiceName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      nodeVersion: '22-lts'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      healthCheckPath: '/health'
      appSettings: [
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~22' }
        { name: 'NODE_ENV', value: 'production' }
      ]
    }
  }
}

// Auto-scaling rules
resource autoScaleSettings 'Microsoft.Insights/autoscalesettings@2022-10-01' = {
  name: '${appServicePlanName}-autoscale'
  location: location
  properties: {
    enabled: true
    targetResourceUri: appServicePlan.id
    profiles: [{
      name: 'default'
      capacity: {
        minimum: '2'
        maximum: '10'
        default: '2'
      }
      rules: [
        // Scale OUT: CPU > 70% por 5 min → +2 instâncias
        {
          metricTrigger: {
            metricName: 'CpuPercentage'
            metricResourceUri: appServicePlan.id
            timeGrain: 'PT1M'
            statistic: 'Average'
            timeWindow: 'PT5M'
            timeAggregation: 'Average'
            operator: 'GreaterThan'
            threshold: 70
          }
          scaleAction: {
            direction: 'Increase'
            type: 'ChangeCount'
            value: '2'
            cooldown: 'PT5M'
          }
        }
        // Scale IN: CPU < 30% por 10 min → -1 instância
        {
          metricTrigger: {
            metricName: 'CpuPercentage'
            metricResourceUri: appServicePlan.id
            timeGrain: 'PT1M'
            statistic: 'Average'
            timeWindow: 'PT10M'
            timeAggregation: 'Average'
            operator: 'LessThan'
            threshold: 30
          }
          scaleAction: {
            direction: 'Decrease'
            type: 'ChangeCount'
            value: '1'
            cooldown: 'PT10M'
          }
        }
        // Scale OUT: Memória > 75%
        {
          metricTrigger: {
            metricName: 'MemoryPercentage'
            metricResourceUri: appServicePlan.id
            timeGrain: 'PT1M'
            statistic: 'Average'
            timeWindow: 'PT5M'
            timeAggregation: 'Average'
            operator: 'GreaterThan'
            threshold: 75
          }
          scaleAction: {
            direction: 'Increase'
            type: 'ChangeCount'
            value: '1'
            cooldown: 'PT5M'
          }
        }
      ]
    }]
    notifications: [{
      operation: 'Scale'
      email: {
        sendToSubscriptionAdministrator: true
        sendToSubscriptionCoAdministrators: true
      }
    }]
  }
}

output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output appServicePlanId string = appServicePlan.id
