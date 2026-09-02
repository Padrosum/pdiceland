#!/usr/bin/env sh
# Fail if any commit on the given ref contains Cursor co-author attribution.
set -eu

REF="${1:-main}"

if git log "$REF" --format='%B' | grep -qiE 'co-authored-by:.*cursor|cursoragent@cursor\.com'; then
  echo "ERROR: Cursor co-author trailer found on $REF" >&2
  exit 1
fi

echo "OK: no Cursor co-author trailers on $REF"
