#!/bin/bash
# ============================================================================
# build_all.sh — clean full build of the lecture notes.
#
# Usage:   bash build_all.sh [master-basename.tex]
#          default: master.tex (falls back to lecture_notes.tex if present)
#
# Lives in (and must stay in) the PROJECT directory. Runs a clean 3-pass
# pdflatex build — or pdflatex / bibtex / pdflatex x2 when an UNCOMMENTED
# \bibliography{...} line is present in the master. Exits nonzero on any
# compile error, and finally greps the log for undefined references /
# citations and reports (nonzero exit there too: the acceptance rubric's
# build gate demands ZERO undefined refs).
#
# All paths are double-quoted throughout: project paths containing spaces or
# [ ] brackets are safe.
# ============================================================================
set -u

PROJ="$(cd "$(dirname "$0")" && pwd)"

# --- resolve pdflatex (probe-style; TeX is often not on PATH) ---------------
find_pdflatex() {
  if command -v pdflatex >/dev/null 2>&1; then
    command -v pdflatex; return 0
  fi
  if [ -n "${TEXBIN:-}" ] && [ -x "${TEXBIN}/pdflatex" ]; then  # operator hint (env var)
    echo "${TEXBIN}/pdflatex"; return 0
  fi
  if [ -x "/Library/TeX/texbin/pdflatex" ]; then          # macOS MacTeX
    echo "/Library/TeX/texbin/pdflatex"; return 0
  fi
  local cand
  for cand in /usr/local/texlive/*/bin/*/pdflatex; do     # Linux TeX Live
    if [ -x "$cand" ]; then echo "$cand"; return 0; fi
  done
  return 1
}
PDFLATEX="$(find_pdflatex)" || {
  echo "ERROR: pdflatex not found (tried PATH, $TEXBIN, /Library/TeX/texbin, /usr/local/texlive/*/bin/*)." >&2
  exit 1
}
# bibtex normally lives next to pdflatex.
BIBTEX="$(dirname "$PDFLATEX")/bibtex"
if [ ! -x "$BIBTEX" ]; then BIBTEX="bibtex"; fi

# --- resolve the master file --------------------------------------------------
MASTER="${1:-}"
if [ -z "$MASTER" ]; then
  if   [ -f "$PROJ/master.tex" ];        then MASTER="master.tex"
  elif [ -f "$PROJ/lecture_notes.tex" ]; then MASTER="lecture_notes.tex"
  else
    echo "ERROR: no master.tex / lecture_notes.tex in \"$PROJ\"; pass the master basename as \$1." >&2
    exit 1
  fi
fi
if [ ! -f "$PROJ/$MASTER" ]; then
  echo "ERROR: master file not found: \"$PROJ/$MASTER\"" >&2
  exit 1
fi
JOB="${MASTER%.tex}"
LOG="$PROJ/$JOB.log"

cd "$PROJ" || exit 1

run_pass() {  # run_pass <label>
  echo "--- pdflatex pass: $1"
  "$PDFLATEX" -interaction=nonstopmode -halt-on-error "$MASTER" >/dev/null
  local status=$?
  if [ "$status" -ne 0 ]; then
    echo "BUILD FAILED (pass: $1) — see \"$LOG\"" >&2
    grep -n -A 2 "^!" "$LOG" | head -40 >&2 || true
    exit "$status"
  fi
}

# --- clean start: remove stale aux state for the master job ------------------
rm -f "$PROJ/$JOB.aux" "$PROJ/$JOB.toc" "$PROJ/$JOB.out" "$PROJ/$JOB.bbl" \
      "$PROJ/$JOB.blg" "$PROJ/$JOB.lof" "$PROJ/$JOB.lot"

# --- bib configured? (an UNCOMMENTED \bibliography{...} line in the master) --
if grep -qE '^[^%]*\\bibliography\{' "$PROJ/$MASTER"; then
  echo "=== bibliography detected: pdflatex / bibtex / pdflatex x2 ==="
  run_pass "1/3 (pre-bibtex)"
  echo "--- bibtex"
  "$BIBTEX" "$JOB" || { echo "BUILD FAILED (bibtex) — see \"$PROJ/$JOB.blg\"" >&2; exit 1; }
  run_pass "2/3"
  run_pass "3/3"
else
  echo "=== no bibliography configured: pdflatex x3 ==="
  run_pass "1/3"
  run_pass "2/3"
  run_pass "3/3"
fi

# --- final report: undefined references / citations --------------------------
echo "=== log check: undefined references / citations ==="
PROBLEMS=0
if grep -E "LaTeX Warning: (There were undefined references|Reference .* undefined|Citation .* undefined|There were undefined citations)" "$LOG"; then
  PROBLEMS=1
fi
if [ "$PROBLEMS" -ne 0 ]; then
  echo "BUILD COMPLETED BUT UNDEFINED REFERENCES/CITATIONS REMAIN (see above) — the build gate requires zero." >&2
  exit 1
fi
# final page count, from the last pass's "Output written on ... (N pages ...)"
PAGES="$(sed -n 's/.*Output written on .*(\([0-9][0-9]*\) pages\{0,1\}.*/\1/p' "$LOG" | tail -1)"
echo "CLEAN BUILD: \"$PROJ/$JOB.pdf\" — ${PAGES:-?} pages, no undefined references or citations."
