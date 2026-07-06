# Paper to Lecture Notes

An agent skill that expands a terse research paper — or a pile of dense notes — into **self-contained, professionally typeset lecture notes**. Ships in two editions: a [Claude Code](https://claude.com/claude-code) plugin and a framework-neutral port for [Codex CLI](https://developers.openai.com/codex) and other agents.

Every concept is built from scratch, every theorem gets a gap-free proof, one non-degenerate worked example runs through every chapter, every quoted number traces to runnable code, and the result is gated by a 100-point acceptance rubric with six hard gates.

Distilled from a real run: a terse ~11-page PRX paper expanded into a 131-page typeset note with a clean three-pass LaTeX build.

## Which edition should I install?

The method, standards, and reference material are identical — pick by the agent you use:

| You use… | Install | Why this edition |
|---|---|---|
| **Claude Code** | `skills/paper2notes/` (plugin, below) | Runs the build on Claude Code's Workflow runtime: schema-validated agent returns, pipelined phases, progress UI. The best-supported edition. |
| **Codex CLI** | `general-agents/paper2notes/` | Same multi-agent build, orchestrated by Codex as lead: workers are spawned as `codex exec` subprocesses, results passed as files. |
| **Any other agent** (shell + file access) | `general-agents/paper2notes/` | Framework-neutral: works with any subagent API or headless CLI; degrades gracefully to fully sequential (`MAXPAR: 1`). |

Install **one edition per agent** — they don't conflict (different skill directories), but installing both into the same agent would duplicate triggering.

### Claude Code (plugin — recommended)

Inside Claude Code:

```
/plugin marketplace add Shiling42/paper2notes
/plugin install paper2notes@paper2notes
```

Or manually, without the plugin system:

```bash
git clone https://github.com/Shiling42/paper2notes.git
cp -R paper2notes/skills/paper2notes ~/.claude/skills/
```

### Codex CLI and other agents

```bash
git clone https://github.com/Shiling42/paper2notes.git
cp -R paper2notes/general-agents/paper2notes ~/.codex/skills/   # or ~/.agents/skills/
```

Restart Codex; trigger implicitly ("turn this paper into lecture notes") or explicitly
with `$paper2notes`. For non-Codex frameworks, point your agent at
`general-agents/paper2notes/SKILL.md` as its task instructions — see
[`general-agents/README.md`](general-agents/README.md).

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
