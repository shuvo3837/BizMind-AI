$ErrorActionPreference = 'Stop'
$TS = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$email = "autorep+$TS@bizmind.test"
$password = 'Test123!Strong'

# 1) register
$body = @{ name = 'AutoRep Co'; industry = 'Testing'; email = $email; password = $password } | ConvertTo-Json
$reg = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/api/auth/register' -Method POST -ContentType 'application/json' -Body $body
$token = $reg.data.token
$userId = $reg.data.user._id
Write-Output ("USER=" + $userId)

# 2) create business
$bb = @{ businessName = 'AutoRep Co'; industry = 'Testing' } | ConvertTo-Json
$bresp = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/api/business' -Method POST -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $bb
$bizId = $bresp.data._id
Write-Output ("BIZ=" + $bizId)

# 3) upload CSV
$csv = @'
productName,category,quantity,revenue,cost,date
Widget A,Electronics,5,250,100,2026-08-01
Widget B,Electronics,3,180,90,2026-08-02
Widget C,Furniture,2,400,200,2026-08-03
'@
$tmp = Join-Path $env:TEMP "autorep-$TS.csv"
Set-Content -Path $tmp -Value $csv -Encoding utf8 -NoNewline
$upJson = curl.exe -s -X POST -H "Authorization: Bearer $token" -F "file=@$tmp" http://127.0.0.1:4000/api/upload
Remove-Item $tmp -Force
Write-Output '---UPLOAD---'
Write-Output $upJson

# 4) list reports
$list = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/api/report/list' -Method GET -Headers @{ Authorization = "Bearer $token" }
Write-Output '---REPORT_LIST---'
$list.data | ForEach-Object {
  Write-Output ("REPORT id={0} title={1} status={2} totalRevenue={3} totalProfit={4} totalSales={5} profitMargin={6}" -f $_.id, $_.title, $_.status, $_.summary.totalRevenue, $_.summary.totalProfit, $_.summary.totalSales, $_.summary.profitMargin)
}