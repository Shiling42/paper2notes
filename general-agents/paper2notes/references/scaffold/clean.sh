#!/usr/bin/env bash
# ============================================================================
# clean.sh — tidy the lecture-notes project after a finished build.
#
# PROVENANCE-AWARE: deletes a file only when the file itself proves it is a
# build byproduct. Three independent safety layers:
#
#   1. PAIR RULE (LaTeX aux): X.aux/X.log/X.out/... is deleted ONLY if a
#      sibling X.tex exists — every pdflatex byproduct here is named after a
#      .tex jobname (master, chapters, _single_ wrappers). A pre-existing
#      run.log / results.out has no run.tex sibling and is NEVER touched.
#   2. PAIR RULE (renders): S.png / S-<n>.png at the project root is deleted
#      ONLY if S.pdf or S.tex exists (pdftoppm names renders after the PDF
#      stem). Unrelated images are NEVER touched. (Render with the PDF's stem
#      as the pdftoppm prefix so your renders are collected.)
#   3. MANIFEST (pre-existing snapshot): if .preexisting_manifest exists
#      (written by the scaffold BEFORE anything else when OUT was not empty),
#      every path listed in it is protected unconditionally — even if it
#      matches rules 1-2.
#
#   REMOVES (only with proof)                KEEPS (always)
#   ---------------------------------       --------------------------------
#   paired *.aux *.log *.out *.toc *.lof    everything in .preexisting_manifest
#   *.lot *.blg *.fls *.fdb_latexmk *.nav   chapters/*.tex, preamble.tex
#   *.snm *.synctex.gz (root+chapters/)     preamble_plain_backup.tex
#   _single_*.* (compile_one wrappers)      the master .tex AND its final .pdf
#   paired render PNGs at project root      *.bbl (needed for arXiv packaging)
#   typeset_sandbox/ (build-only copy)      numbers.md, contract.md, code/
#   __pycache__/, .DS_Store (regenerable)   citations.md, refs.bib (ground truth)
#                                           figs/, job_card.md, BUILD_STATE.md,
#                                           _agents/, unpaired logs/outputs/images
#
# USAGE
#   bash clean.sh            # DRY RUN (default): list what would be removed
#   bash clean.sh --yes      # actually delete, then print a summary
#
# Runs against the project directory this script lives in. Refuses to run if
# the directory does not look like a lecture-notes project (no preamble.tex).
# All paths double-quoted ([ ] and spaces are safe).
# ============================================================================
set -u

PROJ="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-}"

if [ ! -f "$PROJ/preamble.tex" ]; then
  echo "REFUSING: \"$PROJ\" does not look like a lecture-notes project (no preamble.tex)." >&2
  exit 1
fi

DELETE=0
[ "$MODE" = "--yes" ] && DELETE=1

MANIFEST="$PROJ/.preexisting_manifest"

count=0
bytes=0
spared=0

# Is $1 (absolute path) protected by the pre-existing manifest?
protected() {
  [ -f "$MANIFEST" ] || return 1
  local rel="${1#"$PROJ"/}"
  # exact file match, or the candidate is a directory that contains a listed file
  if grep -qxF "$rel" "$MANIFEST" 2>/dev/null || grep -qF "$rel/" "$MANIFEST" 2>/dev/null; then
    return 0
  fi
  return 1
}

remove() {
  # $1 = file or directory believed (by the caller's proof rule) to be a byproduct
  [ -e "$1" ] || return 0
  if protected "$1"; then
    spared=$((spared + 1))
    echo "SPARED (pre-existing): ${1#"$PROJ"/}"
    return 0
  fi
  local sz
  sz=$(du -sk "$1" 2>/dev/null | cut -f1 || echo 0)
  bytes=$((bytes + sz))
  count=$((count + 1))
  if [ "$DELETE" -eq 1 ]; then
    rm -rf "$1"
    echo "removed: ${1#"$PROJ"/}"
  else
    echo "would remove: ${1#"$PROJ"/}"
  fi
}

# --- 1. LaTeX auxiliary files: PAIR RULE (sibling .tex required) --------------
for dir in "$PROJ" "$PROJ/chapters"; do
  [ -d "$dir" ] || continue
  for ext in aux log out toc lof lot blg fls fdb_latexmk nav snm "synctex.gz"; do
    for f in "$dir"/*."$ext"; do
      [ -e "$f" ] || continue
      stem="${f%."$ext"}"
      if [ -f "$stem.tex" ]; then
        remove "$f"
      fi
    done
  done
done

# --- 2. compile_one.sh wrapper artifacts (unambiguous build prefix) -----------
for f in "$PROJ"/_single_*; do
  remove "$f"
done

# --- 3. render PNGs at project root: PAIR RULE (S.pdf or S.tex required) ------
for f in "$PROJ"/*.png; do
  [ -e "$f" ] || continue
  base="$(basename "$f" .png)"
  stem="${base%-[0-9]*}"                       # pdftoppm names: <prefix>-<page>.png
  if [ -f "$PROJ/$base.pdf" ] || [ -f "$PROJ/$base.tex" ] ||
     [ -f "$PROJ/$stem.pdf" ] || [ -f "$PROJ/$stem.tex" ]; then
    remove "$f"
  fi
done

# --- 4. the typeset sandbox (created only by the Typeset stage) ---------------
remove "$PROJ/typeset_sandbox"

# --- 5. regenerable caches / Finder cruft --------------------------------------
while IFS= read -r d; do remove "$d"; done < <(find "$PROJ" -name '__pycache__' -type d 2>/dev/null)
while IFS= read -r f; do remove "$f"; done < <(find "$PROJ" -name '.DS_Store' -type f 2>/dev/null)

# --- summary -------------------------------------------------------------------
[ "$spared" -gt 0 ] && echo "NOTE: $spared pre-existing item(s) matched a pattern but were spared by the manifest."
if [ "$DELETE" -eq 1 ]; then
  echo "CLEAN: removed $count item(s), ~${bytes} KB freed."
  echo "Kept: sources, chapters, figs/, code/, numbers.md, citations.md, refs.bib,"
  echo "      contract.md, *.bbl, preamble_plain_backup.tex, the final PDF, and"
  echo "      every unpaired log/output/image (no .tex/.pdf sibling = not ours)."
  echo "      Rebuild anytime with build_all.sh."
else
  echo "DRY RUN: $count item(s), ~${bytes} KB would be freed. Re-run with --yes to delete."
fi
