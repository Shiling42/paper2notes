# Figure Techniques — A Playbook for Paper → Lecture-Notes Expansion

A project-agnostic, copy-paste figure cookbook for turning a terse paper (or dense
research notes) into a professionally typeset lecture note. Every snippet here is
distilled from a real, successful run that expanded a terse ~11-page PRX paper ("The
Mpemba Effect as Topological Frustration") into a 131-page, clean-building,
all-gates-green lecture note. The Mpemba run appears only as a *worked example* —
the techniques transfer to any paper.

The single most important lesson from that run: **figures come in two tracks**, and
mixing them up is the most common failure mode.

1. **Schematic / conceptual figures → author fresh TikZ.** Anything that *teaches an
   idea* — a network with a highlighted cut, a gallery of motifs, a sign strip, a
   function with its roots, a complex-plane contour, an integer staircase, a
   two-block schematic — should be hand-drawn in TikZ so it is vector-perfect,
   palette-consistent, infinitely editable in the `.tex`, and needs no external
   asset. These are §1 of this document.

2. **Data-heavy figures → reuse / regenerate matplotlib PDFs.** Anything that *shows
   numbers* — a census/histogram, an occupancy curve, an onset/scaling plot, an
   ensemble scatter with exact counts — should be produced once by a seeded Python
   script as a **vector PDF** and `\includegraphics`'d. Never redraw a 3000-sample
   histogram by hand in TikZ. These are §2.

The rule of thumb: *if a human could draw it on a whiteboard from memory, it's TikZ;
if it requires running code, it's a matplotlib PDF.*

One mandate cuts across both tracks — **numbers-as-figures**: every load-bearing
quantity in `numbers.md` must *also* appear in at least one figure or professionally
typeset table in the chapters. A bare inline number is never acceptable as the only
presentation of a key result. This mandate has its own track — **Track 3:
numbers → figures** (the section before §1.8) — and four dedicated archetypes H–K
(§1.8–1.11) that make honoring it cheap.

---

## 0. The shared visual system (use this everywhere, both tracks)

### 0.1 The four-color palette + ink gray

These five colors are the *only* sanctioned colors. Two accents (navy, red) carry
the primary semantic contrast (e.g. the two sides of a partition, "cold/hot",
"A/B"); two more (teal, gold) are secondary accents (edges/cuts; highlights/zeros);
ink-gray is for de-emphasized text and dotted guides. Resist adding a sixth color —
discipline here is what makes the whole document read as one object.

**LaTeX / TikZ** (put in the preamble):

```latex
\definecolor{navy}{HTML}{1f3b73}   % primary / block A / "cold" / structure
\definecolor{mpred}{HTML}{c0392b}  % emphasis / block B / "hot" / the effect
\definecolor{teal}{HTML}{16887b}   % secondary accent / edges, cuts, curves
\definecolor{gold}{HTML}{b8860b}   % tertiary accent / highlights, zeros, markers
\definecolor{inkgray}{HTML}{4a4a4a}% de-emphasized text, axes, dotted guides
```

**Python / matplotlib** (top of every figure script — keep the hex strings
byte-identical to the LaTeX so the two tracks are indistinguishable on the page):

```python
C0, C1, C2, C3 = "#1f3b73", "#c0392b", "#16887b", "#b8860b"   # navy, red, teal, gold
C0_LIGHT, C1_LIGHT = "#e3e8f3", "#f7e3df"                      # pale hull fills
GRAY = "#4a4a4a"                                               # de-emphasized (= inkgray)
```

> **Change this to adapt:** swap the five hex codes for your project's palette, but
> keep the *roles* (1 primary pair + 2 accents + 1 gray) and keep the LaTeX and
> Python copies identical. A Wong colorblind-safe set is a good drop-in if you need
> one: `#0072B2 #D55E00 #009E73 #E69F00`.

### 0.2 TikZ libraries you need

The archetypes below assume:

```latex
\usepackage{amsmath}   % \text{...} inside math (used in captions and labels)
\usepackage{tikz}
\usetikzlibrary{arrows.meta,calc,positioning,decorations.pathmorphing,%
  backgrounds,fit,patterns,shapes.geometric,plotmarks}
```

`arrows.meta` (Stealth arrowheads), `fit` + `backgrounds` (domain hulls behind
nodes), `calc` (coordinate arithmetic), `positioning` (relative `\node` placement)
are the load-bearing ones.

### 0.3 Bold panel letters, sans, colored — the house style

* **Panel letters** are bold and explicit: `(a)`, `(b)`, ... In TikZ a left-anchored
  `\node[font=\bfseries]`; in matplotlib `fig.text(x, y, "(a)", fontweight="bold")`
  or a left-aligned bold mathrm title `r"$\mathbf{(a)}$ ..."`.
* **All figure text is sans** to match Nature-ish captions; the body prose stays
  serif (Palatino in the real run). Set this once in the matplotlib rcParams and let
  TikZ inherit the document font.
* **Captions** are sans, with a **bold colored label** (`\captionsetup{labelfont=
  {bf,sf,color=navy}}`), period separator, slightly narrowed width. Every caption is
  a self-contained paragraph: bold lead sentence stating the takeaway, then
  panel-by-panel reading, then a provenance clause (`Data: numbers.md, script
  fooX.py`). The provenance clause is non-negotiable in a reproducible note — it is
  what lets a reader (or a reviewer agent) trace every plotted number back to code.

### 0.4 matplotlib rcParams — the Nature-styled base

Identical block at the top of *every* data-figure script, so all PDFs share one
look:

```python
import matplotlib as mpl
mpl.use("Agg")                      # headless; never opens a window
import matplotlib.pyplot as plt
plt.rcParams.update({
    "font.family": "serif", "mathtext.fontset": "cm",   # match the document math
    "font.size": 8.5, "axes.labelsize": 8.5, "legend.fontsize": 7,
    "xtick.labelsize": 7.5, "ytick.labelsize": 7.5,
    "axes.linewidth": 0.8, "lines.linewidth": 1.4,
})
```

Column-width figure = `figsize=(3.375, H)` (3.375 in is one PRX/Nature column);
two-column = `(6.9, H)`. Strip chrome with `ax.spines[["top","right"]].
set_visible(False)`; for network panels use `ax.axis("off")` and
`ax.set_aspect("equal")`.

### 0.5 `\graphicspath` so includes are short and portable

```latex
\graphicspath{{figs/}{../figs/}{./}}   % find PDFs whether built from root or chapter dir
```

Then `\includegraphics[width=0.74\linewidth]{fig1.pdf}` resolves regardless of where
`pdflatex` is invoked. (Note: `pdflatex` may not be on `PATH`; on macOS MacTeX it
typically lives at `/Library/TeX/texbin/pdflatex`, on Linux TeX Live at
`/usr/local/texlive/*/bin/*/pdflatex` — discover it once and prepend it to `PATH`;
see the "find pdflatex" block in `typesetting_guide.md`.)

---

# §1 — NEW pedagogical TikZ & tables (eleven reusable archetypes)

Each archetype is a complete, self-contained snippet you can paste — a `tikzpicture`
for A–H and J–K, a `booktabs` table for I — using the palette above. After each, a
one-line **"change this to adapt"** tells you the single knob to turn for your paper.
Archetypes A–G are generalized from the real `ch2.tex` / `ch4.tex` of the Mpemba run;
H–K are the general-purpose **Track 3 (numbers → figures)** archetypes (§1.8–1.11).

---

## 1.1 Archetype A — Network with sign/category-colored, weight-sized nodes, a highlighted CUT, and shaded domain hulls

The workhorse. A graph split into two (or more) categories: nodes colored by
sign/category and **sized by a scalar weight**, intra-category edges solid, the
**cut edges dashed**, and each category wrapped in a soft rounded **hull** drawn on
the background layer. This is the figure that says "the object decomposes into these
blocks, joined here." Generalized from the two-triangle network figure.

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[
      >={Stealth[length=2.2mm]}, font=\small,
      negdom/.style={draw=navy!55, fill=navy!7,  rounded corners=10pt, line width=0.6pt},
      posdom/.style={draw=mpred!55,fill=mpred!7, rounded corners=10pt, line width=0.6pt},
      Anode/.style={circle, fill=navy,  draw=navy!60,  text=white, inner sep=0pt},
      Bnode/.style={circle, fill=mpred, draw=mpred!60, text=white, inner sep=0pt},
      intra/.style={teal!75, line width=1.1pt},
      cut/.style={teal, line width=1.6pt, dashed},
    ]
    % --- node coordinates: category A (left), category B (right) ---
    \coordinate (n1) at (0.0, 1.5);  \coordinate (n2) at (-1.0,0.0); \coordinate (n3) at (0.0,-1.5);
    \coordinate (n4) at (5.0, 1.5);  \coordinate (n5) at ( 6.0,0.0); \coordinate (n6) at (5.0,-1.5);
    % --- category hulls, drawn behind everything ---
    \begin{scope}[on background layer]
      \node[negdom, fit=(n1)(n2)(n3), inner sep=11pt] {};
      \node[posdom, fit=(n4)(n5)(n6), inner sep=11pt] {};
    \end{scope}
    % --- intra-category (strong) edges ---
    \draw[intra] (n1)--(n2); \draw[intra] (n2)--(n3); \draw[intra] (n1)--(n3);
    \draw[intra] (n4)--(n5); \draw[intra] (n5)--(n6); \draw[intra] (n4)--(n6);
    % --- the CUT: two weak cross-edges (a genuine MULTI-edge cut, not one bridge) ---
    \draw[cut] (n1)--(n4) node[midway,above,text=teal,font=\scriptsize\bfseries]{rung $(1,4)$};
    \draw[cut] (n3)--(n6) node[midway,below,text=teal,font=\scriptsize\bfseries]{rung $(3,6)$};
    % --- nodes: COLOR = category, SIZE = |weight| (small = light, large = heavy) ---
    \node[Anode,minimum size=4.5mm]  at (n1) {\scriptsize 1};
    \node[Anode,minimum size=4.5mm]  at (n2) {\scriptsize 2};
    \node[Anode,minimum size=4.5mm]  at (n3) {\scriptsize 3};
    \node[Bnode,minimum size=10mm]   at (n4) {4};
    \node[Bnode,minimum size=10.6mm] at (n5) {5};
    \node[Bnode,minimum size=10mm]   at (n6) {6};
    % --- labels ---
    \node[navy, font=\bfseries]    at (-0.5, 2.55) {$S_-=A=\{1,2,3\}$};
    \node[mpred,font=\bfseries]    at ( 5.5, 2.55) {$S_+=B=\{4,5,6\}$};
    \node[navy, font=\footnotesize]at (-0.5,-2.55) {weight $<0$ (slow basin)};
    \node[mpred,font=\footnotesize]at ( 5.5,-2.55) {weight $>0$ (fast basin)};
    \node[teal, font=\footnotesize\itshape] at (2.5,0.0) {two-edge cut};
    \draw[teal,->,line width=0.6pt] (2.5, 0.25) .. controls (2.7, 0.9) .. (2.55, 1.3);
    \draw[teal,->,line width=0.6pt] (2.5,-0.25) .. controls (2.7,-0.9) .. (2.55,-1.3);
  \end{tikzpicture}
  \caption[Network split by a cut]{\textbf{The object decomposes into two blocks
  joined by a multi-edge cut.} Nodes colored by category (navy $A$, red $B$) and
  sized by $|\text{weight}|$; teal solid edges are intra-block, dashed teal edges
  are the cut. A cycle crosses the cut, so it is a genuine \emph{two-edge} cut, not
  a single bridge. Data: \texttt{numbers.md}; script \texttt{verify.py}.}
  \label{fig:archA}
\end{figure}
```

> **Change this to adapt:** edit the two `minimum size=` lines so each node's
> diameter encodes *your* per-node weight (small for light, large for heavy), and
> the `\draw[cut]` lines to mark *your* interface edges.
>
> **Memory rule (load-bearing):** keep the cut a **multi-edge** cut — at least two
> edges joining the blocks, with a cycle crossing it. A single bridge / articulation
> edge is the degenerate tree case and must never be the *running* example; show it
> only as an explicit contrast. (This is a hard requirement from the source project.)

---

## 1.2 Archetype B — A gallery of sub-objects (motifs / rooted forests) with weights

A row of small "specimen" pictures, each a little graph or motif with a weight
underneath — a visual sum/expansion (e.g. "the determinant is this forest plus that
forest plus..."). Built as a `\foreach` over horizontally shifted scopes so the
gallery scales to any number of specimens.

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[
      font=\small, >={Stealth[length=1.8mm]},
      v/.style={circle, fill=navy, inner sep=1.7pt},
      r/.style={circle, fill=gold, draw=gold!60!black, inner sep=2.1pt}, % root
      e/.style={teal!80, line width=1.0pt},
    ]
    % each specimen: {x-shift / root-node / weight-label}
    \foreach \dx/\rt/\w in {0/a/$+w_1$, 3.2/b/$-w_2$, 6.4/c/$+w_3$}{
      \begin{scope}[shift={(\dx,0)}]
        \coordinate (a) at (0,0); \coordinate (b) at (1,0.55); \coordinate (c) at (1,-0.55);
        \draw[e] (a)--(b); \draw[e,->] (a)--(c);
        \foreach \n in {a,b,c}{ \node[v] at (\n) {}; }
        \node[r] at (\rt) {};                                   % highlight the root
        \node[font=\footnotesize, anchor=north] at (0.5,-0.95) {\w};
        \draw[inkgray, dotted] (-0.45,-1.35) rectangle (1.45,0.95); % specimen box
      \end{scope}
    }
    \node[font=\Large] at (2.55,0)  {$+$};                       % connect with operators
    \node[font=\Large] at (5.75,0)  {$+$};
    \node[font=\bfseries, anchor=west] at (8.2,0) {$=\;\det(\cdot)$};
    \node[gold!70!black, font=\scriptsize\itshape, anchor=west] at (-0.45,1.15)
      {gold node $=$ root; label $=$ signed weight};
  \end{tikzpicture}
  \caption[Gallery of weighted sub-objects]{\textbf{The quantity expands as a signed
  sum over motifs.} Each boxed specimen is one rooted sub-object (root in gold); its
  signed weight sits below. Their sum is the target quantity.}
  \label{fig:archB}
\end{figure}
```

> **Change this to adapt:** edit the `\foreach` list `{x-shift / root / weight}` to
> list your motifs, and the per-specimen `\draw`/`\node` body to draw your actual
> sub-object (tree, forest, loop, diagram). Add or remove `$+$` connectors to match.

---

## 1.3 Archetype C — An ordered sign / category strip that counts changes

States laid out left-to-right along an axis (energy, time, index), each a colored
token carrying a `+`/`-` sign (or a category glyph), with **gold arrows marking
adjacent sign changes** and the running count `V` annotated. This is the figure that
turns "the orderings are frustrated" into an integer. Generalized from the
frustration-count figure; uses a `\foreach` over `{k / sign / label / color}` so it
extends to any sequence length.

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[font=\small, line width=0.8pt]
    \begin{scope}
      \node[anchor=west,font=\bfseries] at (-0.3,1.6) {(a) aligned: one change};
      \draw[->] (0,0) -- (8.6,0) node[right] {$E$ (increasing)};
      \def\dx{1.25}
      \foreach \k/\s/\lab/\col in {1/$-$/1/navy,2/$-$/2/navy,3/$-$/3/navy,
                                    4/$+$/4/mpred,5/$+$/5/mpred,6/$+$/6/mpred}{
        \pgfmathsetmacro\x{\k*\dx-0.5}
        \filldraw[\col] (\x,0.55) circle (8pt);                 % colored token
        \node[white,font=\bfseries] at (\x,0.55) {\s};          % sign inside
        \node[\col,font=\scriptsize,below=10pt] at (\x,0) {$\lab$};
      }
      \pgfmathsetmacro\xb{3.5*\dx-0.5}                          % the single boundary
      \draw[gold,line width=1.2pt,->] (\xb,1.45) -- (\xb,0.95);
      \node[gold,font=\footnotesize,anchor=west] at (\xb+0.12,1.2) {sign change};
      \node[font=\bfseries] at (4.0,-1.2) {$V=1\ \Rightarrow\ M\le 0$};
    \end{scope}
    \begin{scope}[shift={(0,-3.4)}]
      \node[anchor=west,font=\bfseries] at (-0.3,1.6) {(b) frustrated: three changes};
      \draw[->] (0,0) -- (8.6,0) node[right] {$E$ (increasing)};
      \def\dx{1.25}
      \foreach \k/\s/\lab/\col in {1/$-$/1/navy,2/$+$/6/mpred,3/$-$/2/navy,
                                    4/$-$/3/navy,5/$+$/4/mpred,6/$+$/5/mpred}{
        \pgfmathsetmacro\x{\k*\dx-0.5}
        \filldraw[\col] (\x,0.55) circle (8pt);
        \node[white,font=\bfseries] at (\x,0.55) {\s};
        \node[\col,font=\scriptsize,below=10pt] at (\x,0) {$\lab$};
      }
      \foreach \kk in {1.5,2.5,4.5}{                            % every boundary
        \pgfmathsetmacro\xb{\kk*\dx-0.5}
        \draw[gold,line width=1.2pt,->] (\xb,1.35) -- (\xb,0.95);
      }
      \node[gold,font=\footnotesize] at (7.0,1.35) {three sign changes};
      \node[font=\bfseries] at (4.0,-1.2) {$V=3\ \Rightarrow\ M\le 2$};
    \end{scope}
  \end{tikzpicture}
  \caption[Counting sign changes along an order]{\textbf{The frustration count is the
  number of sign changes along the ordering.} Tokens are laid out in increasing-$E$
  order; the glyph inside is the category sign. Gold arrows mark adjacent changes.
  \textbf{(a)}~aligned, $V=1$; \textbf{(b)}~one token dives, $V=3$.}
  \label{fig:archC}
\end{figure}
```

> **Change this to adapt:** edit the two `\foreach` lists `{position / sign / label /
> color}` to your two sequences, and the gold-arrow `\foreach` `{boundary positions}`
> to mark where signs flip.

---

## 1.4 Archetype D — A 1-D function plotted with its marked zeros / roots

A smooth curve (a partition function, a response, an order parameter) drawn with
Bézier `controls`, its axis crossings marked as dots and annotated. Use this to show
"this object has *these* roots, and the special one is *here*." Two curves (an
aligned/monotone one and a frustrated/multi-root one) on the same axes make the
contrast. Generalized from the signed-partition-function figure; both the shape and
the example root values below are schematic — in your document, place the markers at
your *exact* roots, read from `numbers.md`.

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[font=\small, line width=1pt, scale=1.32]
    \def\xmax{4.4}
    \draw[->] (0,0) -- (\xmax,0) node[right] {$\beta=1/T$};
    \draw[->] (0,-1.7) -- (0,1.9) node[above] {$Z(\beta)$};
    % reference root (the "trivial"/bath zero), drawn as a guide line
    \draw[navy,dashed] (1.55,-1.7) -- (1.55,1.9);
    \node[navy,anchor=south,font=\footnotesize] at (1.55,1.9) {$\beta_b=1$ (trivial)};
    % curve 1: monotone, single root at the trivial zero (teal)
    \draw[teal,line width=1.1pt]
      (0.05,1.55) .. controls (0.8,1.2) and (1.2,0.45) .. (1.55,0.0)
      .. controls (1.9,-0.45) and (2.6,-1.0) .. (\xmax,-1.45);
    \node[teal,anchor=east,font=\footnotesize] at (4.35,-1.62) {aligned ($M{=}0$)};
    \filldraw[navy] (1.55,0) circle (2.6pt);
    % curve 2: non-monotone, extra real roots (mpred), each marked gold
    \draw[mpred,line width=1.1pt]
      (0.05,0.95) .. controls (0.35,0.55) and (0.7,-0.35) .. (0.90,-0.30)
      .. controls (1.05,-0.27) and (1.25,0.45) .. (1.55,0.0)
      .. controls (1.95,-0.6)  and (2.6,-0.95) .. (3.4,-0.55)
      .. controls (3.7,-0.30) and (3.9,0.05)  .. (4.1,0.30);
    \node[mpred,anchor=west,font=\footnotesize] at (1.7,1.15) {frustrated ($M{=}2$)};
    \filldraw[gold] (0.83,0) circle (2.8pt);                    % nontrivial root 1
    \node[gold,anchor=north,font=\footnotesize] at (0.80,-0.42) {root $T_M{=}1.72$};
    \filldraw[gold] (3.95,0) circle (2.8pt);                    % nontrivial root 2
    \node[gold,anchor=north,align=center,font=\footnotesize] at (4.05,-0.65)
      {root $T_M{=}0.025$\\[-1pt]{\color{gray}(far right)}};
  \end{tikzpicture}
  \caption[A function and its roots]{\textbf{Nontrivial roots are the effect.}
  \textbf{Teal:} aligned case, monotone through the single trivial root.
  \textbf{Red:} frustrated case, two extra real roots (gold). Shape and root
  positions schematic. Roots from \texttt{numbers.md}; script \texttt{verify.py}.}
  \label{fig:archD}
\end{figure}
```

> **Change this to adapt:** replace the two `.. controls ..` Bézier paths with your
> curve's shape, and move the gold `\filldraw ... circle` markers to your actual root
> locations (read them from your `numbers.md` so they are exact, not eyeballed).

---

## 1.5 Archetype E — A complex-plane diagram with marked zeros and a winding contour

The complex plane (Re/Im axes), scattered zeros (e.g. Fisher / Lee–Yang zeros), the
real-axis special points highlighted, and a **gold rectangular contour** hugging the
real axis with an arrowhead to show winding/orientation. In the real run this lived
as a matplotlib *inset*, but it is fully reproducible as standalone TikZ — useful
when you want it vector-crisp and editable inline.

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[font=\small, line width=0.8pt, scale=1.0]
    % axes
    \draw[inkgray,->] (-1.3,0) -- (2.0,0) node[right]{$\mathrm{Re}\,\beta$};
    \draw[inkgray,->] (0,-2.0) -- (0,2.0) node[above]{$\mathrm{Im}\,\beta$};
    % off-axis (complex-conjugate) zeros: open teal circles
    \foreach \x/\y in {-0.6/1.3, -0.6/-1.3, 1.25/0.9, 1.25/-0.9, 0.35/1.7, 0.35/-1.7}{
      \draw[teal,line width=0.9pt] (\x,\y) circle (2.4pt);
    }
    % real-axis special points: filled, navy = trivial, red = the effect
    \filldraw[navy]  (1.0,0) circle (2.8pt) node[below=3pt,font=\scriptsize]{$\beta_b$};
    \filldraw[mpred] (0.26,0) circle (2.8pt) node[above=3pt,font=\scriptsize]{$\beta_M$};
    % gold winding contour hugging the positive real axis, with orientation arrow
    \draw[gold,line width=1.1pt] (0.05,-0.55) -- (1.5,-0.55) -- (1.5,0.55)
                                 -- (0.05,0.55) -- cycle;
    \draw[gold,->,line width=0.9pt] (0.95,0.55) -- (0.55,0.55);
    \node[gold,font=\footnotesize] at (1.62,0.72) {$\mathcal{C}$};
  \end{tikzpicture}
  \caption[Zeros and a winding contour in the complex plane]{\textbf{Real zeros are
  the physical effects; the contour counts them.} Open teal circles are
  complex-conjugate zeros; filled markers are the real-axis special points (navy
  trivial, red the effect). The gold contour $\mathcal C$ winds around the positive
  real axis. Zeros from \texttt{numbers.md}; script \texttt{verify.py}.}
  \label{fig:archE}
\end{figure}
```

> **Change this to adapt:** edit the off-axis `\foreach {x/y}` list to your computed
> zero locations and move the two filled real-axis markers; resize the gold rectangle
> to enclose whatever region your winding argument needs.

---

## 1.6 Archetype F — An integer "staircase" vs a parameter

A step function: an integer quantity (a Mpemba index, a winding number, a count of
something) that jumps at thresholds of a continuous parameter. Drawn as horizontal
treads + open/filled circles at the jumps (filled = value attained, open = limit not
attained), the classic right-continuous staircase.

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[font=\small, line width=1.1pt, scale=1.0]
    \draw[->] (0,0) -- (7.2,0) node[right]{$s$ (control parameter)};
    \draw[->] (0,-0.2) -- (0,3.3) node[above]{$M(s)$ (integer index)};
    \foreach \y in {1,2,3}{ \node[inkgray,left,font=\scriptsize] at (0,\y) {\y};
                            \draw[inkgray!30] (0,\y) -- (7,\y); }
    % treads: {x-start, x-end, height}
    \def\tread#1#2#3{\draw[navy,line width=1.6pt] (#1,#3) -- (#2,#3);}
    \tread{0}{2}{0} \tread{2}{4}{1} \tread{4}{5.6}{2} \tread{5.6}{7}{3}
    % jump markers: filled = attained at the threshold (right-continuous)
    \foreach \x/\ylo/\yhi/\i in {2/0/1/1, 4/1/2/2, 5.6/2/3/3}{
      \draw[navy,fill=white,line width=1pt] (\x,\ylo) circle (2.4pt);  % open: left limit
      \filldraw[navy] (\x,\yhi) circle (2.4pt);                        % filled: value
      \draw[gold,dashed,line width=0.6pt] (\x,0) -- (\x,\yhi);
      \node[gold,below,font=\scriptsize] at (\x,0) {$s_{\i}$};
    }
    \node[mpred,font=\footnotesize,anchor=east] at (7.0,3.32)
      {each step $=$ one new zero crossing};
  \end{tikzpicture}
  \caption[Integer staircase vs a parameter]{\textbf{The index is piecewise constant
  and jumps at thresholds.} Navy treads are the integer value; at each gold threshold
  a new feature appears and the index steps up (filled $=$ value attained). Thresholds
  from \texttt{numbers.md}.}
  \label{fig:archF}
\end{figure}
```

> **Change this to adapt:** edit the `\tread{start}{end}{height}` calls to your
> step locations/heights and the jump-marker `\foreach {x/below/above}` to match. Flip
> filled/open circles if your quantity is left-continuous instead.

---

## 1.7 Archetype G — A two-block / articulation schematic

Two clusters joined at a single **articulation vertex** (or by a thin neck),
schematically — the "locality / modularity" picture that says "structure on one side
is invisible to the other." Use this for design/locality arguments. (Note: this is
the *schematic* of an articulation as a concept; your *running data example* must
still be a multi-edge cut per the memory rule — articulation here illustrates a
limiting case.)

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[
      font=\small, >={Stealth[length=2mm]},
      blob/.style={draw, rounded corners=14pt, line width=0.8pt, minimum height=2.4cm},
      Anode/.style={circle, fill=navy,  text=white, inner sep=0pt, minimum size=6mm},
      Bnode/.style={circle, fill=mpred, text=white, inner sep=0pt, minimum size=6mm},
      art/.style={circle, fill=gold, draw=gold!55!black, text=white, inner sep=0pt,
                  minimum size=7mm, line width=0.9pt},
      e/.style={teal!80, line width=1.0pt},
    ]
    % left block A (active / sign-bearing)
    \node[blob, draw=navy!55,  fill=navy!6,  minimum width=3.0cm] (A) at (0,0) {};
    \node[navy, font=\bfseries, above] at (A.north) {block $A$ (active)};
    \coordinate (a1) at (-1.3,0.6); \coordinate (a2) at (-1.3,-0.6); \coordinate (a3) at (-0.2,0);
    \draw[e] (a1)--(a3); \draw[e] (a2)--(a3);
    \node[Anode] at (a1){}; \node[Anode] at (a2){};
    \node[Anode,minimum size=4mm] at (a3){};   % intra-block hub — draw it, don't leave
                                               % edges converging on empty space
    % right block B (uniform / "dark")
    \node[blob, draw=mpred!55, fill=mpred!6, minimum width=3.0cm] (B) at (4.5,0) {};
    \node[mpred,font=\bfseries, above] at (B.north) {block $B$ (uniform)};
    \coordinate (b1) at (5.0,0.6); \coordinate (b2) at (5.0,-0.6); \coordinate (b3) at (3.7,0);
    \draw[e] (b1)--(b3); \draw[e] (b2)--(b3);
    \node[Bnode] at (b1){}; \node[Bnode] at (b2){};
    \node[Bnode,minimum size=4mm] at (b3){};   % intra-block hub (see above)
    % the single shared articulation vertex
    \node[art] (v) at (2.25,0) {$\ast$};
    \draw[e] (a3)--(v); \draw[e] (v)--(b3);
    \node[gold!60!black,font=\footnotesize, align=center, below=10pt] at (v)
      {articulation\\vertex};
    \node[inkgray,font=\footnotesize,align=center] at (2.25,-1.7)
      {structure in $A$ is screened from $B$\\across the single joint};
  \end{tikzpicture}
  \caption[Two blocks joined at an articulation]{\textbf{A single joint localizes
  structure.} Active block $A$ (navy) carries all the sign structure; block $B$ (red)
  is uniform/``dark''; they meet only at the gold articulation vertex, through which
  $A$'s structure is screened from $B$.}
  \label{fig:archG}
\end{figure}
```

> **Change this to adapt:** edit the two `\node[blob ...]` widths/positions and the
> per-block node coordinates; replace the single `art` joint with two edges + a thin
> neck if your real coupling is multi-edge rather than a true articulation.

---

## Track 3: numbers → figures (Archetypes H–K)

Tracks 1 and 2 say *how to draw*; Track 3 is the *policy* that cuts across both:
**every load-bearing quantity in `numbers.md` must also appear in at least one
figure or professionally typeset table in the chapters.** A bare inline number is
never acceptable as the only presentation of a key result. The routing map:

* **Single key quantities compared across cases** (two roots, a bath temperature,
  a before/after ratio) → **Archetype H**, the numbers-comparison figure (§1.8).
* **Families of quantities / per-case tables** (several cases × several
  quantities) → **Archetype I**, the styled results table (§1.9).
* **Numbers living on a structure** (per-node weights, per-edge couplings, a root
  on a curve, a point in a parameter plane) → annotate an **Archetype A/G-style
  diagram** (or D/K) with the values printed *at* the marks, so the structure
  figure itself becomes the number's home.

J (pipeline) and K (regime diagram) round out the set as the general-purpose
structure diagrams almost every paper needs at least once — and K must carry at
least one measured point with its coordinates printed. The referee audits this
mandate under the *Visualization* dimension of `acceptance_rubric.md` — bare
inline numbers as the only presentation of a key result are a blocker.

---

## 1.8 Archetype H — A numbers-comparison figure (key quantities, values printed at the marks)

An annotated bar/dot comparison of the headline quantities from `numbers.md`, drawn
to a common scale with **the exact value printed at each mark**. This is the
cheapest way to turn a paragraph of inline numbers into a figure that doubles as the
table of record.

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[font=\small, line width=0.8pt]
    % data rows: {row / label / value / color} — values VERBATIM from numbers.md
    \def\xscale{1.6}                              % cm per unit of value
    \foreach \i/\lab/\val/\col in {0/{$T_M$ (shallow root)}/1.72/gold,
                                   1/{$T_b$ (bath)}/1.00/navy,
                                   2/{crossing-time ratio}/2.60/mpred,
                                   3/{$T_M'$ (deep root)}/0.025/teal}{
      \pgfmathsetmacro\y{-0.72*\i}
      \pgfmathsetmacro\w{\xscale*\val}
      \fill[\col!80] (0,\y-0.20) rectangle (\w,\y+0.20);
      \node[anchor=east,font=\footnotesize] at (-0.15,\y) {\lab};
      \node[\col!60!black,anchor=west,font=\scriptsize\bfseries] at (\w+0.10,\y) {\val};
    }
    \draw[inkgray,line width=0.9pt] (0,0.45) -- (0,-2.65);       % common baseline
    \node[inkgray,font=\scriptsize,anchor=west] at (0,-3.0)
      {bar length $\propto$ value; the exact number is printed at the mark};
  \end{tikzpicture}
  \caption[Key quantities compared]{\textbf{The headline numbers, side by side.}
  Each load-bearing quantity is drawn to a common scale and its exact value printed
  at the bar end, so the figure doubles as the table of record. Values:
  \texttt{numbers.md} (\textsf{[Roots]}, \textsf{[Times]}); script
  \texttt{verify.py}.}
  \label{fig:archH}
\end{figure}
```

> **Change this to adapt:** edit the `\foreach` list `{row / label / value / color}`
> — values verbatim from your `numbers.md`. If your values span decades (like 1.72
> vs 0.025 here), switch to dots at $\log_{10}$ positions or truncate the long bars
> and let the printed value carry the magnitude.

---

## 1.9 Archetype I — A styled results table (booktabs + palette-highlighted cells)

When the numbers are naturally tabular (several cases × several quantities), a
professionally typeset table *is* the figure. House rules: `booktabs` rules only
(no vertical lines), sans body, palette tints (≤ 20%) on the headline cells only,
and the provenance clause in the caption — non-negotiable, same as §0.3.

```latex
% additionally needs, in the preamble:  \usepackage{booktabs,colortbl}
\begin{table}[t]
  \centering
  \caption[Key results table]{\textbf{Every load-bearing number in one place.}
  Tinted cells are the headline results the chapter argues for. Provenance
  (non-negotiable): all values from \texttt{numbers.md} (\textsf{[Roots]},
  \textsf{[Census]}); script \texttt{verify.py}.}
  \label{tab:archI}
  \sffamily\small
  \begin{tabular}{@{}lccc@{}}
    \toprule
    case & $V$ (sign changes) & $M$ (index) & nontrivial roots $T_M$ \\
    \midrule
    aligned     & 1 & 0                       & --- \\
    frustrated  & 3 & \cellcolor{gold!20}$2$  & \cellcolor{gold!20}$1.72,\ 0.025$ \\
    deep quench & 5 & \cellcolor{mpred!12}$4$ & \cellcolor{mpred!12}$2.31,\ \dots$ \\
    \bottomrule
  \end{tabular}
\end{table}
```

> **Change this to adapt:** swap the header row and body rows for your cases and
> quantities; keep `\cellcolor` tints only on the cells the chapter's argument
> hinges on (highlight everything = highlight nothing), and keep the caption's
> provenance clause.

---

## 1.10 Archetype J — A pipeline / flowchart diagram

Stages as rounded boxes, data flow as teal arrows, the palette encoding roles: navy
= inputs/intermediates, red = where the work happens, gold = the deliverable. Use it
for method pipelines, proof roadmaps, or the document's own build flow.

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[font=\small\sffamily, node distance=6mm and 9mm,
      >={Stealth[length=2.2mm]},
      stage/.style={draw=navy!70, fill=navy!6, rounded corners=3pt, line width=0.8pt,
                    align=center, inner sep=5pt, minimum height=9mm},
      key/.style={draw=mpred!70, fill=mpred!8},
      final/.style={draw=gold!70!black, fill=gold!14},
      flow/.style={->, teal, line width=1.1pt},
    ]
    \node[stage]                    (a) {source\\paper};
    \node[stage, right=of a]        (b) {ground truth\\\texttt{numbers.md}};
    \node[stage, key,   right=of b] (c) {chapters\\(proofs $+$ example)};
    \node[stage, final, right=of c] (d) {typeset\\PDF};
    \node[stage, below=of c]        (e) {figures\\(\S1 / \S2 tracks)};
    \draw[flow] (a) -- (b);
    \draw[flow] (b) -- (c);
    \draw[flow] (c) -- (d);
    \draw[flow] (b) |- (e);
    \draw[flow] (e) -- (c);
    \node[inkgray,font=\scriptsize\itshape, below=3pt of e]
      {every plotted number traces back to \texttt{numbers.md}};
  \end{tikzpicture}
  \caption[Pipeline diagram]{\textbf{The stages and what flows between them.} Navy
  boxes are inputs and intermediates, the red box is where the work happens, the
  gold box is the deliverable; teal arrows carry the data.}
  \label{fig:archJ}
\end{figure}
```

> **Change this to adapt:** rename the `\node[stage]` boxes to your stages and
> rewire the `\draw[flow]` arrows; keep the role coloring (navy in, red work, gold
> out) so every pipeline in the document reads the same way.

---

## 1.11 Archetype K — A 2-D phase / regime diagram with labeled regions

A parameter plane split by boundary curves into labeled regimes, each region painted
with an opaque pale fill (the §2.2 hull rule — no translucent overlaps), the
boundary curves drawn on top, and at least one **measured point printed with its
exact coordinates** so the diagram carries a number, not just topology.

```latex
\begin{figure}[t]
  \centering
  \begin{tikzpicture}[font=\small, line width=0.9pt]
    \def\xmax{5.6}  \def\ymax{3.6}
    % paint the regions first (opaque pale fills), boundaries and axes on top
    \fill[navy!7]   (0,0) rectangle (\xmax,\ymax);                    % middle regime
    \fill[mpred!10] (0,1.4) .. controls (1.8,1.7) and (3.2,2.4) .. (\xmax,2.9)
                    -- (\xmax,\ymax) -- (0,\ymax) -- cycle;           % upper regime
    \fill[gold!15]  (1.1,0) .. controls (1.6,0.8) and (2.8,1.1) .. (\xmax,1.25)
                    -- (\xmax,0) -- cycle;                            % lower regime
    % boundary curves: solid = exact boundary, dashed = crossover
    \draw[mpred,line width=1.2pt]
      (0,1.4) .. controls (1.8,1.7) and (3.2,2.4) .. (\xmax,2.9);
    \draw[gold!75!black,line width=1.2pt,dashed]
      (1.1,0) .. controls (1.6,0.8) and (2.8,1.1) .. (\xmax,1.25);
    % axes on top of the fills
    \draw[->] (0,0) -- (\xmax+0.5,0) node[right] {$g$ (coupling)};
    \draw[->] (0,0) -- (0,\ymax+0.5) node[above] {$T$};
    % region labels: name each regime IN its region
    \node[mpred!80!black,font=\bfseries] at (1.8,3.15) {no effect ($M=0$)};
    \node[navy,font=\bfseries]           at (3.9,1.78) {effect regime ($M\ge 1$)};
    \node[gold!60!black,font=\bfseries]  at (4.2,0.5)  {frozen (strong $g$)};
    % one measured point, printed with its exact coordinates (from numbers.md)
    \filldraw[teal] (2.9,1.4) circle (2.2pt);
    \node[teal,font=\scriptsize,anchor=west] at (3.02,1.4)
      {$(g^{*},T^{*}) = (2.9,\,1.4)$};
  \end{tikzpicture}
  \caption[Phase / regime diagram]{\textbf{Where each behavior lives in parameter
  space.} The red solid curve is the exact boundary, the gold dashed curve a
  crossover; regions are named in place. The teal point is the worked example's
  location, printed with its exact coordinates. Boundaries and point from
  \texttt{numbers.md}; script \texttt{verify.py}.}
  \label{fig:archK}
\end{figure}
```

> **Change this to adapt:** replace the two `.. controls ..` boundary curves (and
> their matching region-fill paths — keep each fill's edge *identical* to its drawn
> boundary) with your boundaries, rename the region labels, and move the teal
> point(s) to your measured location(s) with the printed coordinates read from
> `numbers.md`.

---

# §2 — REUSE existing data figures (matplotlib → PDF → `\includegraphics`)

For anything numeric, generate the figure **once** with a seeded Python script that
writes a **vector PDF** into `figs/`, then include it. Do not hand-port data into
TikZ. The pattern below is generalized from `fig1_cut.py … fig5_design.py`.

## 2.1 The script skeleton (every data figure follows it)

```python
"""
FIGURE N (one/two column, Sec. ... "<the message>").
(a) <panel a content>     (b) <panel b content>     (c) <panel c content>
Message: <one line>.   Outputs: ../figs/figN.pdf  (PDF is the deliverable)
"""
import os
import numpy as np
import matplotlib as mpl; mpl.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec

plt.rcParams.update({                                  # the §0.4 Nature base
    "font.family": "serif", "mathtext.fontset": "cm",
    "font.size": 8.5, "axes.labelsize": 8.5, "legend.fontsize": 7,
    "xtick.labelsize": 7.5, "ytick.labelsize": 7.5,
    "axes.linewidth": 0.8, "lines.linewidth": 1.4,
})
C0, C1, C2, C3 = "#1f3b73", "#c0392b", "#16887b", "#b8860b"   # palette, identical to LaTeX
GRAY = "#4a4a4a"                                               # = inkgray
HERE = os.path.dirname(os.path.abspath(__file__))
FIGS = os.path.join(HERE, "..", "figs"); os.makedirs(FIGS, exist_ok=True)

# ---- compute everything from a SEEDED RNG so the figure is reproducible ----
rng = np.random.default_rng(7)
# ... build data, ideally re-using the SAME helpers as your verify_*.py so the
#     figure and the ground-truth numbers.md are computed by one code path ...

fig = plt.figure(figsize=(3.375, 6.3))                  # one column, tall 3-panel
gs  = GridSpec(3, 1, height_ratios=[1.0, 1.10, 1.02], hspace=0.50)

# ---- panel (a): left-aligned BOLD panel letter baked into the title ----
axa = fig.add_subplot(gs[0])
axa.set_title(r"$\mathbf{(a)}$ <what this panel shows>", loc="left", fontsize=8, pad=4)
# ... plot ...
axa.spines[["top", "right"]].set_visible(False)

# ---- ANNOTATE KEY POINTS DIRECTLY on the axes (not in a legend far away) ----
x0, y0 = 0.5, 0.5                                       # <-- your special point (from numbers.md)
axa.annotate("the special point", xy=(x0, y0), xytext=(x0, y0+0.9),
             color=C1, ha="center", fontsize=7.5,
             arrowprops=dict(arrowstyle="-|>", color=C1, lw=0.9))
axa.text(0.04, 0.275, r"exact identity:  $a_1 = Z_\omega/Z$", transform=axa.transData,
         fontsize=6.5, color=C0)            # state the takeaway IN the panel

fig.savefig(os.path.join(FIGS, "figN.pdf"))             # <-- PDF ONLY is the deliverable
print("saved figN.pdf")
```

> **PDF only.** The deliverable is the vector PDF. (The real scripts also emitted a
> `dpi=250` PNG for quick eyeballing, but **the PNG is never the artifact that goes
> into the document** — `\includegraphics` always pulls the PDF. If your project rule
> is "PDF only, never save PNG," drop the PNG line entirely and use the
> pdftoppm-to-temp visual check in §2.4 instead.)

## 2.2 House rules for data panels (every panel maximally informative)

* **Panel letter** bold, left-aligned, baked into the title: `r"$\mathbf{(a)}$ ..."`.
* **Annotate key points directly** on the data with `ax.annotate(..., arrowprops=...)`
  — name the special root/threshold/onset *where it sits*, never make the reader
  hunt a legend. State the governing identity *inside* the panel as a `text`.
* **Encode a second variable** wherever you can: node **area ∝ weight**
  (`s=430*abs(w)`), color ∝ sign/category (`C1 if w>0 else C0`), so each glyph
  carries two facts.
* **Mark the forbidden / trivial regions** with a pale fill
  (`ax.fill_between(x, x, ymax, color="#fbece9", zorder=0)`) and label them
  ("forbidden by Thm 1(ii)").
* **Annotate exact counts** at each occupied lattice point in an ensemble scatter
  (`ax.text(v+0.08, y, f"{count}")`) — the figure then doubles as a table.
* **Hulls without alpha artifacts:** fill a `Polygon` with an *opaque pale* color and
  stroke its boundary with a thick round-joined line of the same color, instead of a
  translucent fill that darkens where domains overlap:
  ```python
  from matplotlib.patches import Polygon
  for dom, fill in [([0,1,2], "#e3e8f3"), ([3,4,5], "#f7e3df")]:
      pts = np.array([pos[v] for v in dom])
      ax.add_patch(Polygon(pts, closed=True, facecolor=fill, edgecolor="none", zorder=0))
      cyc = np.vstack([pts, pts[:1]])
      ax.plot(cyc[:,0], cyc[:,1], color=fill, lw=30,
              solid_joinstyle="round", solid_capstyle="round", zorder=0)
  ```
* **Labels next to nodes, never inside** small markers; put `$E=\dots$` beside each
  node with a per-node offset table.
* **Insets** for a second view (e.g. the complex-plane zeros as an inset on the
  real-axis curve): `axi = ax.inset_axes([0.555, 0.565, 0.435, 0.425])`.
* **Cut edges** drawn distinctly: dashed + accent color + thicker
  (`color=C1, lw=2.0, ls="--"`) vs. intra edges thin gray solid.

## 2.3 Include it in the chapter

```latex
\begin{figure}[t]
  \centering
  \includegraphics[width=0.74\linewidth]{figN.pdf}
  % reuse variant — crop a panel from a REUSED paper-figure PDF only
  % (trim order is left bottom right top; never trim a freshly generated figure):
  % \includegraphics[width=0.74\linewidth,trim=<l> <b> <r> <t>,clip]{paper-figN.pdf}
  \caption[Short ToC caption]{\textbf{Bold takeaway sentence.} Panel-by-panel
  reading: \textbf{(a)}~...; \textbf{(b)}~.... Provenance: counts from
  \texttt{numbers.md} (\textsf{[Census]}); scripts \texttt{code/figN.py}.}
  \label{fig:chX-figN}
\end{figure}
```

`trim=… clip` lets you crop whitespace or an unwanted sub-panel from a reused
paper-figure PDF without re-running the script. `\graphicspath` (§0.5) resolves the
short filename.

## 2.4 The VISUAL-CHECK LOOP (do this for every figure, both tracks)

A figure is not done when it compiles — it is done when you have *looked at it* and
it is publication-grade. The loop, exactly as run:

1. **Build a standalone of just the figure** (so you iterate in seconds, not on the
   whole document). For matplotlib, run the script. For TikZ, wrap the
   `tikzpicture` in a throwaway `standalone` file:
   ```bash
   cat > /tmp/figcheck.tex <<'EOF'
   \documentclass[border=4pt]{standalone}
   \usepackage{amsmath}
   \usepackage{tikz}
   \usetikzlibrary{arrows.meta,calc,positioning,decorations.pathmorphing,backgrounds,fit,patterns,shapes.geometric,plotmarks}
   \definecolor{navy}{HTML}{1f3b73}\definecolor{mpred}{HTML}{c0392b}
   \definecolor{teal}{HTML}{16887b}\definecolor{gold}{HTML}{b8860b}
   \definecolor{inkgray}{HTML}{4a4a4a}
   \begin{document}
   % <<< paste the tikzpicture here >>>
   \end{document}
   EOF
   pdflatex -output-directory=/tmp /tmp/figcheck.tex
   # if pdflatex is not on PATH, resolve it once and prepend it:
   #   command -v pdflatex || ls /Library/TeX/texbin/pdflatex \
   #                       || ls /usr/local/texlive/*/bin/*/pdflatex
   # (macOS MacTeX / Linux TeX Live; see the "find pdflatex" block in
   #  typesetting_guide.md)
   ```
2. **Rasterize and actually look** — render the PDF to PNG and open/Read it:
   ```bash
   pdftoppm -png -r 200 /tmp/figcheck.pdf /tmp/figcheck   # -> /tmp/figcheck-1.png
   ```
   (`pdftoppm` ships with poppler / poppler-utils.)
   Then *view the PNG* (Read the image file). This is the step people skip and it is
   the whole point — the model must inspect the rendered pixels.
3. **Fix what you see:** overlapping labels, text colliding with nodes, a node
   clipped by the frame, an arrowhead landing in the wrong place, a hull that's too
   tight, an illegible font size, a legend that should be a direct annotation, a
   second sub-panel that's redundant (crop it with `trim/clip`).
4. **Repeat** 1–3 until it is clean. Only then compile it into the full document.

This loop is cheap (`pdflatex` on a one-figure standalone is sub-second) and it is
what separates "it compiles" from "publication-grade." In the real run it caught
clipped nodes, label collisions, and a redundant sub-panel that got cropped away.

Steps 1–2 also ship as an executable script,
`references/scaffold/check_figure.sh` in this skill package: it wraps a snippet in
the standalone template, resolves `pdflatex`, builds, rasterizes, and prints the PNG
path. Run it instead of retyping the loop — but steps 2–3, *looking* at the pixels
and fixing what you see, remain yours.

---

## §3 — Decision checklist (which track, which archetype)

| You need to show… | Track | Use |
|---|---|---|
| A network split into blocks by a cut, nodes weighted | TikZ | Archetype A (1.1) |
| A sum/expansion over motifs / rooted forests | TikZ | Archetype B (1.2) |
| A count of sign changes along an order | TikZ | Archetype C (1.3) |
| A function and where it vanishes | TikZ | Archetype D (1.4) |
| Zeros in the complex plane + a contour | TikZ | Archetype E (1.5) |
| An integer that jumps with a parameter | TikZ | Archetype F (1.6) |
| Modularity / locality / an articulation | TikZ | Archetype G (1.7) |
| Key `numbers.md` quantities compared side by side | TikZ | Archetype H (1.8) |
| Load-bearing numbers, naturally tabular | booktabs table | Archetype I (1.9) |
| A pipeline / flowchart / proof roadmap | TikZ | Archetype J (1.10) |
| Regimes and boundaries in a 2-D parameter plane | TikZ | Archetype K (1.11) |
| A census / histogram over many samples | matplotlib PDF | §2 skeleton |
| An occupancy / onset / scaling curve | matplotlib PDF | §2 skeleton |
| An ensemble scatter with exact per-point counts | matplotlib PDF | §2 skeleton |
| A reused panel straight from the source paper | matplotlib PDF | `\includegraphics`+`trim/clip` |

**Non-negotiables for both tracks:** the five-color palette (§0.1), bold panel
letters (§0.3), every panel maximally informative with key points annotated directly
(§2.2), a provenance clause in every caption (§0.3), the visual-check loop on
every figure (§2.4), and the Track 3 numbers-as-figures mandate — every
load-bearing quantity in `numbers.md` also lands in at least one figure or typeset
table (Archetypes H–K, §1.8–1.11). And the memory rule that the *running* example join its
blocks by **more than one edge** — a multi-edge cut, never a single bridge.
