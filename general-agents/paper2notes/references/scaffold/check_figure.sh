#!/bin/bash
# ============================================================================
# check_figure.sh — the visual-check loop of figure_techniques.md §2.4,
# as an executable script.
#
# Usage:   bash check_figure.sh <snippet.tex|snippet.tikz>
#          <snippet> = a file containing a tikzpicture (or any body-level
#          LaTeX). If it already contains \documentclass it is compiled as-is;
#          otherwise it is wrapped in a standalone doc that ships the house
#          5-color palette and the house \usetikzlibrary list.
#
# Output:  compiles the standalone, rasterizes with `pdftoppm -r 200`, and
#          prints the PNG path(s). Then LOOK at the pixels (Read the image),
#          fix what you see, re-run. A figure is done when it has been looked
#          at, not when it compiles.
#
# All paths are double-quoted throughout: safe for spaces and [ ] brackets.
# pdftoppm ships with poppler (macOS: `brew install poppler`; Linux:
# poppler-utils).
# ============================================================================
set -u

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
if ! command -v pdftoppm >/dev/null 2>&1; then
  echo "ERROR: pdftoppm not found — install poppler (macOS: brew install poppler; Linux: apt/yum poppler-utils)." >&2
  exit 1
fi

# --- argument ----------------------------------------------------------------
if [ $# -lt 1 ] || [ ! -f "$1" ]; then
  echo "usage: bash check_figure.sh <snippet.tex|snippet.tikz>" >&2
  exit 1
fi
SNIPPET="$1"

# --- private work dir (concurrency-safe: unique per invocation) --------------
WORK="$(mktemp -d "${TMPDIR:-/tmp}/figcheck.XXXXXX")" || exit 1

# Copy the snippet next to the wrapper so \input needs no host path (host
# paths may contain spaces/brackets; the mktemp dir never does).
cp "$SNIPPET" "$WORK/snippet.tex"

if grep -q '\\documentclass' "$WORK/snippet.tex"; then
  # Already a full document — compile as-is.
  MAIN="snippet.tex"
  JOB="snippet"
else
  # Wrap in a standalone doc with the house palette + tikz libraries
  # (mirrors figure_techniques.md §0.1 palette and the shipped preamble's
  # \usetikzlibrary list).
  cat > "$WORK/figcheck.tex" <<'EOF'
\documentclass[border=4pt]{standalone}
\usepackage{amsmath}
\usepackage{tikz}
\usetikzlibrary{arrows.meta,calc,positioning,decorations.pathmorphing,%
  backgrounds,fit,patterns,shapes.geometric,plotmarks}
\usepackage{xcolor}
\usepackage{booktabs}
\definecolor{navy}{HTML}{1f3b73}
\definecolor{mpred}{HTML}{c0392b}
\definecolor{teal}{HTML}{16887b}
\definecolor{gold}{HTML}{b8860b}
\definecolor{inkgray}{HTML}{4a4a4a}
\begin{document}
\input{snippet.tex}
\end{document}
EOF
  MAIN="figcheck.tex"
  JOB="figcheck"
fi

# --- compile (from the work dir; a snippet has no project preamble) ----------
cd "$WORK" || exit 1
"$PDFLATEX" -interaction=nonstopmode -halt-on-error "$MAIN" >/dev/null
STATUS=$?
if [ "$STATUS" -ne 0 ]; then
  echo "COMPILE FAILED — see \"$WORK/$JOB.log\"" >&2
  grep -n -A 2 "^!" "$WORK/$JOB.log" | head -30 >&2 || true
  exit "$STATUS"
fi

# --- rasterize at 200 dpi and hand back the pixels ---------------------------
pdftoppm -png -r 200 "$WORK/$JOB.pdf" "$WORK/$JOB" || exit 1

echo "PDF: \"$WORK/$JOB.pdf\""
FOUND=0
for png in "$WORK/$JOB"-*.png "$WORK/$JOB".png; do
  if [ -f "$png" ]; then
    echo "PNG: \"$png\""
    FOUND=1
  fi
done
if [ "$FOUND" -ne 1 ]; then
  echo "ERROR: pdftoppm produced no PNG." >&2
  exit 1
fi
echo "NOW LOOK AT THE PNG (Read the image file), fix what you see, and re-run."
