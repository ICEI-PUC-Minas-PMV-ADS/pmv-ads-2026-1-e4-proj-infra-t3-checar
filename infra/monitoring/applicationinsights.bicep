@description('Nome do App Service')
param appServiceName string = 'checarapp'

@description('Location')
param location string = resourceGroup().location

resource workspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${appServiceName}-logs'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 90
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${appServiceName}-insights'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: workspace.id
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Alerta: taxa de erro 5xx > 5%
resource alert5xx 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${appServiceName}-5xx-alert'
  location: 'global'
  properties: {
    description: 'Alerta quando taxa de erro HTTP 5xx supera 5%'
    severity: 1
    enabled: true
    scopes: [appInsights.id]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [{
        name: 'HighErrorRate'
        metricName: 'requests/failed'
        operator: 'GreaterThan'
        threshold: 5
        timeAggregation: 'Count'
        criterionType: 'StaticThresholdCriterion'
      }]
    }
    autoMitigate: true
    actions: []
  }
}

// Alerta: tempo de resposta P95 > 2s
resource alertLatency 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${appServiceName}-latency-alert'
  location: 'global'
  properties: {
    description: 'Alerta quando P95 de latência supera 2 segundos'
    severity: 2
    enabled: true
    scopes: [appInsights.id]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [{
        name: 'HighLatency'
        metricName: 'requests/duration'
        operator: 'GreaterThan'
        threshold: 2000
        timeAggregation: 'Average'
        criterionType: 'StaticThresholdCriterion'
      }]
    }
    autoMitigate: true
    actions: []
  }
}

output connectionString string = appInsights.properties.ConnectionString
output instrumentationKey string = appInsights.properties.InstrumentationKey
