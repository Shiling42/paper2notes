# Changelog

## 2.5.1 — 2026-07-08 (URGENT FIX)

**clean.sh could delete pre-existing files when OUT pointed at a non-empty directory** — its patterns (`*.log`, `*.out`, `*.png`, …) matched by extension alone, so unrelated logs, outputs, and images in the folder were removed. Fixed with provenance-aware deletion, three independent layers: (1) **pair rule for LaTeX aux** — `X.log`/`X.aux`/… deleted only if a sibling `X.tex` exists; (2) **pair rule for renders** — root PNGs deleted only if a matching `.pdf`/`.tex` stem exists; (3) **`.preexisting_manifest`** — the scaffold snapshots any pre-existing files before touching a non-empty OUT, and clean.sh treats every listed path as untouchable. Upstream prevention: the scaffold now refuses a non-empty OUT without build markers unless explicitly pre-authorized (both editions), and the checklist documents the fresh-OUT rule. If you were affected: recover via Dropbox "Deleted files" / Time Machine / git; the `--yes` run printed every removed path to its log.

## 2.5.0 — 2026-07-07

**The literature layer: citations get the numbers treatment.** A new **Literature phase** (parallel with Example) builds the second ground-truth pair `refs.bib` + `citations.md` — every entry identifier-verified by an actual lookup (T1 resolves / T2 metadata / T3 claim-support on positioning-critical entries, full mode), with `[Positioning]` (upstream / parallel / downstream / expositions) and `[Gaps]` sections, then independently audited before any drafting. Knob: `BIB: auto | inherit | discover | off` — `inherit` carries over the source's own bibliography; `discover` search-fills load-bearing gaps via the keyless arXiv/Crossref/OpenAlex APIs (the mode for drafts with thin or no bibliography); the anti-fabrication rule is absolute in every mode (no `\cite` outside the ledger, nothing in the ledger unverified, gaps recorded rather than papered over — never a citation from model memory). **Positioning gets one home:** the epilogue chapter (flagged `positioning: true`) carries a "Context and positioning" section — the result vs the research literature AND these notes vs existing expositions — plus the new **archetype L literature-map figure** (twelfth archetype, compile- and render-verified), nodes keyed to the ledger; the Preface and Section I stay citation-free by design. **Gate G2 widened** to "single ground truth for numbers and citations" (fabricated references are now a gate failure; vacuously green when the notes cite nothing) — gates stay at six; citation integrity scores under Correctness, the Context section under dimensions 1/7. Assemble wires the bibliography hook (`build_all.sh` already auto-detects it); the numeric lens and final reproduction pass check `\cite` ↔ ledger ↔ bib; light mode never trims the ledger build + T1/T2 audit. Wired into both editions; contract template, new-paper checklist, scaffold master/clean.sh updated.

## 2.4.0 — 2026-07-07

**Preface: the compression telescope gets its top layer.** The Synthesis stage now ends by compressing the finished Section I into a 1-2 page **Preface**: radical zero-formula (no equations or relational math anywhere), insight-dense physical-picture prose — every claim carries its WHY — with the three-layer reading contract (Preface: retell + explain the mechanism → Section I: judge the claim → body: rebuild everything). Strict one-way compression (body → Section I → Preface, zero new claims), ~600-900 words with a hard 2-page cap, verified by a blind insight-test protocol: the verifier first reads only the Preface, writes out the mechanism as understood, then diffs against Section I to locate insight gaps. Wired into both editions; scaffold master.tex gains a front-matter hook; rubric criteria fold into dimensions 1 and 7 — gates stay at six.

## 2.3.1 — 2026-07-07

- Added `references/scaffold/clean.sh` — whitelist-based end-of-build housekeeping (removes LaTeX aux files, `_single_*` compile wrappers, root-level render PNGs, `typeset_sandbox/`, pycache/.DS_Store; always keeps sources, `numbers.md`, `code/`, `figs/`, `*.bbl`, the backup preamble, and the final PDF; dry-run by default, refuses to run outside a lecture-notes project). Wired into the workflow's final-build step, both SKILL.md editions, and the new-paper checklist.

## 2.3.0 — 2026-07-07

**Section I redesign.** The notes now open with a PRL-style standalone article, written LAST by a new **Synthesis** stage (between Assemble and Typeset in the workflow; Phase D2 in the general-agents port): physics-first storytelling with every major theorem formally stated (no proofs) in a complete logical chain, working definitions with pointers to rigorous versions, a theorem-dependency DAG figure, and reader-type reading routes. Success test: a reader of Section I alone can judge the paper's central claim. Chapters marked `synthesis: true` are skipped by drafting and synthesized from the finished book. Rubric criteria folded into the Self-containedness and Pedagogical-flow dimensions — the hard-gate set stays at six. Light mode never trims Synthesis.

## 2.2.0 — 2026-07-06

- Added `general-agents/` — a framework-neutral port of the skill in the open Agent Skills format, installable into Codex CLI (`~/.codex/skills/`) or any agent with shell + file access. The loading agent becomes the LEAD orchestrator and runs the same multi-agent build (draft / 3-lens adversarial verify / typeset / referee) by spawning worker subprocesses with file-based result passing. Adversarially reviewed against the original (16 findings fixed). The Claude Code plugin itself is unchanged.

## 2.1.1 — 2026-07-06

- Scaffold scripts now honor a `TEXBIN` environment variable in their pdflatex probe (PATH → `$TEXBIN` → MacTeX → TeX Live glob)
- Added `colortbl` to the professional preamble and both preamble specs in the workflow template — the styled results table (archetype I) now compiles under the house preambles without extra packages

## 2.1.0 — 2026-07-05

- Renamed skill and repository to `paper2notes` (previously `paper-to-lecture-notes` in the `paper2lecture-notes` repo)

## 2.0.0 — 2026-07-05

First public release, after a full multi-agent audit of the original skill (50 findings, 47 confirmed and fixed, every fix compile/render/parse-verified) plus seven enhancements:

- **Typeset phase** built into the multi-agent workflow — the professional typesetting layer is now applied, sandbox-verified, and visually inspected automatically (the workflow covers all nine procedure phases)
- **`light | full` mode knob** — cheap draft-grade first pass vs. the rubric-gated build
- **Fail-fast CONFIG guard** — unconfigured paths abort before any agent launches; all adaptation points marked `REPLACE FOR YOUR PAPER`
- **Numbers-as-figures mandate** — every load-bearing quantity must also appear in a figure or typeset table, enforced through standards, referee review, and the rubric
- **Figure archetypes 7 → 11** — added numbers-comparison figure, styled results table, pipeline diagram, and phase/regime diagram; all compile- and visually verified
- **Shipped scaffold** — verified `master.tex`, concurrency-safe `compile_one.sh`, three-pass `build_all.sh`, `check_figure.sh`, contract template, and a new-paper checklist
- **Portability** — probe-style TeX resolution (macOS/Linux), poppler notes, and a documented fallback for environments without the Workflow tool

Packaged as a standard Claude Code plugin (`.claude-plugin/plugin.json` + `skills/` layout).

## 1.0.0

Initial distillation from the original run: a terse ~11-page PRX paper (*The Mpemba Effect as Topological Frustration*) expanded into a 131-page professionally typeset lecture note. Not publicly released.
