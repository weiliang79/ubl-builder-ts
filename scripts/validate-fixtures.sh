#!/usr/bin/env bash
# Validate every golden fixture against the OASIS UBL 2.1 OS schemas.
#
# Structural validation only — element sequence, names, cardinality, datatypes.
# Deliberately NOT EN 16931 Schematron: MyInvois deviates from BR-CO-13 by
# reporting line-level discounts in AllowanceTotalAmount while LineExtensionAmount
# is already net of them, so business-rule validation would fail conformant
# documents. See D8 in the restructure decision record.
set -euo pipefail

SCHEMA="$(dirname "$0")/../schemas/ubl/2.1/maindoc/UBL-Invoice-2.1.xsd"
FIXTURES="$(dirname "$0")/../test/fixtures"

if ! command -v xmllint >/dev/null 2>&1; then
  echo "xmllint not found. Install libxml2-utils (Debian/Ubuntu) or libxml2 (brew)." >&2
  echo "It is no longer preinstalled on GitHub Actions runners; CI installs it explicitly." >&2
  exit 1
fi

# Top level only. test/fixtures/lhdn/ holds third-party reference documents,
# not this library's output, and LHDN's own signed sample fails here for a
# reason that is xmllint's rather than the document's: a 39-digit certificate
# serial is a legal xs:integer, but libxml2 rejects anything past a machine
# integer. Real X.509 serials are routinely 128-bit, so this gate cannot check
# a genuinely signed document at all — see test/profiles/lhdnSignedSample.spec.ts.
status=0
shopt -s nullglob
for f in "$FIXTURES"/*.xml; do
  if xmllint --noout --schema "$SCHEMA" "$f" 2>/dev/null; then
    echo "  ok       $(basename "$f")"
  else
    echo "  FAILED   $(basename "$f")"
    xmllint --noout --schema "$SCHEMA" "$f" 2>&1 | sed 's/^/           /' | head -5
    status=1
  fi
done

[ $status -eq 0 ] && echo "All fixtures validate against UBL 2.1 OS."
exit $status
