---
name: paper2notes
description: Expand a terse research paper or dense notes into self-contained, professionally typeset lecture notes with full from-scratch proofs, a non-degenerate worked example carried throughout, a lookup-verified bibliography with a literature-positioning section (inherited from the source or search-discovered for bibliography-less drafts — never fabricated), the Palatino / tcolorbox typesetting, and reusable TikZ figure techniques. Use when the user wants to turn a paper into lecture/teaching notes, make a dense result readable or self-contained, ask for a pedagogical expansion of a paper, or expand a draft into notes that also position its result in the current literature.
---

# Paper → Lecture Notes

Turn a terse paper (or a pile of dense research notes) into a self-contained,
fully-proved, professionally typeset lecture note: every load-bearing concept built
from scratch, every theorem given a gap-free proof, one non-degenerate worked example
carried through every core chapter, all numbers traceable to runnable code, and
publication-grade figures — built clean and gated against an acceptance rubric.

This skill is the generalized distillation of one real, successful run (see the case-study
box at the end). The detail lives in the reference files in `references/` (five guides,
the `scaffold/` templates, and `new_paper_checklist.md`); this file is the map.

## When to use

- "Turn this paper into lecture notes / teaching notes."
- "Make this dense result self-contained / readable / pedagogical."
- "Expand the appendix proofs so a student can follow them."
- Any "paper or dense notes → self-contained lecture notes" expansion.

## When NOT to use

- Polishing an already-written paper for submission → use a paper-review/polish skill.
- Writing a *new* paper from results → use a paper-writing pipeline.
- A quick summary, or a *standalone* literature review → use a research-lit skill. (The
  literature layer here builds a verified bibliography *for the notes* and positions the
  result in the epilogue; it is not a survey deliverable.)
- Slides/poster from a paper → use the slides/poster skills.

## Procedure (ten phases)

Phases 1–2 are yours to do up front; phases 3–10 — **including phase 7's typesetting
layer** — are the heavy build, best run by the multi-agent workflow
(`references/build_workflow_template.js`).

1. **Understand the source — read it fully.** Read the entire source paper and any dense
   machinery/notes it leans on (fan out parallel explore agents on a large project). Pin
   down: the audience (exactly what the reader already knows), the load-bearing concepts
   the paper *cites but does not explain*, the theorems needing full proofs, and any known
   convention/sign traps. Do not start writing until you can name all of these.

2. **Write the plan + acceptance rubric FIRST.** Before a single chapter, write the
   chapter structure and a quantitative acceptance instrument — see
   **`references/acceptance_rubric.md`** (100 pts across 8 dimensions + 6 hard gates).
   Get it approved. The rubric is the definition of "done" every later agent optimizes
   against and the referee enforces. Fix the audience and the non-degeneracy constraint
   (phase 4) here. Starting a **new** paper? Open `references/new_paper_checklist.md`
   first — it walks every adaptation the remaining phases need.

3. **Scaffold + the ground-truth files (numbers from runnable code; citations from
   verified lookup).** Create the project
   (`report` class, `preamble.tex`, master, `compile_one.sh`, `build_all.sh`, `contract.md`)
   — start from the shipped templates in `references/scaffold/` (`master.tex`,
   `compile_one.sh`, `build_all.sh`, `contract_template.md`, `check_figure.sh`, `clean.sh`) and walk
   `references/new_paper_checklist.md`; adapt the templates rather than regenerating them
   from prose (the Phase A DELIVERABLES block of `references/build_workflow_template.js`
   remains the canonical content spec if you must scaffold by hand without them).
   The project directory must be **fresh and dedicated** — the build writes and finally
   cleans it (`clean.sh`, provenance-aware); never point it at an existing work folder.
   Then author a verifier script (pure numpy/scipy) that computes every quantity the notes
   will quote and **run it** to produce `numbers.md` — the single source of truth. Each
   entry cites its producing script; cross-check the key quantities ≥3 independent ways so
   a single bug cannot pass. Never let a number into the notes that is not in `numbers.md`.
   **The literature layer (unless `BIB: 'off'`) builds the second ground-truth pair the
   same way:** `refs.bib` + `citations.md` — every entry with an identifier (DOI/arXiv)
   **verified by an actual lookup**, a one-line role, and a tier tag; an `inherit` mode
   (carry over the source paper's own bibliography) and a `discover` mode (search-fill the
   load-bearing gaps via the keyless arXiv/Crossref/OpenAlex APIs or installed literature
   skills — for drafts with thin or no bibliography), with `auto` picking between them.
   The ledger also carries a `[Positioning]` section (upstream / parallel / downstream /
   expositions — the epilogue's inputs) and a `[Gaps]` section for
   wanted-but-unverifiable sources. The anti-fabrication rule is absolute: **no `\cite`
   outside the ledger, nothing in the ledger without a resolved identifier** — a missing
   source means the text stays uncited and the gap is recorded, never a citation from
   model memory. An independent audit re-resolves every identifier before drafting starts
   (the citation analogue of the numbers audit); the bibliography hook itself is wired at
   Assemble time, when chapters actually cite.

4. **Design a NON-DEGENERATE worked example.** Pick a running example that exercises the
   *general* case, not the cheap special case that trivializes the result. Ask: "what's the
   degenerate instance that makes this look easier than it is?" and forbid it (e.g. a tree /
   single-bridge cut when the structure needs a multi-edge cut and a crossing cycle; a
   symmetric instance when the phenomenon needs asymmetry; 1-D when the theorem is
   multi-dimensional). Carry this example — with **every intermediate number** — through
   every core chapter; keep at least one instance small enough to do fully by hand.

5. **Draft chapters, then adversarially verify on three lenses, then fix.** Draft each
   chapter (full prose, intuition before formalism, full proofs in the main text, worked
   example with the actual `numbers.md` numbers; `\cite` only keys that exist in
   `citations.md` — citations are provenance, not proof, and a missing source means no
   citation, not an invented one). The epilogue chapter (flagged `positioning: true`)
   additionally carries the **"Context and positioning" section** — the document's *only*
   positioning home: the result against the literature it builds on and sits beside, these
   notes against existing expositions, and the keyed literature-map figure (archetype L) —
   stated plainly, no novelty-selling, no citation politics. Then attack each chapter with
   three independent lenses — **math** (every step justified, conventions exact),
   **numeric** (re-run scripts, every numeral matches `numbers.md`, every `\cite` key
   resolves to the ledger), **pedagogy** (nothing used-before-defined or
   cited-not-explained, physics-first). Dispatch each finding to a narrow fix; re-compile.

6. **Synthesize the opening article (Section I), then compress it into the Preface.**
   Section I is written AFTER all chapters are drafted
   and assembled — a PRL-style standalone article that *replaces* any separate prologue
   chapter and opens the notes. The first paragraph answers why-it-matters; intuition and
   "what is the physics behind this" carry the story throughout. Every major theorem of
   the notes appears as a formal statement (precise assumptions + conclusion, real theorem
   environment, no proof) at the story's load-bearing points, forming a complete logical
   chain — what implies what, via which assumption, visible at a glance. Objects pay only
   a working-definition tax: 1–2 lines, precise enough to parse the statement, plus a
   pointer to the rigorous definition in the body. Two guidance devices: a
   theorem-dependency DAG figure (nodes tagged with the section numbers where the proofs
   live) and reader-type reading routes (e.g. user / verifier / teacher). Figures: the DAG
   plus exactly one no-numbers phenomenon/mechanism story schematic — proofs, proof-sketch
   levers, and numbers stay in the body chapters. Success test: a reader of Section I
   *alone* can say "I believe / don't believe the paper's central claim, because ...".
   Length: 8–12 pages for a ~100–130-page note, one-sitting readable. Forbidden genes:
   novelty-selling tone, citation politics, and "it can be shown" compression.
   Once Section I is verified, the same stage compresses it once more into the **Preface**
   — the top layer of the compression telescope. Radical zero-formula: no display math, no
   equations, no relational math (=, inequalities, arrows-as-implication), no figures;
   inline symbols at most as proper *names* (budget: a few, each defined in words in the
   same sentence) — the preface IS a picture painted in words. Physical-picture-first
   prose, not dry summary (物理图像清晰 — a vivid, insightful physical picture — is the
   primary quality bar; 物理图像 here means the *mental* picture of the physics,
   mechanism-level intuition, not literal drawings): every claim is carried by its WHY —
   the causal story, the competing effects, the reason the result is forced. Insight-dense:
   each paragraph must earn an "aha"; a sentence that states WHAT without transmitting WHY
   is a defect. Strict compression of Section I: zero claims not present there, every
   sentence traceable and load-bearing; no hedging, no citations, no novelty-selling.
   ~600–900 words, hard cap 2 typeset pages (checked mechanically in the built PDF). It
   carries the *reading contract*: a tiny table of the three layers and the competence each
   purchase buys (retell + explain-why / judge / rebuild) — a table is prose, not a formula.
   Placement: unnumbered front matter (`\chapter*{Preface}` or equivalent) between the
   title page and the table of contents. Success test (the insight test): a reader of the
   Preface alone can *retell* the result to an outsider and *explain the mechanism* — why
   it holds, what competes with what, where the tension resolves.
   Verification is the blind insight-test: the preface verifier receives ONLY the preface
   text at first — it must, from the words alone, retell the result and write out the
   mechanism as it understood it (why the result holds, what pushes what, where the tension
   resolves); only then does it open Section I and diff — insight gaps (claims stated
   without their why transmitted), mechanism misunderstandings the prose permitted, orphan
   claims, formula/relational-math leaks, contract violations, and page overrun become
   blocker/major findings.
   Rubric-wise the Preface folds into dimensions 1 (Self-containedness) and 7 (Pedagogical
   flow) — no new hard gate, no weight changes; the gates stay exactly G1–G6. The
   workflow's **Synthesis** stage (between Assemble and Typeset) automates both steps —
   Section I first, then the Preface compressed from it; the chapter is marked
   `synthesis:true` in CHAPTERS, so the per-chapter drafting pipeline skips it.

7. **Apply the professional typesetting.** Use **`references/preamble_lecture_notes.tex`**
   and **`references/typesetting_guide.md`**. The load-bearing move: **layer the look on
   top of finished content** — back up the plain preamble, then upgrade *only* the preamble
   (Palatino text+math, sans headings, colored left-barred theorem boxes, faded
   chapter-number openers, running headers, title page) while preserving **every
   environment name and macro name**. Chapters become publication-grade with zero edits.
   Wrap amsthm with `\tcolorboxenvironment`; never convert to `\newtcbtheorem` (changes the
   calling convention and breaks every chapter). If a compile breaks, fix the offending
   chapter construct — never "simplify" the design away. The workflow's **Typeset** phase
   (between Synthesis and Figures) automates exactly this discipline — back up the plain
   preamble, swap the professional one into a full sandbox copy, three-pass build,
   `pdftoppm`-render the title page / a chapter opener / a theorem page and *look*, only
   then apply live; the manual path above stays the fallback for by-hand runs.

8. **Figures.** Use **`references/figure_techniques.md`**. Two tracks: *if a human could
   draw it on a whiteboard from memory, it's TikZ; if it requires running code, it's a
   matplotlib PDF.* Twelve reusable archetypes: seven TikZ classics (network-with-cut,
   motif gallery, sign strip, function-with-roots, complex-plane contour, integer
   staircase, two-block schematic) plus five general-purpose ones (numbers-comparison
   figure, styled results table, pipeline/flowchart, 2-D phase/regime diagram,
   literature-map/positioning diagram) + a seeded matplotlib→PDF skeleton. PDF only. **Numbers-as-figures mandate:** every load-bearing
   quantity in `numbers.md` must *also* appear in at least one figure or professionally
   typeset table in the chapters — a bare inline numeral is never the only presentation of
   a key result. Run the visual-check loop (`references/scaffold/check_figure.sh`) on
   every figure: build a standalone, rasterize with `pdftoppm`, **actually look at the
   pixels**, fix, repeat.

9. **Referee gate + remediation.** Re-derive ground truth, build (`pdflatex ×3`), and have
   a strict referee score the rubric and check each hard gate — the dimensions, gates, and
   pass thresholds live in **`references/acceptance_rubric.md`**, the single source of
   truth (not restated here). Dispatch each blocker to a targeted fix (one chapter / one
   figure / one number — never wholesale). Loop until all hard gates are green and the
   score clears the threshold. Gates are the real exit condition; the score guards quality
   above them.

10. **Reproduce every number, finish, and tidy.** Re-run every cited script; confirm
   `numbers.md` ↔ chapters ↔ scripts all agree. When the notes cite, re-resolve the
   `citations.md` identifiers and confirm `\cite` keys ↔ ledger ↔ `refs.bib` agree (zero
   fabricated or unresolvable references — the widened gate G2). Do a final figure pass,
   fix any missing bibliography / undefined refs, and run the final clean three-pass build. Then run
    `clean.sh --yes` (shipped in `references/scaffold/`): whitelist housekeeping that removes
    LaTeX aux files, `_single_*` wrappers, render PNGs, and `typeset_sandbox/`, while keeping
    sources, `numbers.md`, `code/`, `figs/`, `preamble_plain_backup.tex`, and the final PDF.

## Load-bearing principles

- **General theorem first, example second.** State and prove each result at full
  generality, *then* illustrate. The example illustrates; it never replaces the theorem.
- **The notes are a compression telescope — three zoom levels of one story, written last.**
  Compression is intelligence: each layer is a lossy compression of the next, complete at
  its own resolution. The Preface (1–2 pages) buys *retell + explain-why* — its reader can
  retell the result to an outsider and explain the mechanism: why it holds, what competes
  with what, where the tension resolves; Section I
  (8–12 pages, PRL-style) buys *judge* — its reader alone can judge the paper's central
  claim; the body buys *rebuild* — every proof and number. The compression chain is
  strictly one-way: body → Section I → Preface, synthesized from the finished layer below,
  never from the plan.
- **One source of truth for numbers.** Every numeral comes from a single `numbers.md`
  generated by runnable code and cross-checked. The prettiest box around a wrong number is
  still wrong.
- **One source of truth for citations — and one home for positioning.** Every `\cite`
  resolves to a `citations.md` entry whose identifier was verified by an actual lookup;
  nothing is ever cited from model memory (a fabricated reference is a gate failure, the
  citation analogue of an invented number). Literature *positioning* — the result against
  the field, and these notes against existing expositions — lives only in the epilogue's
  "Context and positioning" section with its keyed literature-map figure; the Preface and
  Section I stay citation-free by design.
- **Key numbers get a visual home.** Every load-bearing quantity in `numbers.md` must also
  appear in at least one figure or professionally typeset table in the chapters; a bare
  inline numeral is never the only presentation of a key result. The referee files
  blockers for violations, scored under the Visualization dimension.
- **Typesetting is a non-invasive layer.** LaTeX separates naming from appearance: redefine
  how names render in the preamble and every call site inherits it. A ~15-minute preamble
  swap turned a rough draft into a published-looking book with the chapters' bytes
  unchanged.
- **Adversarial multi-lens verification.** Independent math / numeric / pedagogy reviewers
  per chapter catch what a single read misses; if a lens dies (transient error), re-run it
  rather than ignore it.
- **Slow re-derivation as a bug-finder.** Proving everything from scratch is itself the best
  error-finding pass on the source result — in the real run it caught a loose sign-step
  (verified in sympy) and a missing bibliography.

## Environment notes

- A TeX install may not be on PATH. Resolve the binary probe-style: `command -v pdflatex`,
  else `/Library/TeX/texbin/pdflatex` (macOS MacTeX), else
  `/usr/local/texlive/*/bin/*/pdflatex` (Linux/TeX Live). Prepend the resolved directory
  to PATH in every build script. `pdftoppm` ships with poppler (`poppler-utils` on Linux;
  `brew install poppler` on macOS).
- Paths containing `[` `]` **must be double-quoted in bash** (`cd "$PROJ"`, never `cd $PROJ`)
  or the brackets are read as a glob. Prefer absolute paths.

## Heavy multi-agent build

For the phase 3–10 build, adapt and launch **`references/build_workflow_template.js`** with
the **Workflow** tool (not plain node). Edit only its CONFIG block (paths, topic/audience,
standards, concepts, example spec, chapters, rubric, plus the optional `SKILLREF`,
`MODE`, and `BIB` knobs); the pipelined phase code
(scaffold → example ∥ literature → draft → 3-lens verify → assemble → synthesize →
typeset → figures → referee loop) is project-agnostic and runs unchanged. The stages
cover phases 3–10 **including phase 7**: Scaffold = 3, Example = 4 (with the parallel
Literature stage building phase 3's citations ledger), Draft + Verify = 5, Synthesis = 6,
Typeset = 7, Figures = 8, Referee = 9, with Assemble and the referee loop together
covering 10's reproduce-and-finish. Set `SKILLREF`
to this skill's root so Phase A adapts the shipped `references/scaffold/` templates and
the Typeset phase uses `references/preamble_lecture_notes.tex` directly, instead of
regenerating either from prose.

**No Workflow tool available?** Treat the file as an execution spec: run each `agent()`
prompt as a subagent in the stated order, honor the `parallel()` fan-outs, and respect the
referee loop bound (`MAX_REFEREE_ROUNDS`).

**Mode knob.** `MODE: 'light'` is a cheap first pass: one *combined*
math+numeric+pedagogy verification lens per chapter instead of three parallel lenses, a
single referee round, and no figure-review loop. Light never trims the numbers ground
truth (including the independent audit), the citations ledger and its audit (only the T3
claim-support spot-checks are full-mode-only), clean three-pass builds, the Synthesis
stage, or the Typeset phase — and its output is explicitly labeled "draft grade — rubric
compliance not claimed". The default, `'full'`, is the rubric-grade build.

**Literature knob.** `BIB: 'auto' | 'inherit' | 'discover' | 'off'` (default `auto`).
`inherit` builds the citations ledger only from the source's own bibliography; `discover`
additionally search-fills the load-bearing gaps (drafts with thin or no bibliography);
`auto` inherits when the source carries a usable bibliography, else discovers; `off`
disables the layer entirely (the notes then cite nothing — the pre-2.5 behavior). All
modes verify every entry by lookup and obey the anti-fabrication rule.

## Worked case study (the Mpemba run)

A terse ~11-page PRX paper, *"The Mpemba Effect as Topological Frustration,"* was expanded
into a **131-page** professionally typeset lecture note: clean three-pass build, **0 errors
/ 0 undefined refs**, all six hard gates green (the final referee scored 95/100; a short
remediation pass then closed the remaining gate blockers). The
non-degenerate running example was a **two-triangle, two-rung 6-state network** — a genuine
multi-edge cut with a cycle crossing it, explicitly *not* a single bridge — carried through
both an aligned (M=0) and a frustrated (M=2) energy assignment, plus a 4-state K₄ by-hand
forest enumeration. Roughly **70 agents over ~3.5 hours**. The two biggest steering inputs:
"the example must not be a single bridge" (forced the general example) and "use nicer,
professional typesetting" (the rough→polished leap, delivered as a non-invasive preamble
layer). (The original run also produced a `making_of.html` retrospective; it is not
shipped with this package.)
