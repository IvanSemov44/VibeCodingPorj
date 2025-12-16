$ErrorActionPreference = 'Stop'

$sess = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-WebRequest -Uri 'http://localhost:8201/sanctum/csrf-cookie' -WebSession $sess -UseBasicParsing | Out-Null
$cookie = $sess.Cookies.GetCookies('http://localhost:8201') | Where-Object { $_.Name -eq 'XSRF-TOKEN' }
$xsrf = $cookie.Value
$decoded = [System.Net.WebUtility]::UrlDecode($xsrf)
Write-Output "XSRF: $decoded"

# Login
$body = @{ email = 'cli@local'; password = 'P@ssw0rd!' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:8201/api/login' -Method Post -WebSession $sess -Headers @{ 'X-XSRF-TOKEN' = $decoded } -Body $body -ContentType 'application/json'
Write-Output "Login response:"
$login | ConvertTo-Json -Depth 4 | Write-Output

# Approve a pending tool (use an existing id)
$toolId = 71
$approve = Invoke-WebRequest -Uri "http://localhost:8201/api/admin/tools/$toolId/approve" -Method Post -WebSession $sess -Headers @{ 'X-XSRF-TOKEN' = $decoded } -UseBasicParsing
Write-Output "Approve status: $($approve.StatusCode)"
Write-Output "Approve body:"
$approve.Content | Write-Output
