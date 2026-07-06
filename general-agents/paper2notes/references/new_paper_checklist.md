# New-paper checklist — start HERE when pointing this skill at a new paper

The skill ships one real, complete run (the Mpemba PRX paper → 131-page
lecture note) as its worked example. That material is a *reference*, never a
default: a new job replaces every project-specific value. Work this list top
to bottom.

## 1. Read the paper fully

Read the entire source paper (and any dense machinery notes it leans on)
before writing anything. Produce, explicitly: the load-bearing concepts the
paper **cites but does not explain**, the theorems needing full proofs, and
any known convention/sign traps. Do not proceed until you can name all three
lists.

## 2. Write the rubric G6 non-degeneracy instantiation

Ask: *"what is the cheap special case that would make this result look easier
than it is?"* — and **forbid it in writing** (this becomes hard gate G6 in
`acceptance_rubric.md` and the `<FILL IN: forbidden cheap special case>` slot
of the contract). Mpemba instance: "the cut must be multi-edge with a crossing
cycle — never a tree / single bridge." Yours will differ; it must be equally
concrete and checkable.

## 3. Fix the audience

One sentence: exactly what the reader already knows. This calibrates what is
built from scratch vs. assumed, and it goes verbatim into the contract's
audience line and the CONFIG `AUDIENCE` field. The most important tone knob in
the whole pipeline.

## 4. Copy the scaffold

Copy `references/scaffold/` → your project directory: `master.tex`,
`compile_one.sh`, `build_all.sh`, `check_figure.sh`, and
`contract_template.md` (rename to `contract.md` and fill every `<FILL IN>`
slot). Fill `master.tex`'s REPLACE-FOR-YOUR-PAPER title/author/subtitle slots.
The scripts run from the project directory and probe for `pdflatex`
themselves.

## 5. Replace EVERY "REPLACE FOR YOUR PAPER" CONFIG field in `build_workflow_template.js`

Go through the CONFIG block field by field — a stale Mpemba default is a
defect, not a convenience:

- **PATHS**: `PAPER` (the source .tex), `OUT` (project dir), `CODE` (runnable
  ground-truth scripts), `FIGS` (reusable publication PDFs), `SOURCES` (extra
  machinery files, `[]` if none), `TEXBIN` (where pdflatex lives), and
  **`SKILLREF`** (path to this skill's package root — the directory containing
  `SKILL.md` and `references/`; when set, Phase A adapts the shipped scaffold
  templates and the Typeset phase uses the shipped preamble instead of
  regenerating either from prose).
- **TITLE / AUTHOR / AUDIENCE**: title and author strings; audience from
  step 3.
- **KEY CORRECTNESS TRAP**: the STANDARDS block's project-specific trap
  (`correctnessTrap`) — the one convention/index/sign pitfall the source is
  most likely to hide (from step 1). Spell out the correct convention.
- **CONCEPTS**: the cited-but-not-explained machinery list from step 1 — this
  is what the pedagogy lens checks "used-before-defined" against.
- **EXAMPLE_SPEC**: the running-example brief, replaced wholesale. It MUST
  keep the **three-way cross-check requirement**: the verifier computes the
  key quantities by (at least) three independent routes and asserts agreement,
  so a single bug cannot pass into `numbers.md`.
- **CHAPTERS**: the chapter array (id/num/title/source/covers/figures), with
  the **`core` flags** set on every chapter the running example must appear in
  (core chapters are hard-gate chapters).
- **RUBRIC G6 wording**: the rubric string's non-degeneracy gate, instantiated
  with your step-2 forbidden case.

## 6. Choose the mode: `light` or `full`

- `light` — cheap first pass: one combined verification lens per chapter,
  a single referee round, no figure-review loop; output is labeled "draft
  grade — rubric compliance not claimed" (numbers ground-truth, clean builds,
  and the Typeset phase are never trimmed).
- `full` — the real thing: three adversarial lenses per chapter, the figure
  review loop, and the referee loop until all hard gates pass.

## 7. Verify TEXBIN / the probe

Confirm a pdflatex exists before launching:
`command -v pdflatex`, else `/Library/TeX/texbin/pdflatex` (macOS MacTeX),
else `/usr/local/texlive/*/bin/*/pdflatex` (Linux TeX Live) — and that
`pdftoppm` is available (ships with poppler / poppler-utils). Set `TEXBIN`
accordingly. Quick check: run `bash build_all.sh` on the freshly copied
scaffold with a stub chapter.

## 8. Launch

Run `build_workflow_template.js` with the Workflow tool (args can override any
CONFIG scalar). No Workflow tool? Treat the file as an **execution spec**: run
each `agent()` prompt as a subagent in the stated order, honor the
`parallel()` fan-outs and the referee-loop bound (see SKILL.md).

---

## Two steering lessons from the real run (apply them up front)

1. **Force the non-degenerate example on day one.** The real run's biggest
   correction was the user insisting "the example must not be a single
   bridge" — the cheap special case had crept in. Steps 2 and 5
   (EXAMPLE_SPEC + G6) exist so this is caught at config time, not at referee
   time.
2. **Professional typesetting from the start — and never downgrade.** The
   rough→polished leap was a non-invasive preamble layer (amsthm names kept,
   boxes added visually). Ship the professional preamble early, and when a
   compile breaks, fix the chapter construct — never "simplify" the design
   away.
