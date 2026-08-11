Set-Location 'C:\projects\New folder\BizMind-AI\bizmind-server'
if (-not (Test-Path 'logs')) { New-Item -ItemType Directory -Path 'logs' | Out-Null }
$out = 'logs\server.out.log'
$err = 'logs\server.err.log'
$proc = Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory (Get-Location) -RedirectStandardOutput $out -RedirectStandardError $err -PassThru -WindowStyle Hidden
Write-Output ('STARTED_PID=' + $proc.Id)
Start-Sleep -Seconds 6
Write-Output '---STDOUT---'
Get-Content $out -Tail 25
Write-Output '---STDERR---'
if (Test-Path $err) { Get-Content $err -Tail 10 }
Write-Output '---PORT4000---'
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select-Object LocalPort,OwningProcess,State | Format-Table -AutoSize