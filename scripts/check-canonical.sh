#!/usr/bin/env bash
# Check this library's Canonical XML 1.1 against libxml2's.
#
# MyInvois computes the signature's DocDigest over the document canonicalized
# with xml-c14n11, and LHDN canonicalizes the bytes it RECEIVES to verify. So
# the property that has to hold is not "our canonicalizer looks right" but:
#
#   c14n11(the bytes we submit) == the bytes we digest
#
# That is what this asserts, with xmllint standing in for LHDN's processor.
# A mismatch means every signed document would be rejected for a bad signature
# while validating perfectly against the schema — the worst kind of defect to
# find in production, and free to catch here.
#
# `src/core/canonical.ts` exists because Node has no canonicalizer and the ones
# on npm are Node-only; this gate is what earns the right to hand-write one.
set -euo pipefail

ROOT="$(dirname "$0")/.."
FIXTURES="$ROOT/test/fixtures"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if ! command -v xmllint >/dev/null 2>&1; then
  echo "xmllint not found. Install libxml2-utils (Debian/Ubuntu) or libxml2 (brew)." >&2
  exit 1
fi

# Includes test/fixtures/lhdn/, which validate-fixtures.sh deliberately skips:
# LHDN's own signed sample cannot pass xmllint's XSD check, because its
# certificate serial is a 39-digit xs:integer and libxml2 caps that type at a
# machine integer. Canonicalization has no such limit, and agreeing with
# libxml2 on a real signed document is worth more than agreeing on ours alone.
status=0
shopt -s nullglob
for f in "$FIXTURES"/*.xml "$FIXTURES"/lhdn/*.xml; do
  name="$(basename "$f")"
  submitted="$WORK/submitted.xml"
  ours="$WORK/ours.c14n"
  theirs="$WORK/theirs.c14n"

  npx ts-node --project "$ROOT/tsconfig.json" "$ROOT/scripts/canonicalize.ts" "$f" "$submitted" "$ours"
  xmllint --c14n11 "$submitted" > "$theirs"

  if diff -q "$theirs" "$ours" >/dev/null; then
    echo "  ok       $name  ($(wc -c < "$ours" | tr -d ' ') bytes canonical)"
  else
    echo "  FAILED   $name  — our c14n11 differs from libxml2's"
    diff "$theirs" "$ours" | head -10 | sed 's/^/           /'
    status=1
  fi
done

[ $status -eq 0 ] && echo "Canonical XML 1.1 agrees with libxml2 on every fixture."
exit $status
