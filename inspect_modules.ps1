$ErrorActionPreference = 'Continue'
$urls = @(
  '/src/main.tsx',
  '/src/App.tsx',
  '/bizmind-client/src/App.jsx',
  '/bizmind-client/src/pages/Reports/ReportsPage.jsx',
  '/bizmind-client/src/main.jsx',
  '/bizmind-client/src/components/common/Card.jsx'
)
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri ('http://127.0.0.1:4000' + $u) -Headers @{Accept='*/*'} -UseBasicParsing
    $head = ($r.Content.Substring(0, [Math]::Min(220, $r.Content.Length)) -replace "`r?`n", ' ')
    Write-Output ('-- ' + $u + ' -> ' + $r.StatusCode + ' len=' + $r.Content.Length)
    Write-Output ('   ' + $head)
  } catch {
    Write-Output ('-- ' + $u + ' -> ERR ' + $_.Exception.Message)
  }
}