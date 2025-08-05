#!/bin/bash

export TAURI_PRIVATE_KEY="PATH TO KEY"
export TAURI_KEY_PASSWORD=""

npm run tauri build
version=$(jq -r '.package.version' src-tauri/tauri.conf.json)

bundle_dir="src-tauri/target/release/bundle/nsis"
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

echo "Enter notes for this release (enter nothing to skip):"
read -r notes

jq --arg version "$version" \
   --arg versionPrefix "v$version" \
   --arg signature "$signature" \
   --arg pub_date "$pub_date" \
   --arg notes "$notes" \
   '.version = $versionPrefix |
    .platforms."windows-x86_64".signature = $signature |
    .platforms."windows-x86_64".url = "https://github.com/Midwest-Diesel/inventory-desktop/releases/download/v\($version)/Inventory_\($version)_x64-setup.nsis.zip" |
    .pub_date = $pub_date |
    .notes = $notes' \
   "$latest_json" > tmp.json && mv tmp.json "$latest_json"

echo "latest.json updated with version $version."


GITHUB_TOKEN="GITHUB PERSONAL ACCESS TOKEN"
REPO="Midwest-Diesel/inventory-desktop"
TAG="v$version"
TITLE="v$version"
BODY="Release for version $version"

# Create the release
response=$(curl -s -X POST "https://api.github.com/repos/$REPO/releases" \
-H "Authorization: token $GITHUB_TOKEN" \
-H "Accept: application/vnd.github.v3+json" \
-d @- <<EOF
{
  "tag_name": "$TAG",
  "name": "$TITLE",
  "body": "$BODY",
  "draft": false,
  "prerelease": false
}
EOF
)

upload_url=$(echo "$response" | jq -r '.upload_url' | sed "s/{?name,label}//")

if [ "$upload_url" != "null" ]; then
  echo "Uploading $zip_file..."
  curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary @"$zip_file" \
  "$upload_url?name=$(basename "$zip_file")"
else
  echo "Failed to create release: $response"
  exit 1
fi

if [ -d "$bundle_dir" ]; then
  rm -rf "$bundle_dir"/*
else
  echo "Error cleaning files in $bundle_dir"
fi
