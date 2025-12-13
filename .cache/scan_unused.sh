#!/usr/bin/env bash
set -e
echo "Scanning frontend/components and frontend/pages for likely unreferenced files..."
rm -rf /tmp/unused_scan || true
mkdir -p /tmp/unused_scan
find frontend/components frontend/pages -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" > /tmp/unused_scan/all_files.txt
> /tmp/unused_scan/unreferenced.txt
while IFS= read -r f; do
  base=$(basename "$f")
  name="${base%.*}"
  ref_count=0
  # search by import from path (filename without extension)
  if grep -R --exclude-dir=node_modules --exclude-dir=.next -n "from ['\"]" -- "${name}" . >/dev/null 2>&1; then
    ref_count=$((ref_count+1))
  fi
  # search for JSX usage like <Name or <Name 
  if grep -R --exclude-dir=node_modules --exclude-dir=.next -n "<${name}[ >]" . >/dev/null 2>&1; then
    ref_count=$((ref_count+1))
  fi
  # search for import statements mentioning the name
  if grep -R --exclude-dir=node_modules --exclude-dir=.next -n "import .*${name}" . >/dev/null 2>&1; then
    ref_count=$((ref_count+1))
  fi
  # also try searching for path with filename (without extension)
  path_no_ext="${f%.*}"
  if grep -R --exclude-dir=node_modules --exclude-dir=.next -n "${path_no_ext}" . >/dev/null 2>&1; then
    ref_count=$((ref_count+1))
  fi
  if [ "$ref_count" -eq 0 ]; then
    echo "$f" >> /tmp/unused_scan/unreferenced.txt
  fi
done < /tmp/unused_scan/all_files.txt

echo "Scan complete. Found "$(wc -l < /tmp/unused_scan/unreferenced.txt)" candidate unreferenced files."
ls -la /tmp/unused_scan || true
