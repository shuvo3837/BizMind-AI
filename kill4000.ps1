$ports = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
foreach ($p in $ports) {
  try { Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
}
Start-Sleep -Seconds 1
$still = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
Write-Output ('after-kill: ' + ($still.Count -as [string]))
