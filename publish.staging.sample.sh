#!/bin/bash

export TAURI_PRIVATE_KEY="PATH TO KEY"
export TAURI_KEY_PASSWORD=""
GITHUB_TOKEN="GITHUB PERSONAL ACCESS TOKEN"
REPO="Midwest-Diesel/inventory-desktop"

npm run tauri build -- --debug --config src-tauri/tauri.staging.conf.json
version=$(jq -r '.package.version' src-tauri/tauri.staging.conf.json)

product_name="Inventory-Staging"
safe_product_name=$(echo "$product_name" | sed 's/ /\\ /g')
bundle_dir="src-tauri/target/debug/bundle/nsis"
signature_file="$bundle_dir/${product_name}_${version}_x64-setup.nsis.zip.sig"
zip_file="$bundle_dir/${product_name}_${version}_x64-setup.nsis.zip"
latest_json="latest.staging.json"

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

# Delete any existing staging release
existing_staging_ids=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/releases" \
  | jq -r '.[] | select(.tag_name | contains("-staging")) | .id')

for release_id in $existing_staging_ids; do
  echo "Deleting previous staging release (ID $release_id)..."
  curl -s -X DELETE -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/releases/$release_id"
done

TAG="v${version}-staging"
TITLE="Staging v${version}"
BODY=""

# Create the GitHub release
response=$(curl -s -X POST "https://api.github.com/repos/$REPO/releases" \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d @- <<EOF
{
  "tag_name": "$TAG",
  "name": "$TITLE",
  "body": "$BODY",
  "draft": false,
  "prerelease": true
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
fi

if [ -d "$bundle_dir" ]; then
  rm -rf "$bundle_dir"/*
else
  echo "Error cleaning files in $bundle_dir"
fi
