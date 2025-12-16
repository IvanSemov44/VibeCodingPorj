$ErrorActionPreference = 'Stop'
function Get-Session($email, $password) {
  $sess = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  Invoke-WebRequest -Uri 'http://localhost:8201/sanctum/csrf-cookie' -WebSession $sess -UseBasicParsing | Out-Null
  $cookie = $sess.Cookies.GetCookies('http://localhost:8201') | Where-Object { $_.Name -eq 'XSRF-TOKEN' }
  $xsrf = $cookie.Value
  $decoded = [System.Net.WebUtility]::UrlDecode($xsrf)
  Write-Output "Logging in as $email"
  $body = @{ email = $email; password = $password } | ConvertTo-Json
  $login = Invoke-RestMethod -Uri 'http://localhost:8201/api/login' -Method Post -WebSession $sess -Headers @{ 'X-XSRF-TOKEN' = $decoded } -Body $body -ContentType 'application/json'
  return @{ session = $sess; token = $decoded; user = $login }
}

Write-Output "=== Owner (cli@local) tests ==="
$owner = Get-Session 'cli@local' 'P@ssw0rd!'
$sess = $owner.session; $token = $owner.token
# GET pending
try {
  $pending = Invoke-RestMethod -Uri 'http://localhost:8201/api/admin/tools/pending' -Method Get -WebSession $sess -Headers @{ 'X-XSRF-TOKEN' = $token } -ContentType 'application/json'
  Write-Output "Pending count: $($pending.data.Count)"
} catch {
  Write-Output "Failed to fetch pending: $($_.Exception.Message)"
  if ($_.Exception -and $_.Exception.Response) {
    try { Write-Output $_.Exception.Response.StatusCode.value__ } catch { Write-Output "Unable to read Response.StatusCode" }
  }
}

# Approve a pending tool (use first pending if exists)
if ($pending.data.Count -gt 0) {
  $toolId = $pending.data[0].id
  Write-Output "Approving tool id $toolId"
  $approve = Invoke-WebRequest -Uri "http://localhost:8201/api/admin/tools/$toolId/approve" -Method Post -WebSession $sess -Headers @{ 'X-XSRF-TOKEN' = $token } -UseBasicParsing
  Write-Output "Approve status: $($approve.StatusCode)"
} else { Write-Output "No pending tools to approve" }

# Reject another pending tool with reason
if ($pending.data.Count -gt 1) {
  $toolId2 = $pending.data[1].id
  Write-Output "Rejecting tool id $toolId2 with reason 'Does not meet guidelines'"
  $body = @{ reason = 'Does not meet guidelines' } | ConvertTo-Json
  $reject = Invoke-WebRequest -Uri "http://localhost:8201/api/admin/tools/$toolId2/reject" -Method Post -WebSession $sess -Headers @{ 'X-XSRF-TOKEN' = $token } -Body $body -ContentType 'application/json' -UseBasicParsing
  Write-Output "Reject status: $($reject.StatusCode)"
} else { Write-Output "No second pending tool to reject" }

# Check pending list again
$pending2 = Invoke-RestMethod -Uri 'http://localhost:8201/api/admin/tools/pending' -Method Get -WebSession $sess -Headers @{ 'X-XSRF-TOKEN' = $token } -ContentType 'application/json'
Write-Output "Pending count after actions: $($pending2.data.Count)"

Write-Output "=== Non-admin (elena@frontend.local) authorization test ==="
$nonadmin = Get-Session 'elena@frontend.local' 'P@ssw0rd!'
$sess2 = $nonadmin.session; $token2 = $nonadmin.token
try {
  $resp = Invoke-WebRequest -Uri "http://localhost:8201/api/admin/tools/71/approve" -Method Post -WebSession $sess2 -Headers @{ 'X-XSRF-TOKEN' = $token2 } -UseBasicParsing -ErrorAction Stop
  Write-Output "Non-admin approve unexpectedly succeeded: $($resp.StatusCode)"
} catch {
  Write-Output "Non-admin approve failed: $($_.Exception.Message)"
  if ($_.Exception -and $_.Exception.Response) {
    try { Write-Output "Non-admin approve returned status: $($_.Exception.Response.StatusCode.value__)" } catch { Write-Output "Unable to read Response.StatusCode" }
  }
}

Write-Output "=== Anonymous request test ==="
try {
  $anon = Invoke-WebRequest -Uri 'http://localhost:8201/api/admin/tools/pending' -Method Get -UseBasicParsing -ErrorAction Stop
  Write-Output "Anonymous access unexpectedly succeeded: $($anon.StatusCode)"
} catch {
  Write-Output "Anonymous request failed: $($_.Exception.Message)"
  if ($_.Exception -and $_.Exception.Response) {
    try { Write-Output "Anonymous pending returned status: $($_.Exception.Response.StatusCode.value__)" } catch { Write-Output "Unable to read Response.StatusCode" }
  }
}

Write-Output "Tests complete"
