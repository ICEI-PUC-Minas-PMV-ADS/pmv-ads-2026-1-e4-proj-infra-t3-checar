@description('Nome do App Service')
param appServiceName string = 'checarapp'

resource appService 'Microsoft.Web/sites@2023-01-01' existing = {
  name: appServiceName
}

// Health check nativo do Azure App Service
resource healthCheck 'Microsoft.Web/sites/config@2023-01-01' = {
  parent: appService
  name: 'web'
  properties: {
    healthCheckPath: '/health'
  }
}
