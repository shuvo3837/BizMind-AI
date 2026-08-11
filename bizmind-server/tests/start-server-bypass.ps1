$ErrorActionPreference = 'Stop'
Set-Location "c:\projects\New folder\BizMind-AI\bizmind-server"
# DEV-ONLY: bypass JWT. ALL requests resolve to the same dev sentinel user.
# Use this only for ad-hoc dev work, never for multi-user isolation testing.
$env:BYPASS_AUTH = 'true'
$proc = Start-Process -FilePath "node" -ArgumentList "server.js" -RedirectStandardOutput "server.bypass.out.log" -RedirectStandardError "server.bypass.err.log" -NoNewWindow -PassThru
Write-Host "Started PID:" $proc.Id
Start-Sleep -Seconds 3
$running = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
if ($running) {
  Write-Host "Still running:" $running.Id $running.ProcessName
} else {
  Write-Host "Died. Logs:"
  Write-Host "---OUT---"
  Get-Content "server.bypass.out.log" -Tail 30
  Write-Host "---ERR---"
  Get-Content "server.bypass.err.log" -Tail 30
}
