$repo = 'C:\Users\ivans\Desktop\Dev\VibeCodingProj\full-stack-starter-kit\frontend'
$patterns = @(
  'TwoFactorSetup',
  'useFileUpload',
  'useFilters',
  'jest.setup',
  'lib/constants',
  'lib/styles',
  'next-env.d.ts',
  'next.config',
  'store/hooks',
  'tailwind.config',
  'types.d.ts',
  'css-modules',
  'qrcode.d.ts'
)
$files = Get-ChildItem -Path $repo -Recurse -Include *.ts,*.tsx,*.js,*.jsx -ErrorAction SilentlyContinue | Where-Object {-not $_.PSIsContainer}
foreach ($p in $patterns) {
  Write-Output "=== $p ==="
  try {
    $matches = Select-String -Path ($files | ForEach-Object { $_.FullName }) -Pattern $p -SimpleMatch -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Path -Unique
    if ($matches) { $matches | ForEach-Object { Write-Output $_ } } else { Write-Output 'No matches' }
  } catch {
    Write-Output ("Error searching for {0}: {1}" -f $p, $_)
  }
}
