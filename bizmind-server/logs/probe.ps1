$rand = [guid]::NewGuid().ToString().Substring(0,8)
$email = "probe-$rand@bizmind.test"
$password = 'Probe1234!'
$name = "Probe $rand"

$regBody = @{ name=$name; email=$email; password=$password; businessName='ProbeBiz' } | ConvertTo-Json
$token = $null
try {
  $reg = Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/register' -Method Post -ContentType 'application/json' -Body $regBody -ErrorAction Stop
  $token = $reg.data.token
  Write-Output ("REG OK: token=" + $token.Substring(0,20) + "...")
} catch {
  Write-Output ("REG FAIL: " + $_.Exception.Message)
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Output ("Body: " + $reader.ReadToEnd())
  }
  exit 1
}

$headers = @{ Authorization = "Bearer $token" }

try {
  $status = Invoke-RestMethod -Uri 'http://localhost:4000/api/ai/status' -Headers $headers -ErrorAction Stop
  Write-Output '--- AI STATUS ---'
  $status | ConvertTo-Json -Depth 4
} catch {
  Write-Output ("STATUS FAIL: " + $_.Exception.Message)
}

try {
  $jsonBody = '{"prompt":"Give me three general tips to improve gross margin for a small e-commerce business."}'
  $chat = Invoke-WebRequest -Uri 'http://localhost:4000/api/ai/chat' -Method Post -Headers $headers -ContentType 'application/json; charset=utf-8' -Body $jsonBody -TimeoutSec 90 -UseBasicParsing -ErrorAction Stop
  Write-Output ('CHAT HTTP ' + $chat.StatusCode)
  Write-Output $chat.Content
} catch {
  Write-Output ('CHAT FAIL: ' + $_.Exception.Message)
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Output ('Body: ' + $reader.ReadToEnd())
  }
}
