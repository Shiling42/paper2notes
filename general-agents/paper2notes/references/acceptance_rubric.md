# Acceptance Rubric & Hard Gates — Paper → Lecture Notes

A **project-agnostic** acceptance instrument for any job that expands a terse paper (or a
pile of dense research notes) into self-contained **lecture notes**. Use it two ways:

1. As the **scoring rubric** a referee-agent applies at the end of a run (100 points, 8
   dimensions, weighted).
2. As a set of **hard gates** that must *all* pass for the notes to be acceptable —
   independent of the score. A 95/100 document with one failing gate is **not done**.

> **Origin (worked example, do not specialize to it).** This rubric is the generalized
> distillation of one real, successful run: a terse ~11-page PRX paper, *"The Mpemba
> Effect as Topological Frustration,"* expanded into a **131-page**, professionally
> typeset lecture note that built clean (`pdflatex ×3`) with every acceptance gate green.
> That run is cited below only as a concrete *case study* of what "full marks" looked like
> in practice. Everything in this file is phrased so it applies to **any** paper or
> dense-notes → lecture-notes expansion. Substitute your own paper's theorems, running
> example, and ground-truth code wherever the Mpemba specifics appear.

---

## 0. Inputs the rubric assumes exist

Before scoring, confirm these artifacts are on disk (names are conventions, adapt freely):

| Artifact | Role | Mpemba case study (example) |
|----------|------|------------------------------|
| Source paper / dense notes | What is being expanded | `mpemba_topology_prx.tex` (~11 pp) |
| `contract.md` | Fixed macros, theorem envs, label/sign conventions, per-chapter division of labor, running-example constraints | `mpemba_lecture_notes/contract.md` |
| **`numbers.md`** | **Single source of truth for every numeral**, each entry citing the script that produced it | `mpemba_lecture_notes/numbers.md` |
| `code/` (+ any root verifier) | Runnable scripts that *derive* `numbers.md` | `verify_twotriangle.py`, `code/verify_core.py`, `code/saddle_node.py`, … |
| `chapters/*.tex` + `preamble.tex` | The notes themselves | `ch0…ch7`, `appendices.tex` |
| `figs/*.pdf` | Figures (PDF only) | `figs/fig1–5.pdf` + TikZ in chapters |
| Built PDF + `.log` | The compile evidence | `mpemba_lecture_notes.pdf` (131 pp) |

If `numbers.md` or the generating code is missing, **stop** — the correctness gate cannot
be evaluated and the run is not gradeable.

---

## 1. The 100-point rubric (8 dimensions)

Score each dimension on its own scale, then sum. "Full marks =" is the descriptor the
referee targets; partial credit is the referee's judgment of how far short the notes fall.

| # | Dimension | Wt | Full marks = |
|---|-----------|----|--------------|
| 1 | **Self-containedness** | 15 | A reader with only the paper's *prerequisite* background (the audience fixed in `contract.md` — e.g. "basic Mpemba + UG linear algebra/Markov") follows every step end to end. Nothing is used before it is defined; no forward dependency; no "as is well known." |
| 2 | **Concept depth** | 15 | Every *named, load-bearing* object the paper merely cites is built from scratch — definition, physical intuition, *and* a small concrete verification (a tiny example, a sanity check, a limiting case). Nothing imported as a black box. |
| 3 | **Theorem expansion** | 15 | Every theorem / lemma / proposition / corollary has: explicit assumptions, a stated intuition, a **gap-free** step-by-step proof, and an explicit note of *where each assumption is used*. No "it can be shown," no proof-by-citation, no hidden lemma. |
| 4 | **Worked example & operationality** | **20** | The **primary running example** (non-degenerate — see Gate 6) is carried through *every core chapter*, with **every intermediate number** shown, from raw setup to final answer. At least one instance is small enough to do **fully by hand**. A reader can replicate the whole procedure on a *new* instance from the notes alone (an operational checklist is the ideal deliverable). This is the highest-weighted dimension. |
| 5 | **Correctness** | 15 | Every numeral matches a re-run of the cited script in `numbers.md`; conventions (index/sign/orientation) are internally consistent and correct; zero unresolved correctness flags from the math/numerics review. |
| 6 | **Visualization** | 10 | Every figure is present, renders, is **visually inspected** by an agent (not just compiled), is publication-grade, and is **PDF only** (never PNG). Each figure has a self-contained caption; numerical figures cite their `numbers.md` entry / script. **Numbers-as-figures:** every *load-bearing* `numbers.md` quantity also appears in at least one figure or professionally typeset table in the chapters — a bare inline numeral is never the *only* presentation of a key result. Full marks require this; violations cost points here (and the referee files them as blockers), but this is a scoring criterion, not a 7th gate. |
| 7 | **Pedagogical flow / physics-first** | 5 | Each chapter opens with the physical picture / a named application *before* the algebra; the general theorem precedes its example; the whole reads as **one coherent arc**, not stitched fragments. |
| 8 | **Build & reproducibility** | 5 | Compiles clean (`pdflatex ×3`, no unresolved refs/citations, no overfull-box errors that break layout); every number is traceable to a script; a stranger can rebuild the PDF and re-derive the numbers from the repo. |

**Weighting rationale (keep this ordering generic):** the worked example (4) dominates
because operationality is what a *lecture note* adds over the paper; the three rigor
dimensions (1–3) and correctness (5) are the bulk of the rest; visualization, flow, and
build are smaller but each is also protected by a hard gate so they cannot be skipped.

Suggested acceptance threshold: **≥ 90/100 AND all hard gates green.** Tune the numeric
threshold per job, but never waive a gate.

> **Light-mode caveat.** Output from a *light-mode* workflow run is **draft grade — rubric
> compliance not claimed**; this rubric's score and gates certify **full** runs only.

---

## 2. Hard gates (ALL must pass, regardless of score)

These are binary. Any red gate ⇒ the notes are **not accepted**, even at a high score.

- **G1 — Clean build.** `pdflatex ×3` produces the PDF with no unresolved cross-references
  or citations and no layout-breaking errors. (Mpemba case: 131 pp, clean.)
- **G2 — Single ground-truth for numbers.** *Every* number in the notes traces to one
  `numbers.md` entry, and that entry is reproduced by re-running its cited script. Zero
  mismatches. No number appears that is not in `numbers.md`.
- **G3 — No load-bearing concept merely cited.** Every concept a proof or the main
  narrative *depends on* is defined and explained in the notes (Dimension 2 at the gate
  level: depth can be imperfect, but *absence* fails the gate).
- **G4 — Every theorem has a full proof.** No load-bearing theorem/lemma/prop is left
  unproved or proved only by reference to the source paper or external literature.
- **G5 — Running example in every core chapter.** The primary worked example appears in
  *each* core chapter (the chapters that develop the result — not the prologue/epilogue),
  carrying its numbers forward.
- **G6 — The example is non-degenerate.** The primary example must exercise the *general*
  case, not a special case that trivializes the result. Encode the paper-/contract-
  specific non-degeneracy condition here. (Mpemba case: the example must have a
  **multi-edge cut with a cycle crossing it** — explicitly *not* a single-bridge/tree,
  whose single-edge cut is a structural degeneracy. The chosen "two triangles joined by
  two rungs" 6-state network satisfies this.)

> **How to instantiate G6 for a new job.** Ask: "What is the cheap special case that makes
> this result look easier than it is?" Forbid the example from being that case. Examples of
> degeneracy to rule out: a 1-D / single-parameter instance when the theorem is
> multi-dimensional; a symmetric/uniform instance when the phenomenon needs asymmetry; a
> two-state or single-bridge instance when the structure needs ≥3 states or a multi-edge
> coupling; a tree when the result is about cycles.

---

## 3. How to run it (referee-agent gate + fix loop)

Use the rubric as an **automated referee gate**, not a one-shot human read. The loop:

1. **Re-derive ground truth.** Re-run every script cited in `numbers.md`; regenerate the
   numbers sheet fresh. If the sheet and code disagree, that is a G2 failure — fix the
   code or the sheet first.
2. **Build.** `pdflatex ×3` on the assembled document. Capture the `.log`. Any unresolved
   ref / missing figure / fatal error ⇒ G1 red.
3. **Score + collect blockers.** A referee agent reads the built PDF and scores all 8
   dimensions, *and* checks each hard gate. It emits a **scorecard**: per-dimension score
   with justification, plus an explicit PASS/FAIL per gate and a flat list of **blockers**
   (each blocker = the smallest concrete defect: "Thm 5.2 proof skips the
   surjectivity step"; "ω₃ printed as −0.63 but `verify_core.py` gives −0.6301";
   "Fig 4 caption missing script citation"; "concept *winding number* used in §5 but never
   defined").
4. **Targeted fixes.** Dispatch each blocker to a narrow fix (one chapter, one figure, one
   number) — do **not** rewrite wholesale. Re-run only what the fix touched.
5. **Loop** steps 2–4 until **all gates green and score ≥ threshold**. The gates are the
   real exit condition; the score guards quality above the gates.

**Lenses for step 3** (run them independently, then merge blockers): (i) a **math** lens —
every derivation step and convention; (ii) a **numerics** lens — re-run code, confirm every
printed numeral; (iii) a **pedagogy** lens — any concept used-before-defined or
cited-not-explained, and whether each chapter is physics-first. This three-lens split is
what caught the convention/index subtleties in the case-study run.

**Output of the gate** is a short scorecard the user can read at a glance: the 8 scores,
the 6 gate verdicts, and the remaining blocker list (empty at acceptance).
