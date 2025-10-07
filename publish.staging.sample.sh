#!/bin/bash

npm run tauri build -- --debug
version=$(jq -r '.package.version' src-tauri/tauri.conf.json)

bundle_dir="src-tauri/target/debug/bundle/nsis"
signature_file="$bundle_dir/Inventory_${version}_x64-setup.nsis.zip.sig"
zip_file="$bundle_dir/Inventory_${version}_x64-setup.nsis.zip"
latest_json="latest.json"

# Copy signature content
if [ -f "$signature_file" ]; then
  signature=$(cat "$signature_file")
else
  echo "Signature file not found for version $version!"
  exit 1
fi

pub_date=$(TZ=America/Chicago date -u +"%Y-%m-%dT%H:%M:%SZ")

jq --arg version "$version" \
   --arg versionPrefix "v$version-staging" \
   --arg signature "$signature" \
   --arg pub_date "$pub_date" \
   --arg notes "$notes" \
   '.version = $versionPrefix |
    .platforms."windows-x86_64".signature = $signature |
    .platforms."windows-x86_64".url = "file://'"$(pwd | sed 's/\\/\\\\/g')"'/'"$zip_file"'" |
    .pub_date = $pub_date' \
   "$latest_json" > tmp.json && mv tmp.json "$latest_json"

if [ -d "$bundle_dir" ]; then
  rm -rf "$bundle_dir"/*
else
  echo "Error cleaning files in $bundle_dir"
fi
