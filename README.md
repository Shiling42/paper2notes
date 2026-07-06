# Paper to Lecture Notes

A [Claude Code](https://claude.com/claude-code) skill that expands a terse research paper — or a pile of dense notes — into **self-contained, professionally typeset lecture notes**.

Every concept is built from scratch, every theorem gets a gap-free proof, one non-degenerate worked example runs through every chapter, every quoted number traces to runnable code, and the result is gated by a 100-point acceptance rubric with six hard gates.

Distilled from a real run: a terse ~11-page PRX paper expanded into a 131-page typeset note with a clean three-pass LaTeX build.

## Installation

**Plugin (recommended)** — inside Claude Code:

```
/plugin marketplace add Shiling42/paper2notes
/plugin install paper2notes@paper2notes
```

**Manual** — copy the skill into your personal skills directory:

```bash
git clone https://github.com/Shiling42/paper2notes.git
cp -R paper2notes/skills/paper2notes ~/.claude/skills/
```

**Codex / other agent frameworks** — a framework-neutral port that runs the same
multi-agent build by spawning worker subprocesses (no Claude Code runtime needed) lives in
[`general-agents/`](general-agents/):

```bash
cp -R paper2notes/general-agents/paper2notes ~/.codex/skills/   # Codex CLI
```

## Usage

Just ask in natural language — the skill triggers on intent:

> turn this paper into self-contained lecture notes
>
> make this result readable for beginning grad students, with full proofs

Starting a fresh paper? Open [`skills/paper2notes/references/new_paper_checklist.md`](skills/paper2notes/references/new_paper_checklist.md) first — it walks through every field to adapt, including the non-degeneracy constraint for your running example.

The heavy build runs as a multi-agent pipeline (Scaffold → Example → Draft → Verify → Typeset → Figures → Referee) with two knobs:

- `mode: 'light'` — cheap first pass, draft grade;
- `mode: 'full'` (default) — the rubric-gated build.

## What's inside

```
skills/paper2notes/
├── SKILL.md                            the operator's map: a 9-phase procedure
└── references/
    ├── acceptance_rubric.md            100-point rubric + six hard gates that define "done"
    ├── typesetting_guide.md            the Palatino/tcolorbox look: layering discipline, load order
    ├── preamble_lecture_notes.tex      compile-tested professional preamble, ready to \input
    ├── figure_techniques.md            11 reusable figure archetypes + the visual-check loop
    ├── build_workflow_template.js      the multi-agent build pipeline (Claude Code Workflow tool)
    ├── new_paper_checklist.md          start here for a new paper
    └── scaffold/                       verified project templates (master.tex, build scripts, contract)
```

Design principles worth knowing before you run it:

- **One source of truth for numbers** — every quantity traces to a `numbers.md` generated and cross-checked three independent ways by runnable code.
- **Key numbers get a visual home** — load-bearing quantities must appear in a figure or typeset table, never only as inline numerals.
- **Typesetting is a non-invasive layer** — the look is applied by upgrading only the preamble, never by renaming environments.
- **Adversarial verification** — every chapter faces independent math, numerics, and pedagogy reviewers; a strict referee blocks on hard gates.

## Requirements

- TeX Live or MacTeX (`pdflatex`); `pdftoppm` from poppler for figure inspection
- Python with numpy/scipy and matplotlib for verifier code and data figures

## License

[MIT](LICENSE)
