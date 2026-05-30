#!/bin/bash
# Generate TypeScript types from FastAPI OpenAPI spec
# Usage: bash scripts/generate-api-types.sh [API_URL]
set -euo pipefail

API_URL="${1:-${API_URL:-http://localhost:8000}}"
OUTPUT="lib/api-types.ts"

echo "Fetching OpenAPI spec from ${API_URL}/openapi.json ..."

# Fetch the spec
SPEC=$(curl -sf "${API_URL}/openapi.json")
if [ -z "$SPEC" ]; then
  echo "Error: Could not fetch OpenAPI spec from ${API_URL}" >&2
  exit 1
fi

# Write the spec to a temp file
TMPFILE=$(mktemp /tmp/openapi-XXXX.json)
echo "$SPEC" > "$TMPFILE"

echo "Generating TypeScript types..."
npx openapi-typescript "$TMPFILE" -o "$OUTPUT"
rm -f "$TMPFILE"

echo "Done → ${OUTPUT}"
