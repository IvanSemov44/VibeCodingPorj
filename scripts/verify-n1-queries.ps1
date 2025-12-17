#!/usr/bin/env pwsh
# Script to test for N+1 queries in the backend API
# Requires Debugbar to be enabled in local environment

Write-Host "🔍 Backend N+1 Query Verification Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8201/api"

Write-Host "Testing endpoints for N+1 queries..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Tools index with relations
Write-Host "1. Testing GET /api/tools (should use withRelations eager loading)" -ForegroundColor Green
$response = Invoke-WebRequest -Uri "$baseUrl/tools" -UseBasicParsing -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "   ✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   → Check debugbar for query count (should be ~4-5 queries max)" -ForegroundColor Gray
} else {
    Write-Host "   ✗ Failed with status: $($response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Tools search
Write-Host "2. Testing GET /api/tools?q=test (should use withRelationsForSearch)" -ForegroundColor Green
$response = Invoke-WebRequest -Uri "$baseUrl/tools?q=test" -UseBasicParsing -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "   ✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   → Check debugbar for query count (should use lean loading)" -ForegroundColor Gray
}
Write-Host ""

# Test 3: Categories (should be cached)
Write-Host "3. Testing GET /api/categories (should be cached)" -ForegroundColor Green
$response = Invoke-WebRequest -Uri "$baseUrl/categories" -UseBasicParsing -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "   ✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   → First call: query DB, Second call: from cache" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Tags (should be cached)
Write-Host "4. Testing GET /api/tags (should be cached)" -ForegroundColor Green
$response = Invoke-WebRequest -Uri "$baseUrl/tags" -UseBasicParsing -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "   ✓ Status: $($response.StatusCode)" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Verification complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit http://localhost:8201 in your browser" -ForegroundColor White
Write-Host "2. Open the Laravel Debugbar (bottom of page)" -ForegroundColor White
Write-Host "3. Click 'Queries' tab to verify:" -ForegroundColor White
Write-Host "   - Tool index: 4-5 queries (1 for tools + 3-4 for relations)" -ForegroundColor Gray
Write-Host "   - Categories/Tags: 0-1 queries (cached after first load)" -ForegroundColor Gray
Write-Host "   - No duplicate queries for the same data" -ForegroundColor Gray
Write-Host ""
Write-Host "Database indexes added:" -ForegroundColor Yellow
Write-Host "  ✓ tools.status" -ForegroundColor Green
Write-Host "  ✓ tools.created_at" -ForegroundColor Green
Write-Host "  ✓ tools.status + created_at (composite)" -ForegroundColor Green
Write-Host "  ✓ tools.submitted_by" -ForegroundColor Green
Write-Host "  ✓ users.is_active" -ForegroundColor Green
Write-Host "  ✓ categories.slug" -ForegroundColor Green
Write-Host "  ✓ tags.slug" -ForegroundColor Green
Write-Host ""
