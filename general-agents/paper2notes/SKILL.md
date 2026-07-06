---
name: paper2notes
description: Expand a terse research paper or dense notes into self-contained, professionally typeset lecture notes — full from-scratch proofs, a non-degenerate worked example carried through every chapter, code-verified numbers (every key number also shown in a figure or styled table), and publication-grade LaTeX, gated by a 100-point acceptance rubric. Orchestrates a multi-agent build by spawning worker subprocesses; needs only shell + files + Python + TeX. Use when the user wants to turn a paper into lecture/teaching notes (讲义), make a dense result readable and self-contained, or asks for a pedagogical expansion. Not for quick summaries, literature reviews, slides, posters, or submission polishing.
---

# paper2notes — Multi-Agent Lecture-Notes Build

You have loaded this skill: **you are the LEAD orchestrator.** You coordinate, bookkeep,
and dispatch; WORKER agents (fresh subprocesses you spawn) do all heavy work — drafting,
proving, reviewing, typesetting, refereeing. Do no drafting/proving/reviewing yourself.

The method: every load-bearing concept built from scratch, every theorem given a gap-free
proof, ONE non-degenerate worked example carried through every core chapter, every quoted
number traceable to runnable code (and also shown in a figure or styled table), the
professional Palatino/tcolorbox look layered on at the end — all gated by a strict referee
against a 100-point rubric with six hard gates.

The deep material lives in `references/` next to this file (all agent-agnostic):

| File | What it gives you |
|---|---|
| `references/acceptance_rubric.md` | The definition of "done": 100 points / 8 dimensions / 6 hard gates |
| `references/typesetting_guide.md` | The professional look: layering discipline, package stack, theorem-box recipe |
| `references/preamble_lecture_notes.tex` | Compile-tested professional preamble, ready to swap in |
| `references/figure_techniques.md` | 11 figure archetypes + the visual-check loop + numbers→figures track |
| `references/scaffold/` | Verified templates: `master.tex`, `compile_one.sh`, `build_all.sh`, `contract_template.md`, `check_figure.sh` |
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
5. Choose `MODE: full` (rubric-gated) or `light` (cheap draft pass; §6) with the user.

## 2. The Job Card

```markdown
# job_card.md   (canonical location: OUT/job_card.md)

## Knobs
MODE: full            # full | light   (§6)
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

KEY CORRECTNESS TRAP: <FILL IN: the one convention/sign/index trap in YOUR paper that a
   careless derivation gets wrong. State the correct convention explicitly.>

## Concepts that must be built from scratch
<FILL IN: the named objects the paper cites but does not explain>

## Example spec (the linchpin)
<FILL IN: the running example, its NON-DEGENERACY requirement (name the cheap special case
 and forbid it), and exactly what the verifier must compute and CROSS-CHECK at least 3
 independent ways; plus the required parameter regimes/cases.>

## Chapters
| id | num | core | title | source | covers | figures |
|----|-----|------|-------|--------|--------|---------|
<FILL IN: one row per chapter. core=yes ⇒ the running example MUST appear (hard gate).
 "covers" is the drafting brief — detailed; "source" cites paper sections/line ranges.>

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
  appendices / assembler / repro), the phase cannot proceed — diagnose from its stdout/log
  before continuing.
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
A scaffold [ ]   B numbers [ ] audit [ ] repair [–]   D assemble [ ]
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

Spawn **scaffold** with: create `OUT/` project structure; ADAPT the shipped templates from
`REFS/scaffold/` — `master.tex` (title/author; one `\input{chapters/<id>}` per Job-Card
chapter; **uncomment/add `\appendix` + `\input{chapters/appendices}` after the chapter
inputs** — the template ships these lines commented out; stub all chapter files AND
`chapters/appendices.tex` so the master compiles NOW), `compile_one.sh`, `build_all.sh`,
`check_figure.sh` (copy as-is), `contract_template.md` → `OUT/contract.md` filled in:
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

### Phase C — Chapters: draft ∥ → verify (3 lenses ∥) → fix (per chapter)

Once `numbers.md` is frozen, chapters are independent given `contract.md` + `numbers.md`.

- **C1 drafting fan-out:** spawn one **drafter** per chapter. Each drafter owns exactly
  `OUT/chapters/<id>.tex` plus its own-prefixed figure files (`figs/<id>_*`,
  `code/<id>_fig*`): full lecture-note prose (intuition before formalism, every symbol
  defined at first use, full proofs in the main text, general theorem before example), the
  chapter's Job-Card `covers` brief, the running example with ACTUAL `numbers.md` values
  if `core=yes`, figures per `REFS/figure_techniques.md` (TikZ if whiteboard-drawable,
  else matplotlib→PDF; check each with `bash "OUT/check_figure.sh"` and LOOK at the PNG).
  Must self-check `bash "OUT/compile_one.sh" "OUT/chapters/<id>.tex"` to PASS
  (concurrency-safe by design — unique per-chapter jobnames). Result:
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
    untraceable numbers, wrong signs (expected vs found).
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
  appendices actually appear in the built PDF and its TOC**. Never "simplify"
  `preamble.tex` to dodge an error — fix the offending chapter construct. Result:
  `_agents/assemble.result.md` (FIX format, incl. final page count).

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
   honestly (Gate 6 = the Job-Card GATE6 wording), a concrete blocker list. Must
   re-derive ground truth (re-run verifier + audit scripts vs `numbers.md`), run
   `build_all.sh`, skim rendered pages, verify: every theorem fully proved, no
   load-bearing concept merely cited, the running example in every `core` chapter, the
   structural invariant explicit, numbers-as-figures satisfied (violations = blockers
   under the Visualization dimension — scoring pressure, NOT a seventh gate). Result:
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
Final `build_all.sh`: clean, zero undefined refs/citations. Result:
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
`_agents/verify_<id>_all.result.md`); a single referee round; Phase F skipped. **Never
trims:** Phase B including the independent audit, clean three-pass builds, or Phase E.
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

*Provenance: framework-neutral port of the paper2notes Claude Code skill (v2.1.1,
github.com/Shiling42/paper2notes); the phase plan mirrors
`references/build_workflow_template.js` one-for-one (Scaffold, Example+audit, Draft/
3-lens-Verify/Fix, Assemble, Typeset, Figures, Referee-loop, Final). The method was
distilled from a real run that expanded a terse ~11-page PRX paper into a 131-page
professionally typeset lecture note (clean build, all six hard gates green, referee
95/100, ~70 agents / ~3.5 h).*
