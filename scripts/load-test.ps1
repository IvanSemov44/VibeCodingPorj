#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Performance Load Testing & Benchmarking Tool
.DESCRIPTION
    Tests API endpoints under load, measures response times, and identifies bottlenecks.
.EXAMPLE
    .\scripts\load-test.ps1 -Concurrent 10 -Requests 100
#>

param(
    [int]$Concurrent = 5,
    [int]$Requests = 50,
    [string]$BaseUrl = "http://localhost:8201/api",
    [string]$OutputFile = "load-test-results.json"
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 Performance Load Testing Tool" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Base URL: $BaseUrl"
Write-Host "  Concurrent Requests: $Concurrent"
Write-Host "  Total Requests: $Requests"
Write-Host "  Output File: $OutputFile"
Write-Host ""

$endpoints = @(
    @{ Method = "GET"; Path = "/tools"; Description = "List tools" },
    @{ Method = "GET"; Path = "/categories"; Description = "List categories" },
    @{ Method = "GET"; Path = "/tags"; Description = "List tags" },
    @{ Method = "GET"; Path = "/tools?q=test"; Description = "Search tools" },
)

$results = @()
$totalStartTime = Get-Date

foreach ($endpoint in $endpoints) {
    Write-Host "Testing: $($endpoint.Description)" -ForegroundColor Green
    Write-Host "  $($endpoint.Method) $($endpoint.Path)"

    $url = "$BaseUrl$($endpoint.Path)"
    $endpointResults = @()

    $requestsPerWorker = [Math]::Ceiling($Requests / $Concurrent)

    # Simulate concurrent requests
    for ($i = 0; $i -lt $Concurrent; $i++) {
        $job = Start-Job -ScriptBlock {
            param($url, $requestsPerWorker)

            $localResults = @()

            for ($r = 0; $r -lt $requestsPerWorker; $r++) {
                try {
                    $startTime = Get-Date
                    $response = Invoke-WebRequest -Uri $url `
                        -UseBasicParsing `
                        -TimeoutSec 30 `
                        -ErrorAction Stop
                    $duration = (Get-Date) - $startTime

                    $localResults += @{
                        StatusCode = $response.StatusCode
                        Duration = $duration.TotalMilliseconds
                        Success = $true
                    }
                } catch {
                    $duration = (Get-Date) - $startTime
                    $localResults += @{
                        StatusCode = $_.Exception.Response.StatusCode
                        Duration = $duration.TotalMilliseconds
                        Success = $false
                        Error = $_.Exception.Message
                    }
                }
            }

            return $localResults
        } -ArgumentList @($url, $requestsPerWorker)
    }

    # Wait for jobs to complete
    $jobs = Get-Job
    foreach ($job in $jobs) {
        $jobResults = Receive-Job -Job $job -Wait
        $endpointResults += $jobResults
        Remove-Job -Job $job
    }

    # Analyze results
    $successCount = ($endpointResults | Where-Object { $_.Success }).Count
    $failureCount = ($endpointResults | Where-Object { -not $_.Success }).Count
    $avgDuration = ($endpointResults | Measure-Object -Property Duration -Average).Average
    $minDuration = ($endpointResults | Measure-Object -Property Duration -Minimum).Minimum
    $maxDuration = ($endpointResults | Measure-Object -Property Duration -Maximum).Maximum

    Write-Host "  Results:"
    Write-Host "    Successful: $successCount / $($endpointResults.Count)"
    Write-Host "    Failed: $failureCount"
    Write-Host "    Avg Response Time: $($avgDuration | Round 2)ms"
    Write-Host "    Min Response Time: $($minDuration | Round 2)ms"
    Write-Host "    Max Response Time: $($maxDuration | Round 2)ms"
    Write-Host ""

    $results += @{
        Endpoint = $endpoint.Path
        Description = $endpoint.Description
        TotalRequests = $endpointResults.Count
        SuccessCount = $successCount
        FailureCount = $failureCount
        AverageDuration = [Math]::Round($avgDuration, 2)
        MinDuration = [Math]::Round($minDuration, 2)
        MaxDuration = [Math]::Round($maxDuration, 2)
        SuccessRate = [Math]::Round(($successCount / $endpointResults.Count) * 100, 2)
    }
}

$totalDuration = (Get-Date) - $totalStartTime

Write-Host "Summary" -ForegroundColor Cyan
Write-Host "=======" -ForegroundColor Cyan
Write-Host ""

$resultsTable = $results | ForEach-Object {
    @{
        Endpoint = $_.Endpoint
        Requests = $_.TotalRequests
        Success = "$($_.SuccessCount)/$($_.TotalRequests)"
        "Success %" = "$($_.SuccessRate)%"
        "Avg (ms)" = $_.AverageDuration
        "Min (ms)" = $_.MinDuration
        "Max (ms)" = $_.MaxDuration
    }
}

Write-Host ""
$resultsTable | Format-Table -AutoSize
Write-Host ""

# Save results to file
$results | ConvertTo-Json | Out-File -FilePath $OutputFile -Encoding utf8
Write-Host "Results saved to: $OutputFile" -ForegroundColor Green

Write-Host ""
Write-Host "Total Test Duration: $($totalDuration.TotalSeconds | Round 2) seconds" -ForegroundColor Yellow

# Performance analysis
$avgResponseTime = ($results | Measure-Object -Property AverageDuration -Average).Average
$totalSuccessRate = ($results | Measure-Object -Property "SuccessRate" -Average).Average

Write-Host ""
Write-Host "Performance Analysis:" -ForegroundColor Cyan
Write-Host "  Average Response Time: $([Math]::Round($avgResponseTime, 2))ms"
Write-Host "  Overall Success Rate: $([Math]::Round($totalSuccessRate, 2))%"

if ($avgResponseTime -lt 100) {
    Write-Host "  Status: ✅ EXCELLENT (< 100ms)" -ForegroundColor Green
} elseif ($avgResponseTime -lt 500) {
    Write-Host "  Status: ⚠️  GOOD (< 500ms)" -ForegroundColor Yellow
} else {
    Write-Host "  Status: ❌ SLOW (> 500ms)" -ForegroundColor Red
}

if ($totalSuccessRate -ge 99) {
    Write-Host "  Reliability: ✅ EXCELLENT (99%+)" -ForegroundColor Green
} elseif ($totalSuccessRate -ge 95) {
    Write-Host "  Reliability: ⚠️  GOOD (95%+)" -ForegroundColor Yellow
} else {
    Write-Host "  Reliability: ❌ POOR (< 95%)" -ForegroundColor Red
}
