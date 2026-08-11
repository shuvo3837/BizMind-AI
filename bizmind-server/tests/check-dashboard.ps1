$ErrorActionPreference = 'Stop'
try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:4000/api/analytics/dashboard' -UseBasicParsing -Headers @{ Cookie = 'dev_bypass=1' } -TimeoutSec 30
  Write-Host 'Status:' $resp.StatusCode
  $body = $resp.Content | ConvertFrom-Json
  Write-Host 'HasData:' $body.data.hasData
  Write-Host 'KPIs:' ($body.data.kpis | ConvertTo-Json -Compress)
  Write-Host 'ChartsKeys:' ($body.data.charts.PSObject.Properties.Name -join ',')
  Write-Host 'SalesByCategory count:' $body.data.charts.salesByCategory.Count
  Write-Host 'ExpenseAllocation count:' $body.data.charts.expenseAllocation.Count
  Write-Host 'RevenueTrend count:' $body.data.charts.revenueTrend.Count
  Write-Host 'Granularity:' $body.data.charts.revenueTrendGranularity
  Write-Host 'TrendStats:' ($body.data.charts.trendStats | ConvertTo-Json -Compress)
  Write-Host 'InventoryVsReorder count:' $body.data.inventoryVsReorder.Count
  Write-Host 'LowStock count:' $body.data.lowStockItems.Count
  Write-Host 'Insights keys:' ($body.data.insights.PSObject.Properties.Name -join ',')
  Write-Host 'ProfitAnalysis:' ($body.data.profitAnalysis | ConvertTo-Json -Compress)
  Write-Host 'DataQuality:' ($body.data.dataQuality | ConvertTo-Json -Compress)
  Write-Host 'Counts:' ($body.data.counts | ConvertTo-Json -Compress)
  Write-Host 'Insights content:' ($body.data.insights | ConvertTo-Json -Compress)
} catch {
  Write-Host 'ERR:' $_.Exception.Message
  if ($_.Exception.Response) {
    try { Write-Host 'Body:' (New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch {}
  }
}
