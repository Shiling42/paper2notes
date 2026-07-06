# paper2notes — portable skill for Codex & other agents

`paper2notes/` here is a **complete, installable agent skill** in the open Agent Skills
format (`SKILL.md` + `references/` + `agents/openai.yaml`): the multi-agent lecture-notes
build, framework-neutral. The agent that loads it becomes the LEAD orchestrator and spawns
worker subprocesses (drafters, adversarial lenses, typesetter, referee) using only shell +
files — no Claude Code Workflow runtime.

## Install

**Codex CLI:**

```bash
git clone https://github.com/Shiling42/paper2notes.git
cp -R paper2notes/general-agents/paper2notes ~/.codex/skills/   # or ~/.agents/skills/
```

Restart Codex, then either let it trigger implicitly ("turn this paper into lecture
notes") or invoke explicitly: `$paper2notes` / via `/skills`.

**Any other agent framework:** point the agent at `paper2notes/SKILL.md` as its task
instructions — the skill is self-contained (§3.1 covers spawning via subagent APIs,
headless CLIs like `claude -p` / `openclaw run`, or fully sequential `MAXPAR: 1`).

**Claude Code:** don't use this port — use the real skill (`skills/paper2notes/` in this
repo) with its Workflow template; it is strictly better there (schema-validated returns,
pipelining, progress UI).

## What the LEAD does

Intake (fills the Job Card with you, fail-fast on blanks) → Scaffold → Example +
independent numeric audit → per-chapter draft ∥ 3 adversarial lenses ∥ fix → Assemble →
professional Typeset layer (sandbox-first, visual check) → figure visual pass → bounded
referee loop against the 100-pt rubric / 6 hard gates → final reproduction pass.
File-based results (`OUT/_agents/*.result.md`), dispatch-log crash recovery
(`OUT/BUILD_STATE.md`), `light|full` mode.

## Sync note

Generated from skill v2.1.1 and adversarially reviewed against it (16 findings fixed).
When the Claude Code skill updates:

```bash
rm -rf general-agents/paper2notes/references
cp -R skills/paper2notes/references general-agents/paper2notes/references
```

then re-check SKILL.md §2 (Job Card) and §4 (phase plan) against the CONFIG block and
phases of `references/build_workflow_template.js`, and re-install.
