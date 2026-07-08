---
name: paper2notes
description: Expand a terse research paper or dense notes into self-contained, professionally typeset lecture notes — full from-scratch proofs, a non-degenerate worked example carried through every chapter, code-verified numbers (every key number also shown in a figure or styled table), a lookup-verified bibliography with a literature-positioning epilogue section (inherited or search-discovered, never fabricated), and publication-grade LaTeX, gated by a 100-point acceptance rubric. Orchestrates a multi-agent build by spawning worker subprocesses; needs only shell + files + Python + TeX. Use when the user wants to turn a paper into lecture/teaching notes (讲义), make a dense result readable and self-contained, ask for a pedagogical expansion, or expand a draft into notes that also position its result in the literature. Not for quick summaries, standalone literature reviews, slides, posters, or submission polishing.
---

# paper2notes — Multi-Agent Lecture-Notes Build

You have loaded this skill: **you are the LEAD orchestrator.** You coordinate, bookkeep,
and dispatch; WORKER agents (fresh subprocesses you spawn) do all heavy work — drafting,
proving, reviewing, typesetting, refereeing. Do no drafting/proving/reviewing yourself.

The method: every load-bearing concept built from scratch, every theorem given a gap-free
proof, ONE non-degenerate worked example carried through every core chapter, every quoted
number traceable to runnable code (and also shown in a figure or styled table), every
citation traceable to a lookup-verified ledger (`citations.md` + `refs.bib` — the
literature analogue of `numbers.md`; positioning lives only in the epilogue's Context
section), the professional Palatino/tcolorbox look layered on at the end — all gated by a
strict referee against a 100-point rubric with six hard gates.

The deep material lives in `references/` next to this file (all agent-agnostic):

| File | What it gives you |
|---|---|
| `references/acceptance_rubric.md` | The definition of "done": 100 points / 8 dimensions / 6 hard gates |
| `references/typesetting_guide.md` | The professional look: layering discipline, package stack, theorem-box recipe |
| `references/preamble_lecture_notes.tex` | Compile-tested professional preamble, ready to swap in |
| `references/figure_techniques.md` | 12 figure archetypes + the visual-check loop + numbers→figures track |
| `references/scaffold/` | Verified templates: `master.tex`, `compile_one.sh`, `build_all.sh`, `contract_template.md`, `check_figure.sh`, `clean.sh` |
| `references/new_paper_checklist.md` | Walk this when pointing the method at a new paper |
| `references/build_workflow_template.js` | The Claude Code Workflow original — the reference spec this skill mirrors phase-by-phase |

---

## 0. Requirements

**Workers need:** shell, file read/write, Python with numpy/scipy (+ matplotlib), a TeX
install (`pdflatex`; `pdftoppm` from poppler). **Strongly recommended:** image viewing
(rendered PDF pages) for the typeset/figure/referee checks — see §7 fallbacks if absent.

If you cannot run two workers at once, everything still works: run the same workers
sequentially (`MAXPAR: 1`) — you lose wall-clock speed, not correctness or independence
(each worker is still a fresh context reading only its prompt + the disk).

## 1. Intake (first conversation with the user)

1. Resolve `SKILLDIR` = the absolute directory containing this SKILL.md, and
   `REFS = SKILLDIR/references`.
2. Ask the user for the source paper, the output directory `OUT/`, and anything missing
   from the Job Card (§2) — especially AUDIENCE, the non-degenerate example spec, the KEY
   CORRECTNESS TRAP, and the chapter plan. Walk `references/new_paper_checklist.md` with
   them. Draft the Job Card yourself from the paper where you can; confirm the
   judgment-call fields with the user.
3. Save the completed card as **`OUT/job_card.md`** — the ONE canonical location; every
   worker is pointed at it.
4. **Refuse to start the build while any `<FILL IN: …>` placeholder remains** — the same
   fail-fast rule the Workflow original enforces before spawning agents.
5. Choose `MODE: full` (rubric-gated) or `light` (cheap draft pass; §6) with the user,
   and the `BIB` mode (default `auto`; suggest `discover` for a draft with thin or no
   bibliography, `off` only if the user wants a citation-free document). Discovery and
   verification need network access from workers (keyless: arXiv API / Crossref /
   OpenAlex); without it, Phase B2 degrades to inherit-only and records the rest under
   `[Gaps]` — never from memory.

## 2. The Job Card

```markdown
# job_card.md   (canonical location: OUT/job_card.md)

## Knobs
MODE: full            # full | light   (§6)
BIB: auto             # auto | inherit | discover | off — the literature layer (§Phase B2).
                      # inherit = ledger from the source's own bibliography only;
                      # discover = also search-fill load-bearing gaps (drafts with thin/no
                      # bibliography); auto = inherit if the source has a usable
                      # bibliography, else discover; off = the notes cite nothing.
SKILL: <FILL IN: absolute path to this SKILL.md>
REFS: <FILL IN: absolute path to the skill's references/ directory>
MAXPAR: 4             # TOTAL workers in flight at any moment, across ALL overlapping
                      # fan-outs (1 = sequential fallback; see §4 scheduling rules)

## Paths
PAPER:   <FILL IN: absolute path to the terse source paper (.tex preferred)>
OUT:     <FILL IN: absolute path for the lecture-notes project>
CODE:    <FILL IN: absolute path to runnable scripts producing ground-truth numbers>
FIGS:    <FILL IN: absolute path to existing publication PDFs reusable as panels; or "none">
SOURCES: <FILL IN: comma-separated extra dense-notes files chapters may quote; or "none">
TEXBIN:  /Library/TeX/texbin   # TeX location hint. The scaffold scripts probe:
                               # command -v pdflatex → $TEXBIN (env var) →
                               # /Library/TeX/texbin → /usr/local/texlive/*/bin/*.
                               # Export TEXBIN=<this value> into every worker's env.

## Topic
TITLE:    <FILL IN>
AUTHOR:   <FILL IN>
AUDIENCE: <FILL IN: ONE sentence — exactly what the reader already knows. The most
           important tone knob: it calibrates built-from-scratch vs assumed.>
PALETTE:  navy=#1f3b73, mpred=#c0392b, teal=#16887b, gold=#b8860b, inkgray=#4a4a4a
          # keep these NAMES — they match the professional preamble and every archetype

## Standards (non-negotiable; every worker gets these; the referee enforces them)
1. SELF-CONTAINED — every load-bearing concept built from scratch with intuition + a tiny
   verification, never merely cited.
2. EVERY THEOREM FULLY EXPANDED — precise assumptions, physical intuition, then a gap-free
   proof stating WHERE each assumption is used. No "it can be shown" / "standard" /
   "sketch" on a load-bearing step.
3. GENERAL THEORY FIRST, EXAMPLE SECOND — full generality, then the running example.
4. PHYSICS-FIRST — the physical picture before the algebra; every result gets an
   operational consequence.
5. ONE SOURCE OF TRUTH FOR NUMBERS — every numeral quotes OUT/numbers.md and cites the
   producing script. Never invent a number.
6. FIGURES publication-grade and PDF-only; the palette above; bold panel letters; direct
   annotation of key quantities.
7. NUMBERS-AS-FIGURES — every load-bearing quantity in numbers.md must ALSO appear in at
   least one figure or professionally typeset table; a bare inline numeral is never the
   only presentation of a key result.
8. ONE SOURCE OF TRUTH FOR CITATIONS (when BIB ≠ off) — \cite only keys that exist in
   OUT/citations.md + OUT/refs.bib (every entry identifier-verified by an actual lookup).
   NEVER cite from memory: a missing source means the text stays uncited and the ledger's
   [Gaps] section records it. Positioning lives ONLY in the epilogue's "Context and
   positioning" section — never in the Preface or Section I; no novelty-selling or
   citation politics anywhere.

KEY CORRECTNESS TRAP: <FILL IN: the one convention/sign/index trap in YOUR paper that a
   careless derivation gets wrong. State the correct convention explicitly.>

## Concepts that must be built from scratch
<FILL IN: the named objects the paper cites but does not explain>

## Example spec (the linchpin)
<FILL IN: the running example, its NON-DEGENERACY requirement (name the cheap special case
 and forbid it), and exactly what the verifier must compute and CROSS-CHECK at least 3
 independent ways; plus the required parameter regimes/cases.>

## Chapters
| id | num | core | synthesis | positioning | title | source | covers | figures |
|----|-----|------|-----------|-------------|-------|--------|--------|---------|
<FILL IN: one row per chapter. core=yes ⇒ the running example MUST appear (hard gate).
 "covers" is the drafting brief — detailed; "source" cites paper sections/line ranges.
 Mark EXACTLY ONE chapter (usually ch0) synthesis=yes: it is EXCLUDED from the Phase C1
 drafting fan-out and written by Phase D2 after assembly; its "covers" field may stay one
 line ("Section I — see Phase D2"). The Preface is NOT a chapter row: it is unnumbered
 front matter that Phase D2 produces by compressing the finished Section I. Mark ONE
 chapter (usually the epilogue) positioning=yes: when BIB ≠ off its drafter also writes
 the "Context and positioning" section + the archetype-L literature map (§C1).>

## Acceptance
THRESHOLD: 90     # accepted = score ≥ THRESHOLD AND all 6 hard gates green AND 0 blockers
GATE6: <FILL IN: your paper's structural non-degeneracy invariant, e.g. "the running
        example's cut is multi-edge with a crossing cycle — never a single bridge">
```

The rubric itself is `references/acceptance_rubric.md`; only `GATE6` and `THRESHOLD` are
per-paper.

---

## 3. The two primitives

### 3.1 SPAWN — start a worker

A worker = a fresh agent context that receives ONE self-contained prompt and has shell +
file access. Materialize each prompt as a file under `OUT/_agents/`, then start the worker:

- **Codex CLI (you, most likely):** spawn non-interactive subprocesses:
  ```bash
  mkdir -p "$OUT/_agents"
  codex exec --full-auto "$(cat "$OUT/_agents/draft_ch2.prompt.md")" \
      > "$OUT/_agents/draft_ch2.stdout" 2>&1 &
  # ... spawn up to MAXPAR workers, then:
  wait
  ```
- **Any other framework:** its subagent/task API, or its own headless CLI (`claude -p`,
  `openclaw run`, an API call in a script) — any non-interactive "run this prompt with
  tool access" entry point.
- **No concurrency:** run the same prompts one after another (`MAXPAR: 1`).

**Every worker prompt MUST begin with the common header, with the three `<…>` placeholders
substituted by you with ABSOLUTE paths from the Job Card:**

```
You are a WORKER agent on the lecture-notes build described in <OUT>/job_card.md — read it
first, especially §Standards and the KEY CORRECTNESS TRAP. The method reference is
<SKILL> (consult only if your brief cites it). Environment rules: (a) resolve pdflatex
probe-style — command -v pdflatex, else $TEXBIN/pdflatex (TEXBIN=<TEXBIN>), else
/Library/TeX/texbin/pdflatex, else /usr/local/texlive/*/bin/*/pdflatex — the shipped
build scripts already do this; (b) double-quote ALL paths in shell commands ([ ] break
bash); (c) pdftoppm ships with poppler (poppler-utils on Linux, brew install poppler on
macOS). Work ONLY on the files this prompt assigns to you; other workers run concurrently
on other files. When finished, write your RESULT FILE exactly as specified, then stop.
Your chat output is discarded — only the result file and your file edits count.
```

### 3.2 COLLECT — result files instead of schema returns

Every worker writes exactly one result file under `OUT/_agents/`, at the exact filename its
prompt assigns (the full name table is in §4's phase briefs). **A result filename is never
reused across workers or rounds.** Fixed formats:

- **FINDINGS result** (reviewer lenses, audits, figure review) — one line per finding:
  `severity | kind | location | problem | fix`
  with `severity ∈ {blocker, major, minor}`, `kind ∈ {math, numeric, pedagogy, build,
  style}`; first line = a one-sentence summary; write `NO FINDINGS` if clean (never leave
  the file absent).
- **FIX result** (fixers, assembler): `applied: <n>` / `left: <what & why>` /
  `compiles: PASS|FAIL` / free-form notes.
- **SCORE result** (referee): the scorecard from `references/acceptance_rubric.md` §3 —
  8 dimension scores with notes, 6 hard-gate verdicts (true/false each), then a numbered
  BLOCKERS list (file + what + how), empty section allowed only as `BLOCKERS: none`.
- **TYPESET result:** `source: shipped|authored` / `sandboxCompiles:` / `liveApplied:` /
  `pagesChecked:` / notes on what the rendered pages showed.

**Failure handling:**

- A missing, empty, or malformed result file at a barrier means the worker died. Re-spawn
  it once with the same prompt.
- If it fails again: for a *reviewer lens or figure-reviewer*, record `LENS FAILED` in the
  state file and continue — but never silently treat a dead reviewer as "no findings";
  re-run it later if at all possible. For a *builder* (scaffold / drafter / fixer /
  appendices / assembler / synthesis writer / preface writer / literature-builder /
  repro), the phase cannot proceed — diagnose from its stdout/log before continuing.
- A well-formed FIX result reporting `compiles: FAIL` blocks its barrier exactly like a
  dead builder: re-dispatch the worker with the failing log excerpt appended to its prompt.
- The **referee is phase-blocking**: a twice-failed referee means the round did not happen —
  retry it or record NOT ACCEPTED; never apply the LENS-FAILED-and-continue rule to it.
  The **typesetter** is the one non-fatal builder (Phase E defines its failure path).

---

## 4. The phase plan (your dispatch schedule)

Mirrors the Workflow original phase-for-phase. **Fan-out** = spawn concurrently;
**barrier** = wait for all listed result files before proceeding.

**Scheduling rules.** `MAXPAR` bounds the TOTAL number of workers in flight at any moment,
across all overlapping fan-outs — every "concurrently" below is subject to that single cap
(at `MAXPAR: 1` the "three concurrent lenses" are simply three prompts run back-to-back).
**`build_all.sh` must never run concurrently with itself or with any other
compile-emitting worker** — it compiles the shared master with fixed aux/log/pdf names;
only `compile_one.sh` (unique per-chapter jobnames) is concurrency-safe. Update
`OUT/BUILD_STATE.md` after every barrier (format in §4.0).

### 4.0 State file — `OUT/BUILD_STATE.md`

```markdown
# BUILD_STATE — <TITLE>
A scaffold [ ]   B numbers [ ] audit [ ] repair [–]   B2 literature [ ] audit [ ] repair [–]
D assemble [ ]   D2 synth [ ] preface [ ]
C chapters: ch0 [draft|lenses|fixed]  ch1 [...]  (one line per chapter)
E typeset [ ]    F figures [ ]    G referee: round 0/3, score –, gates –, blockers –
## Dispatch log (append-only)
| when | worker id | target files | handle (PID/task id) | outcome/result file |
## Log (append-only: what finished, open issues, next dispatch)
```

**Dispatch records are mandatory:** append a dispatch-log row AT SPAWN TIME (before the
worker produces anything), and fill the outcome column at the barrier. A fresh lead
session resuming after context loss must first reconcile the dispatch log: any recorded
worker without an outcome may still be running — verify it exited (check the handle / the
stdout file's growth) or kill it BEFORE re-spawning a builder on the same target files;
two live workers on one file is the one unrecoverable state. Then resume from the first
unchecked box. The state file and result files are the only memory that counts — never
reconstruct progress from chat memory.

### Phase A — Scaffold (1 worker, barrier)

Spawn **scaffold** with: **the OUT freshness gate FIRST** — if `OUT` exists non-empty
without build markers (`job_card.md` / `BUILD_STATE.md` / `preamble.tex`), STOP and report;
never build into a pre-existing work folder (the build cleans `OUT` at the end). If the
operator explicitly pre-authorized a non-empty `OUT`, the very first action is the
protective snapshot `cd "OUT" && find . -type f | sed 's|^\./||' | sort > .preexisting_manifest`
— `clean.sh` treats every listed path as untouchable. Then: create `OUT/` project
structure; ADAPT the shipped templates from
`REFS/scaffold/` — `master.tex` (title/author; one `\input{chapters/<id>}` per Job-Card
chapter; **uncomment/add `\appendix` + `\input{chapters/appendices}` after the chapter
inputs** — the template ships these lines commented out; stub all chapter files AND
`chapters/appendices.tex` so the master compiles NOW), `compile_one.sh`, `build_all.sh`,
`check_figure.sh` and `clean.sh` (copy as-is), `contract_template.md` → `OUT/contract.md` filled in:
exact macro list (mirror the source paper's preamble), theorem environments, label
conventions (`ch:` `thm:` `eq:` `fig:`), the global sign/normalization conventions incl.
the KEY CORRECTNESS TRAP, the palette, the numbers-as-figures policy, **the figure-file
ownership rule (below)**, and the per-chapter table (id, title, proves, may-assume,
`[core]` flags). Author `OUT/preamble.tex` — the **plain stage-one preamble** (report
class; amsmath amssymb amsthm mathtools graphicx xcolor hyperref booktabs colortbl
enumitem tcolorbox tikz with libraries arrows.meta calc positioning
decorations.pathmorphing backgrounds fit patterns shapes.geometric plotmarks; theorem/
proposition/lemma/corollary/definition/example/remark numbered by chapter; the palette
`\definecolor`s with the Job-Card NAMES; a `keyresult` tcolorbox). Environment and macro
names are FROZEN here — the Phase E professional swap must need zero chapter edits.

**Figure-file ownership rule** (goes into `contract.md`; prevents concurrent drafters from
overwriting each other): every figure PDF and figure script a chapter worker creates is
prefixed with its chapter id — `figs/<id>_*.pdf`, `code/<id>_fig*.py`; the appendices
worker uses the prefix `app_`; the figure-fixer edits existing files in place and creates
nothing unprefixed.

Deliverable proof: `bash "OUT/build_all.sh"` PASS on the stub document (appendices stub
included and visible in the TOC). Result file: `_agents/scaffold.result.md` (FIX format).

### Phase B — Example & ground-truth numbers (sequential: B1 → B2 → B3)

- **B1 example-designer** (1 worker): write a verifier under `OUT/` (pure numpy/scipy)
  implementing the Job-Card example spec; **cross-check the key quantities ≥3 independent
  ways** (e.g. spectral vs algebraic vs brute-force enumeration, agreement ~1e-9); iterate
  until the required regimes/cases are found; write `OUT/numbers.md` — every entry cites
  its producing script, 4–6 sig figs, named sections. Result: `_agents/example.result.md`
  (FIX format).
- **B2 independent auditor** (1 worker, fresh context — this is where multi-agent buys
  real independence): read `OUT/numbers.md` ONLY (not B1's code, until after your own
  numbers exist); re-derive the headline case with your OWN new script from the stated
  parameters; brute-force one structural/combinatorial quantity; check the non-degeneracy
  requirement holds; then diff. Severity calibration: **any confirmed numeric mismatch,
  failed cross-check, or violated structural requirement is a BLOCKER.** Result:
  `_agents/audit_B.result.md` (FINDINGS format; `NO FINDINGS` allowed).
- **B3 repairer** (only if B2 found blockers/majors; 1 worker): fix verifier + regenerate
  `numbers.md` until both scripts agree. Result: `_agents/repair_B.result.md` (FIX
  format). After a repair, re-run B2 as a fresh audit (result:
  `_agents/audit_B_r2.result.md`). **No chapter is drafted while the audit has open
  blockers** — bad ground truth poisons everything downstream.

### Phase B2 — Literature & citations ledger (skipped when `BIB: off`; may run ∥ Phase B)

The literature analogue of Phase B: both ground truths exist before any drafting. May run
concurrently with Phase B under the MAXPAR cap (they touch disjoint files); sequential is
equally correct.

- **L1 literature-builder** (1 worker): build `OUT/refs.bib` + `OUT/citations.md`.
  Resolve the mode (`auto` → inherit if `PAPER` carries a usable bibliography —
  `\bibliography` line, a `.bib`/`.bbl` next to it, or `\bibitem` entries — else
  discover; record the resolved mode in the ledger header). INHERIT: carry over the
  load-bearing subset of the source's own bibliography. DISCOVER: additionally derive
  search targets from the Job-Card concepts (canonical source + one modern treatment
  each), the paper's central claims (nearest prior + parallel works, for positioning),
  and existing expositions of the same material; search via the keyless APIs (arXiv
  Atom API, Crossref `api.crossref.org/works`, OpenAlex `api.openalex.org/works`) or any
  installed literature tools. VERIFY EVERY ENTRY (all modes): identifier resolves by an
  actual lookup (T1), metadata matches (T2); in full mode, T3 claim-support on the
  positioning-critical entries (read the abstract; confirm the assigned role).
  `citations.md` sections: `[Header]` (resolved mode, search targets), `[Entries]`
  (key | identifier | tier | one-line role | where used), `[Positioning]` (UPSTREAM /
  PARALLEL / DOWNSTREAM-OPEN / EXPOSITIONS, every item keyed — the epilogue's inputs),
  `[Gaps]` (wanted-but-unverifiable; the text stays uncited there — NEVER fill a gap
  from memory, including when there is no network access). Do NOT wire the master's
  bibliography hook (the Phase D assembler does). Result: `_agents/literature.result.md`
  (FIX format).
- **L2 independent citation auditor** (1 worker, fresh context): with its OWN fresh
  lookups, re-resolve EVERY identifier, re-check metadata vs the BibTeX, cross-check
  ledger ↔ bib key sets (no orphans, no duplicates); full mode: T3 spot-check the
  `[Positioning]` roles. A fabricated/unresolvable reference, metadata mismatch, key
  mismatch, or unsupported positioning role is a BLOCKER. Result:
  `_agents/audit_L.result.md` (FINDINGS format; `NO FINDINGS` allowed).
- **L3 repairer** (only if L2 found blockers/majors): fix ledger + bib (move anything
  unverifiable to `[Gaps]`), re-verify by fresh lookups. Result:
  `_agents/repair_L.result.md` (FIX format). **No chapter is drafted while the citation
  audit has open blockers** — fabricated references poison every chapter that cites.

### Phase C — Chapters: draft ∥ → verify (3 lenses ∥) → fix (per chapter)

Once `numbers.md` (and, when `BIB ≠ off`, `citations.md`) is frozen, chapters are
independent given `contract.md` + the ground-truth files.

- **C1 drafting fan-out:** spawn one **drafter** per chapter — EXCEPT the chapter marked
  `synthesis=yes` in the Job Card, which stays a scaffold stub until Phase D2 writes it.
  Each drafter owns exactly
  `OUT/chapters/<id>.tex` plus its own-prefixed figure files (`figs/<id>_*`,
  `code/<id>_fig*`): full lecture-note prose (intuition before formalism, every symbol
  defined at first use, full proofs in the main text, general theorem before example), the
  chapter's Job-Card `covers` brief, the running example with ACTUAL `numbers.md` values
  if `core=yes`, figures per `REFS/figure_techniques.md` (TikZ if whiteboard-drawable,
  else matplotlib→PDF; check each with `bash "OUT/check_figure.sh"` and LOOK at the PNG);
  `\cite` only keys present in `OUT/citations.md` (Standards item 8 — a missing source
  means no citation, not an invented one). The `positioning=yes` drafter (when
  `BIB ≠ off`) additionally writes the **"Context and positioning" section**: (i) the
  RESULT vs the research literature — builds-on / sits-beside / adds, every claim about a
  paper cited from the ledger's `[Positioning]` data; (ii) THESE NOTES vs existing
  expositions and what they add; plus the archetype-L literature-map figure
  (`REFS/figure_techniques.md` §1.12), nodes keyed to `refs.bib` — stated plainly, no
  novelty-selling, no citation politics.
  Must self-check `bash "OUT/compile_one.sh" "OUT/chapters/<id>.tex"` to PASS
  (concurrency-safe by design — unique per-chapter jobnames; single-pass compiles show
  `\cite` as `[?]` — the full Phase D build settles them). Result:
  `_agents/draft_<id>.result.md` (FIX format).
- **C2 verification fan-out, per drafted chapter:** spawn THREE lens workers (the core
  adversarial step — never merge them in full mode):
  - **math lens** — check EVERY derivation and proof step: assumptions stated AND used;
    no gaps or "it can be shown" on load-bearing steps; the KEY CORRECTNESS TRAP exactly
    right. Default to skepticism: a plausible-looking step that is not actually justified
    IS a finding. Re-derive key steps independently (sympy/scratch) rather than nodding
    along.
  - **numeric lens** — extract every numeral/vector/claim; check VERBATIM against
    `OUT/numbers.md`; re-run the producing scripts for headline values; flag mismatches,
    untraceable numbers, wrong signs (expected vs found); when `BIB ≠ off`, also check
    every `\cite` key against `citations.md`/`refs.bib` — an unknown or memory-invented
    key is a blocker.
  - **pedagogy lens** — read as the Job-Card AUDIENCE: used-before-defined, each Job-Card
    concept genuinely built from scratch (not cited), intuition before algebra, physical
    motivation, general-before-example, any point a student stalls.
  Results: `_agents/verify_<id>_{math,num,ped}.result.md` (FINDINGS format).
- **C3 fixer, per chapter (after its three lens files exist):** one worker owning
  `chapters/<id>.tex` (+ that chapter's prefixed figure files); apply every blocker and
  major (judgment on minors), never drop a finding without recording why; recompile via
  `compile_one.sh` to PASS. Result: `_agents/fix_<id>.result.md` (FIX format).

**Scheduling note:** the original pipelines these stages (chapter k verifying while k+1
drafts). Reproduce that if spawning is cheap — dispatch C2 for a chapter the moment its C1
result lands, C3 the moment its three lens files land, all under the single MAXPAR cap. A
simple waves schedule (all drafts → all lenses → all fixes) is also acceptable; it only
costs wall-clock time.

### Phase D — Appendices + assembly (2 workers, sequential)

- **appendices worker:** write `chapters/appendices.tex` — (A) full proofs of everything
  chapters forward-referenced; (B) a one-page operational checklist for running the method
  on a NEW instance; (C) a formula sheet of boxed key results; (D) the number→script
  traceability table. Figure files prefixed `app_`. Self-check via `compile_one.sh`.
  Result: `_agents/appendices.result.md` (FIX format).
- **assembler** (after the barrier): drive `bash "OUT/build_all.sh"` to a CLEAN three-pass
  build of the whole document: undefined refs, duplicate labels, notation drift vs
  `contract.md`, figure paths (copy reused PDFs into `OUT/figs/`), TOC — **confirm the
  appendices actually appear in the built PDF and its TOC**. When `BIB ≠ off`: **wire the
  bibliography** — refs.bib next to the master, uncomment/add the
  `\bibliographystyle{unsrt}` + `\bibliography{refs}` hook lines, and drive the
  pdflatex/bibtex/pdflatex ×2 cycle (`build_all.sh` auto-detects the uncommented line) to
  ZERO undefined citations; a `\cite` key missing from the ledger is a chapter defect
  (fix or drop the cite) — never invent a bib entry to silence it. Never "simplify"
  `preamble.tex` to dodge an error — fix the offending chapter construct. Result:
  `_agents/assemble.result.md` (FIX format, incl. final page count).

### Phase D2 — Synthesis (Section I + Preface; two writer→verifier→fixer passes, barriers)

Runs AFTER the assemble barrier and BEFORE Phase E: Section I is written about the
FINISHED book — it summarizes facts on disk, never plans — and the Preface is written
LAST of all, by compressing the finished Section I (the compression chain is strictly
one-way: body → Section I → Preface). Spawn **synthesis writer**
owning exactly the synthesis chapter file `chapters/<id>.tex` (the Job-Card row marked
`synthesis=yes`, usually ch0) plus its own-prefixed figure files. Before writing a word
it MUST read every drafted chapter file, `OUT/contract.md`, and the section headers of
`OUT/numbers.md`. Its brief IS the design spec — embed this in the prompt:

> Section I is the notes' FIRST chapter: a PRL-style standalone article that replaces any
> prologue. Physics-first storytelling; the FIRST paragraph answers why-it-matters;
> intuition and "what is the physics behind this" throughout. Every major theorem of the
> whole notes appears as a FORMAL STATEMENT — precise assumptions + conclusion, a real
> theorem environment, NO proof, no mechanism footnote — embedded at the story's
> load-bearing points, so the COMPLETE LOGICAL CHAIN (what implies what, via which
> assumption) is visible at a glance. Objects pay only a working-definition tax: 1–2
> lines, precise enough to parse the formal statement, plus a pointer to the rigorous
> definition in the body. Proofs, proof-sketch levers, and NUMBERS stay in the body
> chapters. Exactly two figures: (1) a theorem-dependency DAG whose nodes carry the
> section numbers where the proofs/details live; (2) ONE no-numbers phenomenon/mechanism
> story schematic — numeric figures stay in the body. Provide reader-type reading routes
> (e.g. user / verifier / teacher paths). Length: 8–12 pages for a ~100–130-page note;
> scale with content, one-sitting readable. FORBIDDEN GENES: novelty-selling tone
> ("first ever", breakthrough talk), citation politics, and compression pain ("it can be
> shown"). SUCCESS TEST (the D-test): a reader of Section I ALONE can say "I believe /
> don't believe the paper's central claim, because …" — judgment powered by the logical
> chain, not by proof details or numbers.

Self-check via `bash "OUT/compile_one.sh" "OUT/chapters/<id>.tex"` to PASS. Result:
`_agents/synthesis.result.md` (FIX format).

**Barrier**, then spawn one adversarial **synthesis verifier** (fresh context; the §3.2
reviewer failure rules apply — never silently treat a dead verifier as "no findings").
It runs a D-test proxy checklist: (a) the first paragraph answers why-it-matters;
(b) every major theorem of the notes appears as a formal statement — assumptions +
conclusion, real theorem environment, proof-free, footnote-free; (c) the logical chain is
complete and explicit — no orphan theorems, no unstated assumptions; (d) every symbol in
a formal statement is parseable from the working definitions given; (e) each working
definition points to its rigorous body definition; (f) no numbers, no proofs, no
forbidden genes; (g) the DAG's section tags match where the proofs actually live;
(h) verdict: could a reader of this chapter ALONE judge the paper's central claim?
Result: `_agents/verify_synth.result.md` (FINDINGS format; `NO FINDINGS` allowed).

If findings exist, spawn a **synthesis fixer** on the same chapter file — result:
`_agents/synthfix.result.md` (FIX format). At the barrier dispatch exactly ONE
`build_all.sh` run (fixers never run it themselves, per the §4 scheduling rules), so the
Preface step starts from a clean full build that includes the finished Section I.

**Preface step (last of all).** Then spawn the **preface writer**, owner of
`OUT/preface.tex` AND the master's front-matter hook: an unnumbered
`\chapter*{Preface}`-style chapter, `\input` into `master.tex` between the title page and
`\tableofcontents` (no other worker touches `master.tex` at this step). Before writing a
word it reads ONLY the finished Section I chapter file and `OUT/contract.md` — nothing
else. Its brief IS the preface design spec — embed this in the prompt:

> The notes form a COMPRESSION TELESCOPE — three zoom levels of ONE story, each a lossy
> compression of the next, each complete at its own resolution. Layer 1, the PREFACE
> (1–2 pages): a reader can RETELL the result to an outsider AND EXPLAIN THE MECHANISM —
> why it holds, what competes with what, where the tension resolves (the INSIGHT TEST:
> retell + explain-why). Layer 2, Section I (8–12 pages): the reader can JUDGE the
> central claim (the D-test). Layer 3, the body: the reader can REBUILD every proof and
> number. Rules, all enforceable: RADICAL ZERO-FORMULA — no display math, no equations,
> no relational math (=, inequalities, arrows-as-implication) anywhere; inline math
> symbols at most as proper NAMES (budget: a few, each defined in words in the same
> sentence); no figures either — the preface IS a picture painted in words.
> PHYSICAL-PICTURE-FIRST PROSE, not dry summary: the MENTAL picture of the physics —
> mechanism-level intuition, not literal drawings — carries every claim; each claim
> travels with its WHY (the causal story, the competing effects, the reason the result is
> forced); each paragraph must earn an "aha"; a sentence that states WHAT without
> transmitting WHY is a defect. A vivid, insightful physical picture is the primary
> quality bar. STRICT COMPRESSION OF SECTION I: zero claims not present in Section I;
> every sentence traceable to it; every sentence load-bearing (if deleting it loses
> nothing, it goes). No hedging, no citations, no novelty-selling. ~600–900 words, HARD
> CAP 2 typeset pages — check mechanically in the built PDF. Include the READING
> CONTRACT: a tiny table of the three layers and what competence each purchases
> (retell + explain-why / judge / rebuild) — a table is prose, not a formula.

Self-check: exactly ONE `bash "OUT/build_all.sh"` run at its barrier (the writer is the
only worker in flight at this step, so the §4 single-writer compile rule is respected);
confirm the Preface lands between the title page and the TOC and fits 2 typeset pages.
Result: `_agents/preface.result.md` (FIX format).

**Barrier**, then spawn the blind **insight-test verifier** (fresh context; the §3.2
reviewer failure rules apply). The protocol order IS the test: at first it receives ONLY
the preface text — from the words alone it must (1) retell the result and (2) write out
the MECHANISM as it understood it: why the result holds, what pushes what, where the
tension resolves. ONLY THEN may it open Section I and diff: insight gaps (claims stated
without their why transmitted), mechanism misunderstandings the prose permitted, orphan
claims absent from Section I, formula/relational-math leaks, reading-contract violations,
page overrun. Failures become blocker/major findings. Result:
`_agents/verify_preface.result.md` (FINDINGS format; `NO FINDINGS` allowed).

If findings exist, spawn a **preface fixer** on `preface.tex` (+ the front-matter hook) —
result: `_agents/preffix.result.md` (FIX format). At the barrier dispatch exactly ONE
`build_all.sh` run (fixers never run it themselves), so Phase E starts from a clean full
build that includes Section I and the Preface. Rubric note: the Phase G referee judges
Section I AND the Preface inside the EXISTING dimensions 1 (Self-containedness) and 7
(Pedagogical flow) — violations cost points there and may be filed as blockers; there is
no seventh hard gate and no weight change; gates stay exactly G1–G6.

### Phase E — Professional typesetting layer (1 worker, barrier)

Spawn **typesetter** implementing `REFS/typesetting_guide.md`'s discipline exactly:
1. `cp OUT/preamble.tex OUT/preamble_plain_backup.tex` (keep forever).
2. Take the shipped `REFS/preamble_lecture_notes.tex`; adapt ONLY its marked customization
   points (subtitle hook, paper-specific macros) so every macro/environment name the
   chapters use survives unchanged. Never convert to `\newtcbtheorem`.
3. Sandbox: copy the full project to `OUT/typeset_sandbox/`, swap the preamble THERE,
   three-pass build; on failure fix the offending chapter construct, never downgrade the
   design.
4. LOOK: `pdftoppm -png -r 110` the title page, a chapter opener, a theorem-heavy page —
   and view them (title rules/fonts; big faded chapter number; colored left-bar boxes:
   navy results / teal definitions / gold examples / gray remarks; running headers).
5. Only if clean: apply live, rebuild clean, re-render to confirm.
Result: `_agents/typeset.result.md` (TYPESET format). **A failed typeset is non-fatal:**
log it, keep the plain preamble (backup = design of record), continue, and surface it in
the final report — but retry before Phase G.

### Phase F — Figure visual pass (full mode only; 1–2 workers)

Spawn **figure-reviewer**: read the compiled PDF's pages as images and judge EVERY figure
at top-journal standard — correct vs text and `numbers.md`, legible, bold panel letters,
direct annotation, no overlap/clipping. Also audit the **numbers-as-figures mandate**:
walk `numbers.md`, confirm every load-bearing quantity appears in some figure or styled
table; file a finding per violation. Result: `_agents/figreview.result.md` (FINDINGS
format). If findings exist, spawn **figure-fixer** (edits the flagged `chapters/*.tex`
and existing figure files in place, rebuilds via ONE `build_all.sh` run, re-renders the
changed pages to confirm). Result: `_agents/figfix.result.md` (FIX format).

### Phase G — Referee gate (bounded loop: ≤3 rounds full, 1 light)

Per round `N` (1, 2, 3):
1. Spawn **referee** (fresh context; the strictest worker): score
   `references/acceptance_rubric.md` — all 8 dimensions with notes, all 6 hard gates
   honestly (Gate 6 = the Job-Card GATE6 wording; Gate 2 is the WIDENED ground-truth
   gate: numbers vs `numbers.md` AND, wherever the notes cite, every `\cite` resolving to
   a verified `citations.md` entry — spot-re-resolve 2–3 identifiers by an actual lookup;
   a fabricated or unresolvable reference fails the gate), a concrete blocker list. Must
   re-derive ground truth (re-run verifier + audit scripts vs `numbers.md`), run
   `build_all.sh`, skim rendered pages, verify: every theorem fully proved, no
   load-bearing concept merely cited, the running example in every `core` chapter, the
   structural invariant explicit, numbers-as-figures satisfied (violations = blockers
   under the Visualization dimension — scoring pressure, NOT a seventh gate). When
   `BIB ≠ off`, also evaluate the `positioning=yes` chapter's **Context and positioning**
   section (the document's ONLY positioning home; Preface and Section I stay
   citation-free): both positionings present (result vs literature, notes vs
   expositions), every claim about a paper cited, the literature-map figure keyed to
   `refs.bib`, no selling/politics — violations scored under dimensions 5 and 7 and
   filed as blockers, NOT a seventh gate. Result:
   `_agents/referee_r<N>.result.md` (SCORE format).
2. Check: **accepted = all 6 gates green AND score ≥ THRESHOLD AND zero blockers.**
   Accepted → Phase H. Out of rounds → record NOT ACCEPTED with outstanding blockers in
   `BUILD_STATE.md`; never silently claim success.
3. Otherwise dispatch fixes:
   - Blockers listed → group them by chapter file, spawn one **blocker-fixer** per file
     (they edit disjoint files). Each fixer fixes properly (not superficially) and
     self-checks ONLY via `compile_one.sh` on its own file. Results:
     `_agents/blockfix_r<N>_<id>.result.md` (FIX format).
   - **Zero blockers listed but acceptance still failed** (score below THRESHOLD or a red
     gate): spawn ONE fixer targeting the three lowest-scoring rubric dimensions, guided
     by the referee's dimension notes. Result: `_agents/dimfix_r<N>.result.md`.
   - At the fan-out barrier, dispatch exactly one `build_all.sh` run (a tiny worker or
     the next referee's mandated build) — fixers themselves never run it.
   Then next round.

### Phase H — Final reproduction pass (1 worker)

Re-run every script cited in `numbers.md`; confirm script ↔ numbers.md ↔ chapters agree.
When the notes cite: re-resolve the `citations.md` identifiers and confirm `\cite` keys ↔
ledger ↔ `refs.bib` agree (zero fabricated or unresolvable references — widened Gate 2).
Final `build_all.sh`: clean, zero undefined refs/citations. Then tidy: `bash "OUT/clean.sh" --yes`
(whitelist housekeeping — removes LaTeX aux, `_single_*` wrappers, root render PNGs,
`typeset_sandbox/`; keeps sources, `numbers.md`, `citations.md`, `refs.bib`, `code/`,
`figs/`, the backup preamble, the final PDF; if the script is missing, skip — never
improvise deletions). Result:
`_agents/repro.result.md` (FIX format). Then write the final report into `BUILD_STATE.md`
AND tell the user: mode, accepted verdict, final score + gates, typeset status
(professional vs plain), page count, PDF path, and any human-delegated checks (§7).

---

## 5. Environment notes (already baked into the §3.1 worker header)

- TeX resolution is probe-style and the shipped `references/scaffold/` scripts implement
  it, including the `$TEXBIN` env-var step: `command -v pdflatex` → `$TEXBIN/pdflatex` →
  `/Library/TeX/texbin/pdflatex` (macOS MacTeX) → glob `/usr/local/texlive/*/bin/*/
  pdflatex` (Linux TeX Live). Export `TEXBIN` from the Job Card when spawning workers.
  `pdftoppm` ships with poppler (`poppler-utils` on Linux, `brew install poppler` on
  macOS).
- Paths containing `[` `]` MUST be double-quoted in bash; prefer absolute paths.
- Missing professional fonts (`newpx`, `tgheros`): fall back to `libertinus`, else
  `lmodern` per the preamble's documented fallbacks — never abandon the design over a font.

## 6. Light mode (`MODE: light`)

Cheap first pass for early iteration. Trims: the three C2 lenses collapse into ONE
combined math+numeric+pedagogy worker per chapter (result:
`_agents/verify_<id>_all.result.md`); a single referee round; Phase F skipped; Phase B2's
T3 claim-support spot-checks. **Never trims:** Phase B including the independent audit,
Phase B2's ledger build + T1/T2 audit (fabricated references poison everything, in light
mode too), Phase D2 (Synthesis — Section I + Preface, including both verifiers), clean
three-pass builds, or Phase E.
Output is explicitly **draft grade — rubric compliance not claimed**; label it so in the
final report.

## 7. Fallbacks

- **No image viewing in workers:** the visual gates (E4, F, referee's page skim) cannot be
  self-certified. Degrade explicitly: produce the PNGs anyway (`check_figure.sh`,
  `pdftoppm`), hand the paths to the human with a checklist of what to look for, and mark
  those items HUMAN-DELEGATED in `BUILD_STATE.md` — never green-lit by a blind agent.
- **Very weak worker models:** keep drafters, math lenses, ALL fixers, and the referee on
  your strongest model; the numeric and pedagogy lenses (and the final build check)
  tolerate cheaper ones — this mirrors the original's effort tiers.
- **A lens returns `NO FINDINGS` twice consecutively across chapters:** suspicious.
  Re-spawn with: "find the three worst things in this chapter even if minor; calibrate
  against the rubric's 100-point descriptions."
- **Lead context overflow:** everything needed to resume is in `OUT/BUILD_STATE.md`
  (including the dispatch log — reconcile it first, §4.0) + `_agents/` result files +
  `OUT/job_card.md`. A fresh session reads those and continues dispatching.

---

*Provenance: framework-neutral port of the paper2notes Claude Code skill (v2.5.0,
github.com/Shiling42/paper2notes); the phase plan mirrors
`references/build_workflow_template.js` one-for-one (Scaffold, Example+audit ∥
Literature+audit, Draft/3-lens-Verify/Fix, Assemble, Synthesis (Section I + Preface),
Typeset, Figures, Referee-loop, Final). The method was
distilled from a real run that expanded a terse ~11-page PRX paper into a 131-page
professionally typeset lecture note (clean build, all six hard gates green, referee
95/100, ~70 agents / ~3.5 h).*
