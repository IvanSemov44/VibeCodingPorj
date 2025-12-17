#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Detailed SQL Query Logger
.DESCRIPTION
    Captures and displays all SQL queries with timing for specific endpoints
#>

param(
    [string]$Endpoint = "/tools?status=approved&per_page=5"
)

$baseUrl = "http://localhost:8201/api"
$url = $baseUrl + $Endpoint

Write-Host "`n🔍 SQL Query Logger" -ForegroundColor Cyan
Write-Host "==================`n" -ForegroundColor Cyan
Write-Host "Endpoint: $Endpoint`n" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $url -Method GET -Headers @{
        'Accept' = 'application/json'
    } -SkipHttpErrorCheck
    
    $debugbarId = $response.Headers['phpdebugbar-id']
    
    if (-not $debugbarId) {
        Write-Host "❌ No debugbar data available. Make sure Laravel Debugbar is enabled." -ForegroundColor Red
        exit 1
    }
    
    $debugUrl = "http://localhost:8201/_debugbar/open?op=get&id=$debugbarId"
    $debugData = Invoke-RestMethod -Uri $debugUrl -Method GET
    
    if (-not $debugData.queries) {
        Write-Host "❌ No query data found" -ForegroundColor Red
        exit 1
    }
    
    $queries = $debugData.queries.statements
    $totalTime = $debugData.queries.accumulated_duration * 1000
    $queryCount = $debugData.queries.nb_statements
    
    Write-Host "📊 Summary" -ForegroundColor Green
    Write-Host "Total Queries: $queryCount"
    Write-Host "Total Time: $([math]::Round($totalTime, 2))ms"
    Write-Host ""
    
    Write-Host "📋 Query Details:" -ForegroundColor Cyan
    Write-Host "================`n" -ForegroundColor Cyan
    
    $queryNum = 1
    foreach ($query in $queries) {
        if ($query.type -eq "transaction") {
            continue
        }
        
        $duration = [math]::Round($query.duration * 1000, 2)
        $sql = $query.sql
        
        # Color code by duration
        $color = "White"
        if ($duration -gt 50) { $color = "Red" }
        elseif ($duration -gt 20) { $color = "Yellow" }
        else { $color = "Green" }
        
        Write-Host "Query #$queryNum ($($duration)ms)" -ForegroundColor $color
        Write-Host $sql -ForegroundColor Gray
        
        if ($query.bindings -and $query.bindings.Count -gt 0) {
            Write-Host "Bindings: $($query.bindings -join ', ')" -ForegroundColor DarkGray
        }
        
        Write-Host ""
        $queryNum++
    }
    
    # Analyze for patterns
    Write-Host "`n🔍 Analysis:" -ForegroundColor Cyan
    Write-Host "===========`n" -ForegroundColor Cyan
    
    # Check for N+1
    $sqlPatterns = @{}
    foreach ($query in $queries) {
        if ($query.type -eq "transaction") { continue }
        
        $normalized = $query.sql -replace '\d+', '?' -replace "'[^']*'", '?'
        
        if ($sqlPatterns.ContainsKey($normalized)) {
            $sqlPatterns[$normalized]++
        } else {
            $sqlPatterns[$normalized] = 1
        }
    }
    
    $repeated = $sqlPatterns.GetEnumerator() | Where-Object { $_.Value -gt 1 } | Sort-Object -Property Value -Descending
    
    if ($repeated) {
        Write-Host "⚠️  Repeated Queries (possible N+1):" -ForegroundColor Yellow
        foreach ($r in $repeated) {
            Write-Host "  • Executed $($r.Value) times:" -ForegroundColor Yellow
            $shortSql = $r.Key.Substring(0, [Math]::Min(120, $r.Key.Length))
            Write-Host "    $shortSql..." -ForegroundColor Gray
        }
    } else {
        Write-Host "✅ No repeated queries detected - good eager loading!" -ForegroundColor Green
    }
    
    # Check for slow queries
    $slowQueries = $queries | Where-Object { $_.type -ne "transaction" -and ($_.duration * 1000) -gt 50 }
    
    if ($slowQueries) {
        Write-Host "`n⚠️  Slow Queries (>50ms):" -ForegroundColor Red
        foreach ($q in $slowQueries) {
            $duration = [math]::Round($q.duration * 1000, 2)
            Write-Host "  • ${duration}ms: $($q.sql.Substring(0, [Math]::Min(100, $q.sql.Length)))..." -ForegroundColor Red
        }
    } else {
        Write-Host "`n✅ No slow queries detected!" -ForegroundColor Green
    }
    
    # Check for missing indexes
    $fullScans = $queries | Where-Object { $_.sql -like "*where*" -and $_.sql -notlike "*limit 1*" }
    
    if ($fullScans.Count -gt 0) {
        Write-Host "`n💡 Consider adding indexes for:" -ForegroundColor Yellow
        foreach ($scan in $fullScans) {
            if ($scan.sql -match "where\s+`([^`]+)`\s*=") {
                $column = $matches[1]
                Write-Host "  • Column: $column" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "`n✅ Analysis complete!`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
