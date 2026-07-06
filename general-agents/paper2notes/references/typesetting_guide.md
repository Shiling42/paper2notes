# Professional Typesetting Guide for Lecture Notes

The WHY and HOW of turning a plain LaTeX draft into a publication-grade lecture
note. Project-agnostic and copy-paste-ready. Works for any "terse paper or dense
notes → self-contained lecture notes" expansion.

This guide is the generalized distillation of one real, successful run: a terse
PRX paper ("The Mpemba Effect as Topological Frustration") was expanded into a
131-page, professionally typeset, fully-proved lecture note that compiled clean
with every acceptance gate green. The Mpemba run is used throughout only as a
concrete worked example — every recipe below is meant to be reused verbatim (then
recolored / refonted) for any topic.

> **The single most important idea, stated once.** The visual leap from "rough
> draft" to "published book" came almost entirely from **upgrading the preamble
> while preserving every environment name and macro name**. The chapters were
> never touched. Read the next section before anything else.

**Fastest path:** a tested embodiment of §§2–4 ships next to this guide as
`references/preamble_lecture_notes.tex` — copy it next to your master as
`preamble.tex` instead of re-assembling it from snippets. The sections below
explain every piece of it so you can adapt it safely. This guide is the single
source of truth for the *why*: the preamble file's header comment deliberately
stays brief (it keeps only the key-trick warning) and points back here for the
full rationale.

---

## 0. The layering philosophy (the biggest lever)

**Beautify finished chapters by upgrading ONLY the preamble.**

When the content is already written — chapters full of `\begin{theorem}…\end{theorem}`,
`\begin{definition}…`, `\section{…}`, `\caption{…}`, custom macros like `\bL`,
`\Zw` — the worst thing you can do is start editing those files for looks. Instead:

1. Keep the document class and the master file exactly as they are
   (`\documentclass[11pt,oneside]{report}`, `\input{preamble}`, `\input{chapters/…}`).
2. Keep **every environment name** (`theorem`, `definition`, `example`, `remark`,
   `keyresult`) and **every macro name** (`\bL`, `\Psimat`, `\osc`, …) identical.
3. Change only **how those names render** — the theorem *style*, the box around
   the theorem, the chapter heading format, the fonts, the page geometry, the
   running headers.

**Why this works.** LaTeX separates *naming* from *appearance*. `\newtheorem`
declares the name and counter; `\theoremstyle` / `\tcolorboxenvironment` decide
how it looks. `\section` is a fixed name; `titlesec`'s `\titleformat` decides how
it looks. Because every chapter calls things by name, you can redefine the
appearance of the name in one file (`preamble.tex`) and every call site in every
chapter inherits the new look **with zero edits**. In the real run this converted
a plain `report` draft into a Palatino, colored-theorem-box, faded-chapter-number
book in ~15 minutes, with the chapters' `.tex` bytes unchanged.

**The discipline that makes it safe:**

- Before upgrading, **back up the working preamble** (`cp preamble.tex
  preamble_plain_backup.tex`). If a compile breaks, you can diff against a known-good
  version and you never lose the content's known-good state.
- **Add and restyle; do not rename or remove.** If a chapter says
  `\begin{example}`, the upgraded preamble must still define an `example`
  environment with the same counter behavior — only prettier. Never convert
  `\newtheorem`-style environments to `\newtcbtheorem`: that changes the calling
  convention (`\begin{theorem}{title}{label}`) and would force edits in every
  chapter. Wrap, don't replace (see §3).
- **If a compile error arises after the upgrade, fix the offending chapter
  construct or the preamble option that triggered it — never "simplify" the
  design back to plain.** The design is the deliverable.
- Build in a **/tmp sandbox copy first** (see §6), visually inspect rendered
  pages, and only then apply live.

Encode this as a hard rule in your project's `contract.md` so later agents do not
"helpfully" downgrade the preamble during a compile-fix. The real contract did
exactly this — a boxed "TYPESETTING — DO NOT DOWNGRADE" admonition.

**Automated path.** The multi-agent workflow
(`references/build_workflow_template.js`) now automates this entire layering
discipline as its **Typeset** phase: back up the plain preamble, obtain the
professional one, swap it in a full sandbox copy, 3-pass build, render and
visually inspect the title page / a chapter opener / a theorem page, and only
then apply live. The manual path in the sections below (especially §6) remains
the right tool for by-hand runs and for debugging when the automated phase
reports a failure.

---

## 1. The package stack and why each one is there

Load order matters (see §2). Here is the full stack from the real upgraded
`preamble.tex`, with the reason for each package.

| Package | Role | Why this one |
|---|---|---|
| `fontenc[T1]` | 8-bit output encoding | Proper hyphenation of accented words, real `<` `>` `\|`, copyable text. Always first. |
| `inputenc[utf8]` | source encoding | Lets you type UTF-8 directly. (Harmless/no-op on modern TeX, kept for older installs.) |
| `amsmath` | math core | `align`, `gather`, `\text`, display math. Foundation for everything mathematical. |
| `amssymb` | symbol fonts | `\mathbb`, `\lesssim`, arrows, relation symbols. |
| `mathtools` | amsmath++ | `\DeclarePairedDelimiter` (auto-sized `\abs`, `\norm`), `\coloneqq`, fixes amsmath quirks. Must load *after* amsmath. |
| `amsthm` | theorem machinery | `\newtheorem`, `\newtheoremstyle`, `proof` env. The *names/counters* layer (appearance comes later via tcolorbox). |
| `tgheros` | Helvetica-like sans | Clean grotesque for headings, captions, labels — the "designed" sans that contrasts the serif body. |
| `newpxtext` | Palatino-like serif body | Warm, highly readable book serif. The single biggest "this looks published" signal. |
| `newpxmath` | matching Palatino math | Math that harmonizes with the body serif. **Load after `newpxtext`.** |
| `bm` | bold math | `\bm{\pi}`, `\bm{\Psi}` — proper bold italic math (better than `\boldsymbol`). Load after the math fonts. |
| `beramono[scaled=0.86]` | clean monospace | For code, file paths, identifiers. Scaled down to match x-height. Optional. |
| `microtype` | micro-typography | Character protrusion + font expansion: even margins, fewer overfull boxes, the subtle "professional" polish. **Load late**, after fonts. |
| `geometry` | page layout | One-line control of margins, paper size, `headheight`. |
| `graphicx` | images | `\includegraphics` for PDF figures. |
| `xcolor` | color | Defines the palette; required by tcolorbox/titlesec/hyperref coloring. |
| `booktabs` | tables | `\toprule/\midrule/\bottomrule` — professional rules, no vertical lines. |
| `enumitem` | list control | Tight, custom-spaced lists (`\setlist{itemsep=…}`). |
| `caption` | caption styling | Sans, colored, bold figure labels (Nature-ish). |
| `tcolorbox[most]` | colored boxes | The theorem-box engine and the `keyresult` box. `[most]` pulls in `enhanced`, `breakable`, `skins`. |
| `tikz` (+ libraries) | vector figures | All schematic figures drawn in-document, in the palette. |
| `titlesec` | heading design | `\titleformat`/`\titlespacing` for the big faded chapter number and colored sections. |
| `fancyhdr` | running headers | Per-page header/footer with chapter/section marks and colored page number. |
| `needspace` | page-break control | `\needspace{Nlines}` keeps a heading from being orphaned at a page bottom. |
| `hyperref` | links/bookmarks | Colored internal links, PDF bookmarks. **Load late**, after all other packages (tcolorbox/titlesec/fancyhdr included); only `\hypersetup` config — and `cleveref`, if you add it — comes later (see §2). |

Fallbacks if a font package is missing on the target TeX install:

- **Serif+math**: `libertinus` (`\usepackage{libertinus}`) is an excellent modern
  alternative (Libertine text + matching math). `lmodern` (`\usepackage{lmodern}`)
  is the universal, always-present fallback — less distinctive but never fails.
- **Sans**: if `tgheros` is absent, `\renewcommand{\sfdefault}{phv}` (Helvetica
  metrics) or just drop the line and inherit Computer Modern Sans.
- If `newpxmath` clashes with a symbol you need, load it with an option, e.g.
  `\usepackage[varg]{newpxmath}`, or fall back to `lmodern` + `amssymb` only.

---

## 2. Correct load order (memorize this)

Font and hook interactions make order load-bearing. The safe order, exactly as in
the real preamble:

```latex
\usepackage[T1]{fontenc}      % 1. encodings first
\usepackage[utf8]{inputenc}
\usepackage{amsmath}          % 2. math core BEFORE mathtools & before fonts
\usepackage{amssymb}
\usepackage{mathtools}        %    mathtools after amsmath
\usepackage{amsthm}           %    theorem machinery (names layer)
\usepackage{tgheros}          % 3. fonts: sans …
\usepackage{newpxtext}        %    … then serif text …
\usepackage{newpxmath}        %    … then matching math (AFTER newpxtext)
\usepackage{bm}               % 4. bm AFTER math fonts
\usepackage[scaled=0.86]{beramono}
\usepackage{microtype}        % 5. microtype LATE, after all fonts
\linespread{1.06}
% … geometry, graphicx, xcolor, booktabs, enumitem, caption …
\usepackage[most]{tcolorbox}
\usepackage{tikz}
\usepackage{titlesec}
\usepackage{fancyhdr}
\usepackage{needspace}
\usepackage[colorlinks=true,linktoc=all]{hyperref}   % 6. hyperref late
% … THEN: \hypersetup, palette, titlesec/fancyhdr config, theorem styling …
```

Rules behind the order:

- **`amsmath → amssymb → mathtools`**: mathtools patches amsmath, so amsmath must
  exist first; amssymb is independent but conventionally sits between them.
- **Fonts after the math packages, math font after its text font**: `newpxmath`
  expects `newpxtext` already loaded; loading it first gives wrong metrics.
- **`bm` after the math fonts**: `\bm` inspects the current math fonts to build
  bold versions.
- **`microtype` late**: it instruments whatever fonts are active, so all fonts
  must already be selected.
- **`hyperref` late; all tcolorbox/theorem configuration after it**: hyperref
  redefines many internals (`\ref`, `\label`, cross-refs, the `\caption`
  machinery), so it loads near the end — after essentially all other packages,
  the tcolorbox *package* included (as in the block above). tcolorbox detects
  hyperref at begin-document, so tcolorbox-before-hyperref is the safe, tested
  order (both package orders happen to compile, but follow the shipped preamble).
  Then put `\hypersetup`, the palette, the titlesec/fancyhdr config,
  `\newtheoremstyle` and every `\tcolorboxenvironment` call *after* hyperref,
  exactly as the shipped preamble does. The one near-universal exception is
  `cleveref`, which must come *after*
  hyperref — not used here, but remember it if you add it.

---

## 3. The theorem-box recipe

Two layers, kept strictly separate so the calling convention never changes:

**Layer A — `amsthm` names + colored headers.** Define custom theorem *styles*
(header font/color) with `\newtheoremstyle`, then declare the environments with
`\newtheorem` sharing one chapter-scoped counter.

```latex
% header style: {name}{above}{below}{bodyfont}{indent}{HEADERfont}{punct}{afterpunct}{custom}
\newtheoremstyle{thmnavy}{8pt}{6pt}{\itshape}{0pt}
  {\sffamily\bfseries\color{navy}}{.}{0.6em}{}
\newtheoremstyle{thmteal}{8pt}{6pt}{\normalfont}{0pt}
  {\sffamily\bfseries\color{teal!85!black}}{.}{0.6em}{}
\newtheoremstyle{thmgold}{8pt}{6pt}{\normalfont}{0pt}
  {\sffamily\bfseries\color{gold!72!black}}{.}{0.6em}{}
\newtheoremstyle{thmremark}{8pt}{6pt}{\normalfont}{0pt}
  {\itshape\color{inkgray}}{.}{0.5em}{}

\theoremstyle{thmnavy}
\newtheorem{theorem}{Theorem}[chapter]       % drives the shared counter
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{corollary}[theorem]{Corollary}
\theoremstyle{thmteal}
\newtheorem{definition}[theorem]{Definition}
\theoremstyle{thmgold}
\newtheorem{example}[theorem]{Example}
\theoremstyle{thmremark}
\newtheorem{remark}[theorem]{Remark}

\newenvironment{defn}{\begin{definition}}{\end{definition}}  % alias, same look
```

The header-style argument slots (the eight braces after the style name) are, in order:
space-above, space-below, **body font** (theorem body italic vs upright),
header indent, **header font** (this is where the sans+bold+color lives),
punctuation after the header, space after that punctuation, custom head spec.

**Layer B — wrap each environment in a tcolorbox.** `\tcolorboxenvironment{NAME}{…}`
draws a box around the *existing* `amsthm` environment without changing how it is
called. This is the key: chapters still write `\begin{theorem}…\end{theorem}`.

```latex
\tcolorboxenvironment{theorem}{
  enhanced jigsaw, breakable, before skip=10pt, after skip=10pt,
  boxrule=0pt, frame hidden, sharp corners,
  colback=navy!5, borderline west={3pt}{0pt}{navy},
  left=12pt,right=10pt,top=7pt,bottom=7pt}
% proposition / lemma / corollary: identical navy treatment
\tcolorboxenvironment{definition}{
  enhanced jigsaw, breakable, before skip=10pt, after skip=10pt,
  boxrule=0pt, frame hidden, sharp corners,
  colback=teal!6, borderline west={3pt}{0pt}{teal!85!black},
  left=12pt,right=10pt,top=7pt,bottom=7pt}
\tcolorboxenvironment{example}{
  enhanced jigsaw, breakable, before skip=10pt, after skip=10pt,
  boxrule=0pt, frame hidden, sharp corners,
  colback=gold!7, borderline west={3pt}{0pt}{gold!72!black},
  left=12pt,right=10pt,top=7pt,bottom=7pt}
\tcolorboxenvironment{remark}{
  enhanced jigsaw, breakable, before skip=8pt, after skip=8pt,
  boxrule=0pt, frame hidden, sharp corners,
  colback=black!3, borderline west={2.2pt}{0pt}{inkgray},
  left=11pt,right=8pt,top=5pt,bottom=5pt}
```

Anatomy of the look — a **left bar + light tint, no full frame**:

- `borderline west={3pt}{0pt}{navy}` — the colored vertical bar on the left edge.
- `colback=navy!5` — a 5% tint of the accent as the background (very light).
- `boxrule=0pt, frame hidden, sharp corners` — no outline box; clean and modern.
- `breakable` (from `[most]`) — the box can split across a page; **essential** for
  long proofs and multi-line theorems.
- `before/after skip` — vertical breathing room around the box.

**How to pick per-environment colors.** Assign one palette role per semantic kind
so a reader learns the code by color:

- **Primary (navy)** → the load-bearing claims: theorem/proposition/lemma/corollary.
  These share one color so they read as "the formal results."
- **Secondary (teal)** → definitions. A distinct but calm color says "new object."
- **Tertiary/warm (gold)** → examples. A warm tint invites the reader into the
  concrete; visually lighter than a theorem.
- **Neutral gray** → remarks/asides. Thinner bar, grayer tint: clearly subordinate.

Tints stay in the `!5`–`!7` range (barely-there backgrounds keep the page light);
header colors are deepened toward black (`teal!85!black`, `gold!72!black`) so the
*text* is legible while the *tint* is faint.

**The `keyresult` box** — a stronger, fully-framed callout for the one headline
result per chapter (use sparingly):

```latex
\newtcolorbox{keyresult}[1][]{%
  enhanced, breakable,
  colback=gold!7, colframe=gold!75!black, boxrule=0.9pt, arc=2.5pt,
  left=8pt,right=8pt,top=8pt,bottom=8pt,
  fonttitle=\sffamily\bfseries\color{white}, coltitle=white,
  attach boxed title to top left={yshift=-2.6mm,xshift=5mm},
  boxed title style={colback=gold!75!black,arc=1pt},
  title={Key result}, #1}
```

Note `keyresult` *is* a `\newtcolorbox` (a brand-new environment you author), which
is fine — it is new, not a rename of an existing amsthm environment.

---

## 4. Headings, headers, title page, palette

**Palette — define once, use everywhere.** Five named colors; every colored
element (links, headings, boxes, figures) draws from this set only. Lock it in
`contract.md` so figures and boxes stay coherent.

```latex
\definecolor{navy}{HTML}{1f3b73}   % primary / structure
\definecolor{mpred}{HTML}{c0392b}  % emphasis / "hot" side
\definecolor{teal}{HTML}{16887b}   % secondary accent / edges
\definecolor{gold}{HTML}{b8860b}   % tertiary accent / highlights
\definecolor{inkgray}{HTML}{4a4a4a}
\hypersetup{linkcolor=navy, citecolor=teal, urlcolor=mpred,
            filecolor=navy, bookmarksnumbered=true}
```

**Chapter & section headings (titlesec) — the big faded chapter number.**

```latex
\titleformat{\chapter}[display]
  {\sffamily\bfseries\color{navy}}
  {\raggedleft\sffamily\bfseries\fontsize{56}{56}\selectfont\color{navy!22}%
     \thechapter}                                  % huge 22%-opacity number
  {6pt}
  {\Huge\raggedright}
  [\vspace{2pt}{\color{navy!22}\titlerule[1.2pt]}] % faint rule under the title
\titlespacing*{\chapter}{0pt}{6pt}{22pt}

\titleformat{\section}
  {\sffamily\Large\bfseries\color{navy}}{\thesection}{0.8em}{}
\titleformat{\subsection}
  {\sffamily\large\bfseries\color{navy!88}}{\thesubsection}{0.7em}{}
\titleformat{\subsubsection}
  {\sffamily\normalsize\bfseries\color{inkgray}}{\thesubsubsection}{0.6em}{}
\titlespacing*{\section}{0pt}{14pt}{6pt}
\titlespacing*{\subsection}{0pt}{11pt}{4pt}
```

The trick that reads as "designed": the chapter number set **huge and at 22%
opacity** (`navy!22`) so it is a graphic element, not loud text; the title itself
in deep navy sans; a faint full-width rule beneath.

**Running headers (fancyhdr).** Chapter on the left, section on the right (sans,
small, gray), page number centered in the footer (navy). A `plain` style strips
the header on chapter-opening pages.

```latex
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0pt}
\renewcommand{\chaptermark}[1]{\markboth{\thechapter.\ #1}{}}
\renewcommand{\sectionmark}[1]{\markright{\thesection\ #1}}
\fancyhead[L]{\sffamily\footnotesize\color{inkgray}\nouppercase{\leftmark}}
\fancyhead[R]{\sffamily\footnotesize\color{inkgray}\nouppercase{\rightmark}}
\fancyfoot[C]{\sffamily\small\color{navy}\thepage}
\fancypagestyle{plain}{%
  \fancyhf{}\renewcommand{\headrulewidth}{0pt}%
  \fancyfoot[C]{\sffamily\small\color{navy}\thepage}}
```

(Set `headheight=14pt` in `geometry` to avoid the fancyhdr height warning.)

**Captions (Nature-ish).** Small text, bold colored sans label, period separator.

```latex
\captionsetup{font={small},labelfont={bf,sf,color=navy},
  textfont={sf},labelsep=period,width=0.95\linewidth}
```

**Custom title page.** Redefine `\maketitle` to draw two navy rules around a large
sans title, an italic subtitle, then author/date. It reads `\@title/\@author/\@date`
set in the master, and the subtitle is likewise a hook: it comes from
`\notessubtitle`, which the master overrides with
`\renewcommand{\notessubtitle}{...}` before `\maketitle` — so the master file
stays untouched.

```latex
\providecommand{\notessubtitle}{A self-contained set of lecture notes}
%  ^ lives in the preamble's CUSTOMISE block; set it in your master with
%    \renewcommand{\notessubtitle}{...} BEFORE \maketitle
\makeatletter
\renewcommand{\maketitle}{%
  \begin{titlepage}\centering
  \vspace*{0.16\textheight}
  {\color{navy}\rule{\textwidth}{1.4pt}}\\[1.4em]
  {\sffamily\bfseries\color{navy}\fontsize{30}{34}\selectfont \@title \par}
  \vspace{1.1em}
  {\color{navy}\rule{\textwidth}{1.4pt}}\\[2.4em]
  {\large\itshape \notessubtitle \par}
  \vfill
  {\sffamily\large\@author \par}\vspace{0.7em}{\large \@date \par}
  \vspace*{0.10\textheight}
  \end{titlepage}}
\makeatother
```

**`report` + `oneside`.** Use `\documentclass[11pt,oneside]{report}`. `report`
gives `\chapter`; `oneside` means symmetric inner/outer margins and a single
header layout — correct for a screen-read PDF (no recto/verso gutter dance). Use
the full `geometry` line from the shipped preamble verbatim:

```latex
\usepackage[a4paper,top=1.15in,bottom=1.2in,inner=1.25in,outer=1.25in,headheight=14pt,marginparwidth=0.9in]{geometry}
```

`a4paper` is deliberate (omit it and you silently get US letter; swap to
`letterpaper` if that is what you want), and the generous `inner=outer=1.25in`
gives a roomy book measure.

**Page feel.** A few global settings that matter:

```latex
\linespread{1.06}                       % slightly looser leading → readability
\setlength{\parindent}{0pt}             % block paragraphs …
\setlength{\parskip}{5pt plus 1pt}      % … separated by space, not indent
\setlist{itemsep=2pt,topsep=4pt}        % tight lists
\allowdisplaybreaks                     % long display math may break across pages
```

---

## 5. Adapting to a different paper

The structure is fixed; three things are meant to be swapped.

**Swap the palette.** Change the five `\definecolor` HEX values; keep the *roles*
(primary/structure, emphasis, secondary, tertiary, ink-gray). Because every box,
heading, and figure references the *names* (`navy`, `teal`, …), recoloring the
whole document is five edits. Re-audit contrast: header colors must stay legible
on white; tints stay in the `!4`–`!8` range.

**Swap the fonts.** Replace the three font lines with one alternative family and
keep load order:

```latex
% Option A (distinctive): Libertine + matching math
\usepackage{libertinus}              % text + math in one
\usepackage[scaled=0.85]{beramono}
% Option B (universal fallback, never missing):
\usepackage{lmodern}
% keep tgheros (or drop for default sans) for headings either way
```

If you change the body serif, the chapter title `\fontsize` values may need a
nudge; render and eyeball.

**Keep or drop the title page.** To drop it, delete the `\renewcommand{\maketitle}`
block and the default `report` title is used. To keep it, set
`\renewcommand{\notessubtitle}{...}` in your master before `\maketitle` (or edit
the `\providecommand` default in the preamble's CUSTOMISE block) and (optionally)
add an affiliation/line under the author.

**Map your semantic kinds onto the four box colors.** If your field has different
result types (e.g. "Protocol", "Assumption", "Pitfall"), define them as new
`amsthm` environments on the shared counter and assign each a palette role with a
`\tcolorboxenvironment`. Reuse the navy/teal/gold/gray recipe verbatim — only the
environment name and the color change.

Everything else — load order, the two-layer theorem recipe, titlesec/fancyhdr
config, geometry, microtype — transfers unchanged.

---

## 6. How to work: find TeX, sandbox-build, render, inspect, iterate

**Find the TeX binary if it is not on PATH.** A TeX install frequently is not on
the default PATH. Resolve it probe-style, in this order:

```bash
command -v pdflatex                        # 1. already on PATH?
ls /Library/TeX/texbin/pdflatex            # 2. macOS MacTeX symlink farm
ls /usr/local/texlive/*/bin/*/pdflatex     # 3. Linux/any TeX Live, any year/arch
```

Then prepend the winning directory to PATH at the top of every build script so
foreground and background runs agree:

```bash
PDFLATEX="$(command -v pdflatex || true)"
[ -z "$PDFLATEX" ] && [ -x /Library/TeX/texbin/pdflatex ] && PDFLATEX=/Library/TeX/texbin/pdflatex
[ -z "$PDFLATEX" ] && PDFLATEX="$(ls /usr/local/texlive/*/bin/*/pdflatex 2>/dev/null | head -n1)"
[ -n "$PDFLATEX" ] || { echo "FAIL: pdflatex not found"; exit 1; }
export PATH="$(dirname "$PDFLATEX"):$PATH"
# e.g. on the real macOS run this resolved to /Library/TeX/texbin (a symlink to
# pdftex) with /usr/local/texlive/2022/bin/universal-darwin also present:
# export PATH="/usr/local/texlive/2022/bin/universal-darwin:/Library/TeX/texbin:$PATH"
```

> Paths containing `[` `]` (this project lives under `…/[260619_Mpemba]…`) **must
> be double-quoted in bash** or the brackets are read as a glob. Always
> `cd "$PROJ"`, never `cd $PROJ`. Prefer absolute paths everywhere.

**Build in a /tmp copy to avoid disturbing a live run.** While other agents may be
editing the live tree, never test a risky preamble change in place. Copy out,
swap the preamble, build, look:

```bash
SRC="/Users/.../mpemba_lecture_notes"          # the live project
SANDBOX="$(mktemp -d)/notes"
cp -R "$SRC" "$SANDBOX"
cp "$SANDBOX/preamble_new.tex" "$SANDBOX/preamble.tex"   # try the upgrade here
( cd "$SANDBOX" && \
  for p in 1 2 3; do \
    pdflatex -interaction=nonstopmode \
      mpemba_lecture_notes.tex >/tmp/pass$p.out 2>&1; done )
# (pdflatex resolved via the PATH probe above; nonstopmode already continues
#  past errors — do NOT write -halt-on-error=0, the flag takes no value)
```

Three passes are needed so the TOC, `\label`/`\ref`, and running marks settle —
the same reason `build_all.sh` (shipped as `references/scaffold/build_all.sh`)
loops `1 2 3`. For a fast per-chapter check there is a `compile_one.sh` pattern
(shipped as `references/scaffold/compile_one.sh`) that wraps a single chapter in
a minimal `\documentclass{report}` + `\input{preamble}` + `\input{chapter}`
document and runs one fast pdflatex pass from the project directory under a
per-chapter jobname — useful to localize which chapter a new error comes from.

**Render pages to PNG and visually inspect — do not trust "0 errors" alone.**
A clean log does not prove the *design* is right (a bar could be the wrong color, a
box could overflow, a heading could collide). Rasterize and look:

```bash
# whole document, ~110 dpi, into /tmp/pg-1.png, /tmp/pg-2.png, …
pdftoppm -png -r 110 "$SANDBOX/mpemba_lecture_notes.pdf" /tmp/pg
# or a single page (e.g. a chapter opener) to eyeball one element:
pdftoppm -png -r 150 -f 12 -l 12 "$SANDBOX/mpemba_lecture_notes.pdf" /tmp/ch
```

`pdftoppm` ships with poppler (Homebrew `poppler` on macOS —
`/opt/homebrew/bin/pdftoppm`; package `poppler-utils` on most Linux distros).
Read the resulting PNGs with your image-viewing tool and
check, page by page: title page rules aligned; chapter number faded and
right-aligned; theorem boxes tinted with a left bar and **breaking cleanly across
page boundaries**; running headers correct; no overfull-box black bars in the
margin; figures in palette.

**Iterate, then apply live.** Fix the offending construct (or a tcolorbox option),
rebuild in the sandbox, re-render the affected pages. When it is clean *and* looks
right, copy the new `preamble.tex` back over the live one (the old one is already
saved as `preamble_plain_backup.tex`) and run the real 3-pass build.

**Acceptance, briefly.** A finished pass should show, in the final-pass log: no
lines beginning with `!` (LaTeX errors), no "undefined references"/"undefined
citations"/"There were undefined references", no "Missing character"/missing
figure warnings, and the expected page count from `Output written on … (N pages…)`.
Treat any `Overfull \hbox` over a few pt as a visual defect to inspect, not just a
warning to ignore.

---

## 7. Pitfalls learned the hard way

- **Do not convert amsthm environments to `\newtcbtheorem`.** It changes the
  calling convention and forces edits in every chapter — the opposite of the
  layering win. Always wrap with `\tcolorboxenvironment`.
- **Do not "simplify" the preamble to fix a compile error.** Fix the chapter
  construct or the specific option; keep the design. Put a do-not-downgrade note
  in `contract.md`.
- **`headheight` too small** → fancyhdr warning; set `headheight=14pt` in geometry.
- **`def` is a TeX primitive**, so you cannot `\newenvironment{def}`. Expose a
  `defn` alias that forwards to `definition` (same look), as above.
- **Robust redefinition of `\R` etc.**: if a font/symbol package already defines
  `\R`, guard it: `\providecommand{\R}{}\renewcommand{\R}{\mathbb{R}}` so the
  preamble never errors on "command already defined."
- **Unquoted `[ ]` paths** silently break globbing in bash — quote every path.
- **One source of truth for numbers** is orthogonal to typesetting but cohabits
  the preamble era: keep all numerals in a `numbers.md` generated by runnable
  code; the prettiest box around a wrong number is still wrong.

---

## 8. Minimal checklist to reproduce the leap

1. `cp preamble.tex preamble_plain_backup.tex` (back up the known-good plain version).
2. Obtain the upgraded `preamble.tex`. Fastest path: copy
   `references/preamble_lecture_notes.tex` next to your master as `preamble.tex` —
   it is the tested embodiment of §§2–4. Otherwise author it: §2 load order,
   §4 palette, §3 theorem recipe, §4 titlesec/fancyhdr/caption/title page.
   **No chapter edits.**
3. Add a "TYPESETTING — DO NOT DOWNGRADE" clause to `contract.md`.
4. Sandbox-build in `/tmp` (3 passes), `pdftoppm -png`, inspect every page.
5. Iterate on the preamble only until clean + good-looking.
6. Apply live; run the real 3-pass `build_all.sh`; confirm 0 errors / 0 undefined
   refs / expected page count.

The content was already done. Typesetting was a *layer*, and that is exactly why a
~15-minute preamble swap turned a rough draft into a 131-page published-looking book.
