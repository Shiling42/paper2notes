#!/bin/bash
# ============================================================================
# compile_one.sh — compile ONE chapter standalone for fast iteration.
#
# Usage:   bash compile_one.sh <chapter>
#          <chapter> = a name like "ch2", or a path like "chapters/ch2.tex"
#
# Lives in (and must stay in) the PROJECT directory, next to master.tex,
# preamble.tex and chapters/. It compiles FROM the project directory so that
# \input{preamble} resolves exactly as in the full build — never from a bare
# temp dir.
#
# Concurrency-safe: every artefact (wrapper .tex, .aux, .log, .pdf) is named
# _single_<chaptername>.*  via a unique -jobname, so overlapping invocations
# on DIFFERENT chapters never collide. (Two simultaneous compiles of the SAME
# chapter still collide — don't do that.)
#
# All paths are double-quoted throughout: project paths containing spaces or
# [ ] brackets are safe.
# ============================================================================
set -u

# --- locate the project dir (= where this script lives) ---------------------
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

# --- resolve the chapter argument -------------------------------------------
if [ $# -lt 1 ]; then
  echo "usage: bash compile_one.sh <chapter>   (e.g. ch2, or chapters/ch2.tex)" >&2
  exit 1
fi
ARG="$1"
BASE="$(basename "$ARG")"
NAME="${BASE%.tex}"

if [ -f "$PROJ/chapters/$NAME.tex" ]; then
  CHAPTER_INPUT="chapters/$NAME.tex"
elif [ -f "$PROJ/$ARG" ]; then
  CHAPTER_INPUT="$ARG"
else
  echo "ERROR: chapter not found: neither \"$PROJ/chapters/$NAME.tex\" nor \"$PROJ/$ARG\" exists." >&2
  exit 1
fi

# --- write the throwaway wrapper (unique per chapter) ------------------------
JOB="_single_${NAME}"
WRAPPER="$PROJ/$JOB.tex"
# Quoted \input filename: robust if the path ever contains spaces.
cat > "$WRAPPER" <<EOF
\\documentclass[11pt,oneside]{report}
\\input{preamble}
\\begin{document}
\\input{"$CHAPTER_INPUT"}
\\end{document}
EOF

# --- compile from the project dir (so \input{preamble} resolves) ------------
# One pass: fast iteration. Cross-refs may show as ??; the full build resolves
# them. Re-run once more by hand if you need in-chapter refs resolved.
cd "$PROJ" || exit 1
"$PDFLATEX" -interaction=nonstopmode -halt-on-error -jobname "$JOB" "$JOB.tex" >/dev/null
STATUS=$?
if [ "$STATUS" -ne 0 ]; then
  echo "COMPILE FAILED for chapter '$NAME' — see \"$PROJ/$JOB.log\"" >&2
  grep -n -A 2 "^!" "$PROJ/$JOB.log" | head -30 >&2 || true
  exit "$STATUS"
fi

echo "OK: \"$PROJ/$JOB.pdf\""
