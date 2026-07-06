# Project contract — notation, style, and non-negotiables

> Copy this file into the project as `contract.md`, fill every `<FILL IN: …>`
> slot, and delete this note. **Every agent that writes or reviews a chapter
> reads this file first and obeys it exactly.** It is the single place where
> the project's binding conventions live.

## 0. Audience

**This document is written for:** <FILL IN: audience — one sentence stating
exactly what the reader already knows, e.g. "a graduate student who knows
undergraduate linear algebra and basic Markov chains but none of this paper's
machinery">. Everything beyond that baseline is built from scratch; nothing
below it is re-derived.

## 1. TYPESETTING — DO NOT DOWNGRADE

The preamble (`preamble.tex`) is the design layer of the document, and it is
**load-bearing**. Binding rules:

- Theorem-like environments are declared with **plain `amsthm`** and get their
  colored, left-barred boxes **purely visually** via tcolorbox's
  `\tcolorboxenvironment`. The calling convention in chapters is the ordinary
  `\begin{theorem}\label{thm:…}…\end{theorem}` — names, counters, and labels
  unchanged. **Never** convert to `\newtcbtheorem`/`\newtcolorbox` theorem
  boxes: that changes the calling convention and breaks every chapter.
- If a compile error appears after the professional preamble is applied, **fix
  the offending chapter construct — never "simplify" the preamble, drop the
  fonts, remove the boxes, or otherwise downgrade the design** to make the
  error go away.
- Do not add packages that fight the design stack (font packages, alternative
  theorem packages, `\pagestyle` overrides) inside chapters.
- Full rationale and the layering recipe: see the skill's
  `references/typesetting_guide.md` (and the header of
  `references/preamble_lecture_notes.tex`).

## 2. Numbers: one source of truth

- `numbers.md` is the **single source of truth** for every quantity the notes
  quote. Every entry in it cites the runnable script that produced it; the key
  quantities are cross-checked by independent routes so a single bug cannot
  pass.
- **Never invent, recompute by eye, or round differently**: if a numeral
  appears in a chapter, it appears in `numbers.md` first, and the chapter's
  value matches it exactly (to the stated significant figures).
- If a chapter needs a quantity that is missing, the fix is to extend the
  verifier script and regenerate `numbers.md` — not to compute it inline.

## 3. Numbers-as-figures policy

**Every load-bearing quantity in `numbers.md` must also appear in at least one
figure or professionally typeset table.** Bare inline numbers are NOT
acceptable as the only presentation of key results. Use the
numbers-comparison figure or the styled results table archetypes in the
skill's `references/figure_techniques.md` (house palette, values printed at
the marks / key cells highlighted, provenance clause in the caption).

## 4. Color palette (the only sanctioned colors)

| name | hex | role |
|---|---|---|
| `navy` | `#1f3b73` | primary / structure / theorems |
| `mpred` | `#c0392b` | emphasis / "hot" side / warnings |
| `teal` | `#16887b` | secondary / definitions / edges |
| `gold` | `#b8860b` | tertiary / examples / highlights / zeros |
| `inkgray` | `#4a4a4a` | annotations / remarks / de-emphasis |

All figures (TikZ and matplotlib) and all table highlights use these five
colors only. `check_figure.sh` pre-defines them for standalone snippets.

## 5. The running example is NON-DEGENERATE

The primary running example must exercise the **general** case of the result —
never the cheap special case that makes the theorem look easier than it is.

- **Forbidden degenerate case for this project:** <FILL IN: forbidden cheap
  special case — e.g. "a tree / single-bridge cut when the result needs a
  multi-edge cut crossed by a cycle", "a symmetric instance when the
  phenomenon needs asymmetry", "the 1-D case of a multi-dimensional theorem">.
- The example is carried through **every core chapter with every intermediate
  number shown** (all from `numbers.md`), and at least one instance stays
  small enough to do fully by hand.

## 6. Notation and labels

- Macros: use only the macros defined in `preamble.tex`; define new
  domain-specific macros **in the preamble's customise block**, never inline
  in a chapter. <FILL IN: list the project's domain macros and their meaning.>
- Theorem-like environments available: `theorem`, `proposition`, `lemma`,
  `corollary`, `definition`, `example`, `remark`, and the `keyresult` box
  (use `keyresult` at most once or twice per chapter).
- Labels: `\label{<kind>:<chapter-id>-<slug>}` with kinds
  `thm/lem/cor/prop/def/eq/fig/tab/sec` (e.g. `\label{thm:ch2-courant}`).
- Chapters may assume only material from earlier chapters; forward references
  must be explicit ("proved in Appendix A").

## 7. Figures

- PDF only (TikZ compiled in-document, or matplotlib-generated PDF); the two
  tracks and archetypes are in the skill's `references/figure_techniques.md`.
- Every figure passes the visual-check loop (`check_figure.sh`) before it
  enters the document: compile standalone → rasterize → **look at the
  pixels** → fix → repeat.
- Every caption carries a provenance clause naming the producing script or
  `numbers.md` entry.
