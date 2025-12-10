<#
Find illegal filenames and very long paths in the repository.
Usage: pwsh ./tools/find_illegal_paths.ps1
#>
param(
    [string]$Root = "$(Resolve-Path -LiteralPath .).Path"
)

Write-Host "Scanning root: $Root`n"

# Pattern of characters not allowed in Windows filenames: <>:"/\\|?*
$illegalPattern = '[<>:\\"/\\|?*]'

Write-Host '--- Files with illegal characters or trailing spaces/dots ---' -ForegroundColor Cyan
Get-ChildItem -Path $Root -Recurse -Force -ErrorAction SilentlyContinue | Where-Object {
    ($_.Name -match $illegalPattern) -or
    ($_.FullName -match '[\x00-\x1F]') -or
    ($_.Name -match '\s$') -or
    ($_.Name -match '\.$')
} | Select-Object FullName, Name | Format-Table -AutoSize

Write-Host "`n--- Files / Paths longer than 260 chars ---" -ForegroundColor Cyan
Get-ChildItem -Path $Root -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.FullName.Length -gt 260 } | Select-Object @{Name='Length';Expression={$_.FullName.Length}}, FullName | Sort-Object -Property Length -Descending | Format-Table -AutoSize

Write-Host "`nScan complete." -ForegroundColor Green
