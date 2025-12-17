#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick Database Query Performance Check
.DESCRIPTION
    Tests key API endpoints and displays database query performance metrics
#>

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8201/api"

Write-Host "`n🔍 Database Query Performance Check" -ForegroundColor Cyan
Write-Host "===================================`n" -ForegroundColor Cyan

# Test endpoints
$endpoints = @(
    @{ Method = "GET"; Path = "/health"; Name = "Health Check" }
    @{ Method = "GET"; Path = "/categories"; Name = "Categories List" }
    @{ Method = "GET"; Path = "/tags"; Name = "Tags List" }
    @{ Method = "GET"; Path = "/roles"; Name = "Roles List" }
    @{ Method = "GET"; Path = "/tools"; Name = "Tools List (All)" }
    @{ Method = "GET"; Path = "/tools?per_page=20"; Name = "Tools (Paginated)" }
    @{ Method = "GET"; Path = "/tools?status=approved"; Name = "Approved Tools" }
    @{ Method = "GET"; Path = "/tools?q=ai"; Name = "Tools Search" }
    @{ Method = "GET"; Path = "/tools?difficulty=beginner"; Name = "Tools by Difficulty" }
    @{ Method = "GET"; Path = "/tools/71"; Name = "Single Tool" }
)

$results = @()

foreach ($endpoint in $endpoints) {
    $url = $baseUrl + $endpoint.Path
    
    Write-Host "Testing: $($endpoint.Name)" -ForegroundColor Yellow
    Write-Host "  $($endpoint.Method) $($endpoint.Path)" -ForegroundColor Gray
    
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $url -Method $endpoint.Method -Headers @{
            'Accept' = 'application/json'
        } -SkipHttpErrorCheck -TimeoutSec 10
        $endTime = Get-Date
        
        $duration = [math]::Round(($endTime - $startTime).TotalMilliseconds, 2)
        $statusCode = $response.StatusCode
        
        # Try to extract debugbar info from headers
        $debugbarId = $response.Headers['phpdebugbar-id']
        
        $queryCount = "N/A"
        $queryTime = "N/A"
        
        if ($debugbarId) {
            try {
                $debugUrl = "http://localhost:8201/_debugbar/open?op=get&id=$debugbarId"
                $debugData = Invoke-RestMethod -Uri $debugUrl -Method Get -TimeoutSec 5
                
                if ($debugData.queries) {
                    $queryCount = $debugData.queries.nb_statements
                    $queryTime = [math]::Round($debugData.queries.accumulated_duration * 1000, 2)
                }
            } catch {
                # Debugbar data not available
            }
        }
        
        $statusColor = if ($statusCode -ge 200 -and $statusCode -lt 300) { "Green" } else { "Red" }
        
        Write-Host "  ✓ Status: $statusCode" -ForegroundColor $statusColor
        Write-Host "  ⏱️  Response: ${duration}ms"
        Write-Host "  📊 Queries: $queryCount (${queryTime}ms)"
        
        # Warnings
        if ($queryCount -ne "N/A") {
            if ($queryCount -gt 10) {
                Write-Host "  ⚠️  HIGH QUERY COUNT!" -ForegroundColor Red
            }
            if ($queryTime -gt 50) {
                Write-Host "  ⚠️  SLOW QUERIES!" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        
        $results += [PSCustomObject]@{
            Endpoint = $endpoint.Name
            Status = $statusCode
            ResponseTime = $duration
            Queries = $queryCount
            QueryTime = $queryTime
        }
        
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
        Write-Host ""
        
        $results += [PSCustomObject]@{
            Endpoint = $endpoint.Name
            Status = "ERROR"
            ResponseTime = 0
            Queries = 0
            QueryTime = 0
        }
    }
}

Write-Host "`n📊 SUMMARY TABLE" -ForegroundColor Cyan
Write-Host "================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize

# Calculate statistics
$successResults = $results | Where-Object { $_.Queries -ne "N/A" -and $_.Queries -ne 0 }

if ($successResults) {
    $avgQueries = ($successResults.Queries | Measure-Object -Average).Average
    $maxQueries = ($successResults.Queries | Measure-Object -Maximum).Maximum
    $avgResponseTime = ($results | Where-Object { $_.ResponseTime -gt 0 } | Measure-Object -Property ResponseTime -Average).Average
    
    Write-Host "`n📈 STATISTICS" -ForegroundColor Cyan
    Write-Host "=============" -ForegroundColor Cyan
    Write-Host "Average Queries per Endpoint: $([math]::Round($avgQueries, 2))"
    Write-Host "Max Queries (Single Endpoint): $maxQueries"
    Write-Host "Average Response Time: $([math]::Round($avgResponseTime, 2))ms"
    
    # Identify problem endpoints
    $problems = $successResults | Where-Object { $_.Queries -gt 5 -or $_.QueryTime -gt 50 }
    
    if ($problems) {
        Write-Host "`n⚠️  POTENTIAL ISSUES:" -ForegroundColor Yellow
        Write-Host "===================" -ForegroundColor Yellow
        foreach ($p in $problems) {
            Write-Host "• $($p.Endpoint): $($p.Queries) queries, $($p.QueryTime)ms" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n✅ All endpoints performing well!" -ForegroundColor Green
    }
}

Write-Host "`n✅ Analysis complete!`n" -ForegroundColor Cyan
