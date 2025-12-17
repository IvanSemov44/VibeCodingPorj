#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive Database Query Performance Analyzer
.DESCRIPTION
    Tests all API endpoints, captures database queries, analyzes performance,
    and identifies N+1 queries, slow queries, and other issues.
.EXAMPLE
    .\scripts\analyze-db-queries.ps1
#>

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8201/api"
$results = @()
$issues = @()

Write-Host "`n🔍 Database Query Performance Analyzer" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Helper function to make API requests and extract debugbar data
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Description,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [bool]$RequiresAuth = $false
    )

    $url = "$baseUrl$Path"
    $defaultHeaders = @{
        'Accept' = 'application/json'
        'Content-Type' = 'application/json'
    }

    $allHeaders = $defaultHeaders + $Headers

    Write-Host "Testing: $Method $Path" -ForegroundColor Yellow
    Write-Host "  Description: $Description"

    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $allHeaders
            TimeoutSec = 30
        }

        if ($Body) {
            $params.Body = $Body
        }

        $startTime = Get-Date
        $response = Invoke-WebRequest @params -SkipHttpErrorCheck
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds

        # Try to get debugbar headers
        $debugbarId = $response.Headers['phpdebugbar-id']
        $queryCount = 0
        $queryTime = 0
        $queries = @()

        if ($debugbarId) {
            try {
                $debugbarUrl = "http://localhost:8201/_debugbar/open?op=get&id=$debugbarId"
                $debugData = Invoke-RestMethod -Uri $debugbarUrl -Method Get

                if ($debugData.queries) {
                    $queryCount = $debugData.queries.nb_statements
                    $queryTime = [math]::Round($debugData.queries.accumulated_duration * 1000, 2)
                    $queries = $debugData.queries.statements
                }
            } catch {
                Write-Host "  ⚠️  Could not fetch debugbar data" -ForegroundColor Yellow
            }
        }

        $result = [PSCustomObject]@{
            Method = $Method
            Path = $Path
            Description = $Description
            StatusCode = $response.StatusCode
            Duration = [math]::Round($duration, 2)
            QueryCount = $queryCount
            QueryTime = $queryTime
            Queries = $queries
            Success = $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
        }

        $results += $result

        # Display summary
        $statusColor = if ($result.Success) { "Green" } else { "Red" }
        Write-Host "  Status: $($result.StatusCode)" -ForegroundColor $statusColor
        Write-Host "  Response Time: $($result.Duration)ms"
        Write-Host "  DB Queries: $queryCount (${queryTime}ms)"

        # Analyze for issues
        if ($queryCount -gt 10) {
            $issue = "⚠️  HIGH QUERY COUNT: $queryCount queries on $Method $Path"
            Write-Host "  $issue" -ForegroundColor Red
            $script:issues += $issue
        }

        if ($queryTime -gt 100) {
            $issue = "⚠️  SLOW QUERIES: ${queryTime}ms total on $Method $Path"
            Write-Host "  $issue" -ForegroundColor Red
            $script:issues += $issue
        }

        # Check for N+1 patterns (same query repeated)
        if ($queries) {
            $querySignatures = @{}
            foreach ($q in $queries) {
                $sql = $q.sql -replace '\d+', '?' -replace "'[^']*'", '?'
                if ($querySignatures.ContainsKey($sql)) {
                    $querySignatures[$sql]++
                } else {
                    $querySignatures[$sql] = 1
                }
            }

            $repeated = $querySignatures.GetEnumerator() | Where-Object { $_.Value -gt 3 }
            if ($repeated) {
                foreach ($r in $repeated) {
                    $issue = "⚠️  N+1 QUERY: Query repeated $($r.Value) times on $Method $Path"
                    Write-Host "  $issue" -ForegroundColor Red
                    Write-Host "    SQL: $($r.Key.Substring(0, [Math]::Min(80, $r.Key.Length)))..." -ForegroundColor Gray
                    $script:issues += $issue
                }
            }
        }

        Write-Host ""
        return $result

    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
        Write-Host ""

        $result = [PSCustomObject]@{
            Method = $Method
            Path = $Path
            Description = $Description
            StatusCode = 0
            Duration = 0
            QueryCount = 0
            QueryTime = 0
            Queries = @()
            Success = $false
            Error = $_.Exception.Message
        }

        $results += $result
        return $result
    }
}

# ============================================================================
# PUBLIC ENDPOINTS (No Auth Required)
# ============================================================================

Write-Host "`n📂 PUBLIC ENDPOINTS" -ForegroundColor Magenta
Write-Host "==================`n" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Path "/health" -Description "Health check"
Test-Endpoint -Method "GET" -Path "/ready" -Description "Readiness check"
Test-Endpoint -Method "GET" -Path "/categories" -Description "List all categories"
Test-Endpoint -Method "GET" -Path "/tags" -Description "List all tags"
Test-Endpoint -Method "GET" -Path "/roles" -Description "List all roles"
Test-Endpoint -Method "GET" -Path "/tools" -Description "List all tools (public)"
Test-Endpoint -Method "GET" -Path "/tools?per_page=20" -Description "List tools with pagination"
Test-Endpoint -Method "GET" -Path "/tools?status=approved" -Description "List approved tools"
Test-Endpoint -Method "GET" -Path "/tools?q=test" -Description "Search tools by keyword"
Test-Endpoint -Method "GET" -Path "/tools?difficulty=beginner" -Description "Filter tools by difficulty"
Test-Endpoint -Method "GET" -Path "/tools/1" -Description "Show single tool by ID"

# ============================================================================
# GENERATE PERFORMANCE REPORT
# ============================================================================

Write-Host "`n📊 PERFORMANCE SUMMARY" -ForegroundColor Cyan
Write-Host "=====================`n" -ForegroundColor Cyan

$successCount = ($results | Where-Object { $_.Success }).Count
$totalCount = $results.Count
$avgDuration = [math]::Round(($results | Measure-Object -Property Duration -Average).Average, 2)
$avgQueries = [math]::Round(($results | Measure-Object -Property QueryCount -Average).Average, 2)
$avgQueryTime = [math]::Round(($results | Measure-Object -Property QueryTime -Average).Average, 2)

Write-Host "Total Endpoints Tested: $totalCount"
Write-Host "Successful Requests: $successCount"
Write-Host "Failed Requests: $($totalCount - $successCount)"
Write-Host "Average Response Time: ${avgDuration}ms"
Write-Host "Average DB Queries per Request: $avgQueries"
Write-Host "Average DB Query Time: ${avgQueryTime}ms"
Write-Host ""

# Top 5 slowest endpoints
Write-Host "`n🐌 SLOWEST ENDPOINTS" -ForegroundColor Red
Write-Host "===================`n" -ForegroundColor Red

$slowest = $results | Sort-Object -Property Duration -Descending | Select-Object -First 5
foreach ($endpoint in $slowest) {
    Write-Host "$($endpoint.Method) $($endpoint.Path)" -ForegroundColor Yellow
    Write-Host "  Response: $($endpoint.Duration)ms | Queries: $($endpoint.QueryCount) ($($endpoint.QueryTime)ms)"
}

# Top 5 query-heavy endpoints
Write-Host "`n🔥 QUERY-HEAVY ENDPOINTS" -ForegroundColor Red
Write-Host "=======================`n" -ForegroundColor Red

$queryHeavy = $results | Sort-Object -Property QueryCount -Descending | Select-Object -First 5
foreach ($endpoint in $queryHeavy) {
    Write-Host "$($endpoint.Method) $($endpoint.Path)" -ForegroundColor Yellow
    Write-Host "  Queries: $($endpoint.QueryCount) ($($endpoint.QueryTime)ms) | Response: $($endpoint.Duration)ms"
}

# Issues summary
if ($issues.Count -gt 0) {
    Write-Host "`n❌ ISSUES FOUND: $($issues.Count)" -ForegroundColor Red
    Write-Host "===================`n" -ForegroundColor Red

    $uniqueIssues = $issues | Select-Object -Unique
    foreach ($issue in $uniqueIssues) {
        Write-Host "  $issue"
    }
} else {
    Write-Host "`n✅ NO ISSUES FOUND!" -ForegroundColor Green
}

# Export detailed results to JSON
$reportPath = ".\reports\query-analysis-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').json"
$reportDir = Split-Path $reportPath -Parent

if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    summary = @{
        total_endpoints = $totalCount
        successful = $successCount
        failed = $totalCount - $successCount
        avg_response_time_ms = $avgDuration
        avg_queries = $avgQueries
        avg_query_time_ms = $avgQueryTime
    }
    issues = $issues | Select-Object -Unique
    endpoints = $results
}

$report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "`n📄 Detailed report saved to: $reportPath" -ForegroundColor Green
Write-Host "`n✅ Analysis complete!`n" -ForegroundColor Cyan
