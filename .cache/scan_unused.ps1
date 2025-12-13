Set-StrictMode -Version Latest
Write-Output "Scanning frontend/components and frontend/pages for likely unreferenced files..."
$repoRoot = "C:\Users\ivans\Desktop\Dev\VibeCodingProj\full-stack-starter-kit"
$outDir = "C:\tmp\unused_scan"
if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
New-Item -ItemType Directory -Path $outDir | Out-Null
$files = Get-ChildItem -Path (Join-Path $repoRoot 'frontend\components'),(Join-Path $repoRoot 'frontend\pages') -Recurse -File -Include *.tsx,*.ts,*.js,*.jsx | Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.next\\' }
$files | ForEach-Object { $_.FullName } | Out-File -FilePath (Join-Path $outDir 'all_files.txt') -Encoding utf8
"" | Out-File -FilePath (Join-Path $outDir 'unreferenced.txt') -Encoding utf8
 $searchFiles = Get-ChildItem -Path $repoRoot -Recurse -File -Include *.tsx,*.ts,*.js,*.jsx | Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.next\\' }
foreach ($f in $files) {
    $base = [System.IO.Path]::GetFileName($f.FullName)
    $name = [System.IO.Path]::GetFileNameWithoutExtension($f.FullName)
    $pathNoExt = $f.FullName.Substring(0,$f.FullName.LastIndexOf('.'))
    $refCount = 0
    try {
        $pat1 = "from .*${name}"
        if (Select-String -Path ($searchFiles.FullName) -Pattern $pat1 -Quiet) { $refCount++ }
    } catch {}
    try {
        $pat2 = "<${name}\b"
        if (Select-String -Path ($searchFiles.FullName) -Pattern $pat2 -Quiet) { $refCount++ }
    } catch {}
    try {
        $pat3 = "import\s+.*\b${name}\b"
        if (Select-String -Path ($searchFiles.FullName) -Pattern $pat3 -Quiet) { $refCount++ }
    } catch {}
    try {
        $escaped = [Regex]::Escape($pathNoExt)
        if (Select-String -Path ($searchFiles.FullName) -Pattern $escaped -Quiet) { $refCount++ }
    } catch {}
    if ($refCount -eq 0) {
        $f.FullName | Out-File -FilePath (Join-Path $outDir 'unreferenced.txt') -Append -Encoding utf8
    }
}
$count = (Get-Content (Join-Path $outDir 'unreferenced.txt') | Measure-Object -Line).Lines
Write-Output "Scan complete. Found $count candidate unreferenced files."
Get-ChildItem $outDir | Format-Table -AutoSize
