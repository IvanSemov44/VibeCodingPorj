param(
    [string]$BaseUrl = 'http://localhost:8201'
)

Write-Host "Checking API health at $BaseUrl..."

try {
    $h = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get -Headers @{ Accept = 'application/json' } -ErrorAction Stop
    Write-Host "/api/health -> OK"
} catch {
    Write-Host "/api/health -> FAILED: $($_.Exception.Message)"
}

try {
    $t = Invoke-RestMethod -Uri "$BaseUrl/api/tools" -Method Get -Headers @{ Accept = 'application/json' } -ErrorAction Stop
    if ($t -and $t.data) { Write-Host "/api/tools -> OK (items: $($t.data.Count))" } else { Write-Host "/api/tools -> OK" }
} catch {
    Write-Host "/api/tools -> FAILED: $($_.Exception.Message)"
}
