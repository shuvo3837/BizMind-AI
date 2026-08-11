$ErrorActionPreference = 'Continue'
$path = 'C:\projects\New folder\BizMind-AI\bizmind-client\src\pages\Reports\ReportsPage.jsx'
$raw = Get-Content $path -Raw
Write-Output ('size=' + ([System.Text.Encoding]::UTF8.GetByteCount($raw)))
$lines = $raw -split "`r?`n"
Write-Output '---LINE_COUNT---'
$lines.Count
Write-Output '---LINE_BY_LINE---'
for ($i = 0; $i -lt $lines.Count; $i++) {
  Write-Output (('L' + ($i + 1).ToString().PadLeft(3) + ': ') + $lines[$i])
}
Write-Output '---VITE_TRANSFORM---'
try {
  $r = Invoke-WebRequest -Uri 'http://127.0.0.1:4000/src/pages/Reports/ReportsPage.jsx' -Headers @{Accept='*/*'} -UseBasicParsing
  Write-Output ('status=' + $r.StatusCode)
  Write-Output ('len=' + $r.Content.Length)
  Write-Output '---HEAD---'
  $r.Content.Substring(0, [Math]::Min(800, $r.Content.Length))
} catch {
  Write-Output ('ERR ' + $_.Exception.Message)
}
