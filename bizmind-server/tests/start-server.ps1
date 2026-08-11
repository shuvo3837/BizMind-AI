$ErrorActionPreference = 'Stop'
Set-Location "c:\projects\New folder\BizMind-AI\bizmind-server"
# Real JWT auth. Each registered user gets a unique business and isolated data.
$env:BYPASS_AUTH = 'false'
$proc = Start-Process -FilePath "node" -ArgumentList "server.js" -RedirectStandardOutput "server.out.log" -RedirectStandardError "server.err.log" -NoNewWindow -PassThru
Write-Host "Started PID:" $proc.Id
Start-Sleep -Seconds 3
$running = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
if ($running) {
  Write-Host "Still running:" $running.Id $running.ProcessName
} else {
  Write-Host "Died. Logs:"
  Write-Host "---OUT---"
  Get-Content "server.out.log" -Tail 30
  Write-Host "---ERR---"
  Get-Content "server.err.log" -Tail 30
}
